package com.MyProject.Ecomm.controller;

import com.MyProject.Ecomm.model.BookingModel;
import com.MyProject.Ecomm.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody BookingModel booking) {
        if (booking.getProductId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("productId is required");
        }
        if (booking.getNumberOfDays() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("numberOfDays must be at least 1");
        }
        if (booking.getBookingDate() == null) {
            booking.setBookingDate(LocalDate.now());
        }
        BookingModel saved = bookingService.createBooking(booking);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}
