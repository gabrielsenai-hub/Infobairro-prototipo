package com.InfoBairro.Entity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table (name = "Endereco")

public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idEndereco;

    @Column (nullable = false, length = 9)
    private String cep;

    @Column (nullable = false, length = 15)
    private String bairro;

    @Column (nullable = false, length = 50)
    private String rua;

    @Column (nullable = false, length = 30)
    private String cidade;

    @OneToMany(mappedBy = "endereco")
    private List<User> usuarios = new ArrayList<>();

    @Embedded
    private Coordenada coordenada;

    public long getIdEndereco() {
        return idEndereco;
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

    public String getRua() {
        return rua;
    }

    public void setRua(String rua) {
        this.rua = rua;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public List<User> getUsuarios() {
        return usuarios;
    }

    public Coordenada getCoordenada() {
        return coordenada;
    }

    public void setCoordenada(Coordenada coordenada) {
        this.coordenada = coordenada;
    }
}
