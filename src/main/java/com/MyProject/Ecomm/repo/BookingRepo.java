package com.MyProject.Ecomm.repo;

import com.MyProject.Ecomm.model.BookingModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface BookingRepo extends JpaRepository<BookingModel, Integer> {

    List<BookingModel> findByProductAddedBy(Integer adminId);

    Optional<BookingModel> findByIdAndProductAddedBy(Integer id, Integer adminId);

    void deleteByProductId(Integer productId);
}
