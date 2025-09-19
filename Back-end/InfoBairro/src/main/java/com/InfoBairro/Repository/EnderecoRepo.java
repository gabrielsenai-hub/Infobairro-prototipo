package com.InfoBairro.Repository;

import com.InfoBairro.Entity.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnderecoRepo extends JpaRepository<Endereco, Long> {
    Optional<Endereco> findByRuaAndCepAndBairro(String rua, String cep, String bairro);
}
