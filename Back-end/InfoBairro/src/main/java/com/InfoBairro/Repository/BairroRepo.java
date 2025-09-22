package com.InfoBairro.Repository;

import com.InfoBairro.Entity.Bairro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BairroRepo extends JpaRepository<Bairro, Long> {
    Optional<Bairro> findByNome(String nome);

}
