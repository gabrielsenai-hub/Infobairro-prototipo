package com.InfoBairro.Repository;

import com.InfoBairro.Entity.Bairro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BairroRepo extends JpaRepository<Bairro, Long> {}
