package com.MyProject.Ecomm.repo;

import com.MyProject.Ecomm.model.PasswordResetToken;
import com.MyProject.Ecomm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    void deleteByUser(User user);
}
