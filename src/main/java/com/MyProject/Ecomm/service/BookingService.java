package com.MyProject.Ecomm.service;

import com.MyProject.Ecomm.model.BookingModel;
import com.MyProject.Ecomm.repo.BookingRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepo bookingRepo;

    @Autowired
    public BookingService(BookingRepo bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    public List<BookingModel> getBookingsByAdmin(Integer adminId) {
        return bookingRepo.findByProductAddedBy(adminId);
    }

    public BookingModel createBooking(BookingModel booking) {
        return bookingRepo.save(booking);
    }

    public void deleteBookingsByProductId(Integer productId) {
        bookingRepo.deleteByProductId(productId);
    }

    public boolean deleteBookingByIdForAdmin(Integer bookingId, Integer adminId) {
        return bookingRepo.findByIdAndProductAddedBy(bookingId, adminId)
                .map(booking -> {
                    bookingRepo.deleteById(booking.getId());
                    return true;
                })
                .orElse(false);
    }
}
