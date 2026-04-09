package com.MyProject.Ecomm.controller;

import com.MyProject.Ecomm.model.BookingModel;
import com.MyProject.Ecomm.security.AuthenticatedUserFacade;
import com.MyProject.Ecomm.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {

    private final BookingService bookingService;
    private final AuthenticatedUserFacade authenticatedUserFacade;

    public ReservationController(BookingService bookingService,
                                 AuthenticatedUserFacade authenticatedUserFacade) {
        this.bookingService = bookingService;
        this.authenticatedUserFacade = authenticatedUserFacade;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<BookingModel> approveReservation(@PathVariable Integer id) {
        BookingModel approvedReservation =
                bookingService.approveReservation(id, authenticatedUserFacade.getCurrentUserId());
        return ResponseEntity.ok(approvedReservation);
    }
}
