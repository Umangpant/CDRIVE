package com.MyProject.Ecomm.repo;

import com.MyProject.Ecomm.model.BookingModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface BookingRepo extends JpaRepository<BookingModel, Integer> {

    @Query("""
            SELECT b
            FROM BookingModel b
            LEFT JOIN FETCH b.product p
            WHERE p IS NOT NULL
              AND p.addedBy = :adminId
            ORDER BY b.id DESC
            """)
    List<BookingModel> findVisibleBookingsForAdmin(@Param("adminId") Integer adminId);

    @Query("""
            SELECT b
            FROM BookingModel b
            LEFT JOIN FETCH b.product p
            WHERE b.id = :id
              AND p IS NOT NULL
              AND p.addedBy = :adminId
            """)
    Optional<BookingModel> findVisibleByIdForAdmin(@Param("id") Integer id,
                                                   @Param("adminId") Integer adminId);

    void deleteByProductId(Integer productId);
}
