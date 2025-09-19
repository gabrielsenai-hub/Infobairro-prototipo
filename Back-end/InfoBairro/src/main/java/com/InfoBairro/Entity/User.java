package com.InfoBairro.Entity;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table (name = "Usuario")
public class User {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private long idUsuario;

    @Column (nullable = false)
    private String nome;

    @Column (nullable = false)
    private String email;

    @Column (nullable = false)
    private String senha;

    @Column (nullable = false)
    private LocalDate data_nascimento;

    @Column (nullable = false)
    private LocalDateTime registro_cadastro;

    @Column (nullable = true)
    private Boolean admin;

    @PrePersist
    protected void onCreate(){
        this.registro_cadastro = LocalDateTime.now();
    }

    @ManyToOne
    @JoinColumn(name = "idEndereco")
    private Endereco endereco;

    public long getIdUsuario() {
        return idUsuario;
    }

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

    public Endereco getEndereco() {
        return endereco;
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
    }

    public LocalDate getData_nascimento() {
        return data_nascimento;
    }

    public void setData_nascimento(LocalDate data_nascimento) {
        this.data_nascimento = data_nascimento;
    }

    public LocalDateTime getRegistro_cadastro() {
        return registro_cadastro;
    }

    public void setRegistro_cadastro(LocalDateTime registro_cadastro) {
        this.registro_cadastro = registro_cadastro;
    }

    public Boolean getAdmin() {
        return admin;
    }

    public void setAdmin(Boolean admin) {
        this.admin = admin;
    }
}
