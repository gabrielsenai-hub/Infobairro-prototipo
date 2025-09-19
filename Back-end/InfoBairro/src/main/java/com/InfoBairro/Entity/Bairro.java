package com.InfoBairro.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "bairros")
public class Bairro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (nullable = false)
    private String nome;
    @Column (nullable = false)
    private Double latitude;
    @Column (nullable = false)
    private Double longitude;

    @Column (nullable = false)
    private Integer notaGeral;

    @Column (nullable = true)
    private Integer seguranca;

    @Column (nullable = true)
    private Integer transporte;

    @Column (nullable = true)
    private Integer infraestrutura;

    @Column (nullable = true)
    private Integer educacao;

    @Column (nullable = true)
    private Integer saude;

    @Column (nullable = true)
    private Integer comercio;

    @Column (nullable = true)
    private Integer lazer;


    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Integer getNotaGeral() {
        return notaGeral;
    }

    public void setNotaGeral(Integer notaGeral) {
        this.notaGeral = notaGeral;
    }

    public Integer getSeguranca() {
        return seguranca;
    }

    public void setSeguranca(Integer seguranca) {
        this.seguranca = seguranca;
    }

    public Integer getTransporte() {
        return transporte;
    }

    public void setTransporte(Integer transporte) {
        this.transporte = transporte;
    }

    public Integer getInfraestrutura() {
        return infraestrutura;
    }

    public void setInfraestrutura(Integer infraestrutura) {
        this.infraestrutura = infraestrutura;
    }

    public Integer getEducacao() {
        return educacao;
    }

    public void setEducacao(Integer educacao) {
        this.educacao = educacao;
    }

    public Integer getSaude() {
        return saude;
    }

    public void setSaude(Integer saude) {
        this.saude = saude;
    }

    public Integer getComercio() {
        return comercio;
    }

    public void setComercio(Integer comercio) {
        this.comercio = comercio;
    }

    public Integer getLazer() {
        return lazer;
    }

    public void setLazer(Integer lazer) {
        this.lazer = lazer;
    }
}
