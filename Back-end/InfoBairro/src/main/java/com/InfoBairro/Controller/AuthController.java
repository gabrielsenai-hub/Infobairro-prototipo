package com.InfoBairro.Controller;

import com.InfoBairro.Entity.Bairro;
import com.InfoBairro.Entity.Endereco;
import com.InfoBairro.Entity.User;
import com.InfoBairro.Repository.BairroRepo;
import com.InfoBairro.Repository.EnderecoRepo;
import com.InfoBairro.Repository.UserRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepo userRepo;
    private final EnderecoRepo enderecoRepo;
    private final BairroRepo bairroRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepo userRepo, EnderecoRepo enderecoRepo, BairroRepo bairroRepository) {
        this.userRepo = userRepo;
        this.enderecoRepo = enderecoRepo;
        this.bairroRepository = bairroRepository;
    }
    // -----------------------
    // Chamada dos bairros
    // -----------------------

    @GetMapping("/bairros")
    public List<Bairro> listar() {
        return bairroRepository.findAll();
    }

    // -----------------------
    // Cadastro comum
    // -----------------------

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO req) {
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body("Email já cadastrado"); // 409 Conflict
        }

        // cria ou reutiliza endereço
        Endereco endereco = enderecoRepo.findByRuaAndCepAndBairro(
                req.getRua(), req.getCep(), req.getBairro()
        ).orElseGet(() -> {
            Endereco e = new Endereco();
            e.setRua(req.getRua());
            e.setCep(req.getCep());
            e.setBairro(req.getBairro());
            return enderecoRepo.save(e);
        });

        // cria usuário com hash de senha
        User usuario = new User();
        usuario.setNome(req.getNome());
        usuario.setEmail(req.getEmail());
        usuario.setSenha(passwordEncoder.encode(req.getSenha()));
        usuario.setEndereco(endereco);

        if (req.getEmail().equals("ogabriel292@gmail.com") ||
                req.getEmail().equals("gabriel.o.silva8@ba.estudante.senai.br")) {
            usuario.setAdmin(true);
        }
        userRepo.save(usuario);

        return ResponseEntity.status(201).body("Cadastro realizado com sucesso!"); // 201 Created
    }

    // -----------------------
    // Login comum
    // -----------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO req) {

        Optional<User> optionalUsuario = userRepo.findByEmail(req.getEmail());
        if (optionalUsuario.isEmpty()) {
            return ResponseEntity.status(404).body("Usuário não encontrado"); // 404 Not Found
        }

        User usuario = optionalUsuario.get();

        if (!passwordEncoder.matches(req.getSenha(), usuario.getSenha())) {
            return ResponseEntity.status(401).body("Senha incorreta"); // 401 Unauthorized
        }

        // Retorna dados do usuário sem senha
        UserResponseDTO response = new UserResponseDTO(
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getEndereco() != null ? usuario.getEndereco().getRua() : null,
                usuario.getEndereco() != null ? usuario.getEndereco().getBairro() : null,
                usuario.getEndereco() != null ? usuario.getEndereco().getCidade() : null,
                usuario.getEndereco() != null ? usuario.getEndereco().getCep() : null

        );

        return ResponseEntity.ok(response); // 200 OK
    }

    // -----------------------
    // Login / cadastro OAuth2
    // -----------------------
    @GetMapping("/user")
    public ResponseEntity<?> oauth2User(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return ResponseEntity.status(401).body("Usuário não autenticado via OAuth2");

        String email = principal.getAttribute("email");
        if (email == null) return ResponseEntity.status(400).body("Email não disponível no OAuth2");

        User usuario = userRepo.findByEmail(email)
                .orElseGet(() -> {
                    User novo = new User();
                    novo.setEmail(email);
                    novo.setNome(principal.getAttribute("name"));
                    if (email.equals("ogabriel292@gmail.com") ||
                            email.equals("gabriel.o.silva8@ba.estudante.senai.br")) {
                        novo.setAdmin(true);
                    }
                    return userRepo.save(novo);
                });

        if ((email.equals("ogabriel292@gmail.com") || email.equals("gabriel.o.silva8@ba.estudante.senai.br"))
                && !usuario.isAdmin()) {
            usuario.setAdmin(true);
            userRepo.save(usuario);
        }

        Endereco endereco = usuario.getEndereco();

        UserResponseDTO dto = new UserResponseDTO(
                usuario.getNome(),
                usuario.getEmail(),
                endereco != null ? endereco.getRua() : null,
                endereco != null ? endereco.getBairro() : null,
                endereco != null ? endereco.getCidade() : null,
                endereco != null ? endereco.getCep() : null,
                principal.getAttribute("picture"),
                usuario.isAdmin()
        );

        return ResponseEntity.ok(dto);
    }

    // -----------------------
    // Complemento de cadastro OAuth2
    // -----------------------
    @PostMapping("/user/complemento")
    public ResponseEntity<?> completarCadastro(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody Endereco novoEndereco) {

        if (principal == null) return ResponseEntity.status(401).body("Usuário não autenticado via OAuth2");

        String email = principal.getAttribute("email");
        if (email == null) return ResponseEntity.status(400).body("Email não disponível no OAuth2");

        Optional<User> optionalUsuario = userRepo.findByEmail(email);
        if (optionalUsuario.isEmpty()) {
            return ResponseEntity.status(404).body("Usuário não encontrado");
        }

        User usuario = optionalUsuario.get();

        // verifica se endereço já existe
        Endereco endereco = enderecoRepo.findByRuaAndCepAndBairro(
                novoEndereco.getRua(), novoEndereco.getCep(), novoEndereco.getBairro()
        ).orElseGet(() -> enderecoRepo.save(novoEndereco));

        usuario.setEndereco(endereco);
        userRepo.save(usuario);

        return ResponseEntity.ok("Cadastro complementado com sucesso!");
    }

    // -----------------------
    // DTOs
    // -----------------------
    public static class RegisterDTO {
        private String nome;
        private String email;
        private String senha;
        private String rua;
        private String cep;
        private String bairro;

        // getters e setters...
        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getSenha() {
            return senha;
        }

        public void setSenha(String senha) {
            this.senha = senha;
        }

        public String getRua() {
            return rua;
        }

        public void setRua(String rua) {
            this.rua = rua;
        }

        public String getCep() {
            return cep;
        }

        public void setCep(String cep) {
            this.cep = cep;
        }

        public String getBairro() {
            return bairro;
        }

        public void setBairro(String bairro) {
            this.bairro = bairro;
        }
    }

    public static class LoginDTO {
        private String email;
        private String senha;

        // getters e setters
        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getSenha() {
            return senha;
        }

        public void setSenha(String senha) {
            this.senha = senha;
        }
    }

    public static class UserResponseDTO {
        private String nome;
        private String email;
        private String rua;
        private String bairro;
        private String cidade;
        private String cep;
        private String foto; // OAuth2
        private boolean admin; // 🔹 novo campo

        public UserResponseDTO(String nome, String email, String rua, String bairro, String cidade, String cep) {
            this.nome = nome;
            this.email = email;
            this.rua = rua;
            this.bairro = bairro;
            this.cidade = cidade;
            this.cep = cep;
        }

        public UserResponseDTO(String nome, String email, String rua, String bairro, String cidade, String cep, String foto, boolean admin {
            this(nome, email, rua, bairro, cidade, cep);
            this.foto = foto;
            this.admin = admin;
        }

        // getters e setters
        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRua() {
            return rua;
        }

        public void setRua(String rua) {
            this.rua = rua;
        }

        public String getBairro() {
            return bairro;
        }

        public void setBairro(String bairro) {
            this.bairro = bairro;
        }

        public String getCidade() {
            return cidade;
        }

        public void setCidade(String cidade) {
            this.cidade = cidade;
        }

        public String getCep() {
            return cep;
        }

        public void setCep(String cep) {
            this.cep = cep;
        }

        public String getFoto() {
            return foto;
        }

        public void setFoto(String foto) {
            this.foto = foto;
        }

        public boolean isAdmin() {
            return admin;
        }

        public void setAdmin(boolean admin) {
            this.admin = admin;
        }
    }
}
