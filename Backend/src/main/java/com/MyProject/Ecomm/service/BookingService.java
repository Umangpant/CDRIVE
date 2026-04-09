package com.MyProject.Ecomm.service;

import com.MyProject.Ecomm.messaging.EmailEventPublisher;
import com.MyProject.Ecomm.model.BookingModel;
import com.MyProject.Ecomm.model.ReservationStatus;
import com.MyProject.Ecomm.repo.BookingRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class BookingService {

    private final BookingRepo bookingRepo;
    private final EmailEventPublisher emailEventPublisher;

    public BookingService(BookingRepo bookingRepo,
                          EmailEventPublisher emailEventPublisher) {
        this.bookingRepo = bookingRepo;
        this.emailEventPublisher = emailEventPublisher;
    }

    public List<BookingModel> getBookingsByAdmin(Integer adminId) {
        return bookingRepo.findVisibleBookingsForAdmin(adminId);
    }

    @Transactional
    public BookingModel createBooking(BookingModel booking) {
        if (booking.getStatus() == null) {
            booking.setStatus(ReservationStatus.PENDING);
        }
        return bookingRepo.save(booking);
    }

    public void deleteBookingsByProductId(Integer productId) {
        bookingRepo.deleteByProductId(productId);
    }

    public boolean deleteBookingByIdForAdmin(Integer bookingId, Integer adminId) {
        return bookingRepo.findVisibleByIdForAdmin(bookingId, adminId)
                .map(booking -> {
                    bookingRepo.deleteById(booking.getId());
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public BookingModel approveReservation(Integer reservationId, Integer adminId) {
        BookingModel reservation = bookingRepo.findVisibleByIdForAdmin(reservationId, adminId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.APPROVED) {
            return reservation;
        }

        reservation.setStatus(ReservationStatus.APPROVED);
        BookingModel savedReservation = bookingRepo.save(reservation);
        emailEventPublisher.publishReservationApproved(savedReservation);
        return savedReservation;
    }
}
