package com.MyProject.Ecomm.controller;

import com.MyProject.Ecomm.model.BookingModel;
import com.MyProject.Ecomm.model.ProductModel;
import com.MyProject.Ecomm.service.BookingService;
import com.MyProject.Ecomm.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.MyProject.Ecomm.security.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final ProductService productService;
    private final BookingService bookingService;

    @Autowired
    public AdminController(ProductService productService, BookingService bookingService) {
        this.productService = productService;
        this.bookingService = bookingService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/products/{adminId}")
    public ResponseEntity<List<ProductModel>> getProductsByAdmin(@PathVariable Integer adminId) {
        enforceAdminOwnership(adminId);
        return new ResponseEntity<>(productService.getProductsByAdmin(adminId), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/bookings/{adminId}")
    public ResponseEntity<List<BookingModel>> getBookingsByAdmin(@PathVariable Integer adminId) {
        enforceAdminOwnership(adminId);
        return new ResponseEntity<>(bookingService.getBookingsByAdmin(adminId), HttpStatus.OK);
    }

    // Optional: safer endpoints without adminId in the URL
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/products")
    public ResponseEntity<List<ProductModel>> getMyProducts() {
        Integer adminId = getAuthenticatedAdminId();
        return new ResponseEntity<>(productService.getProductsByAdmin(adminId), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingModel>> getMyBookings() {
        Integer adminId = getAuthenticatedAdminId();
        return new ResponseEntity<>(bookingService.getBookingsByAdmin(adminId), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<String> deleteBooking(@PathVariable Integer bookingId) {
        Integer adminId = getAuthenticatedAdminId();
        boolean deleted = bookingService.deleteBookingByIdForAdmin(bookingId, adminId);
        if (deleted) {
            return new ResponseEntity<>("DELETED", HttpStatus.OK);
        }
        return new ResponseEntity<>("NOT_FOUND", HttpStatus.NOT_FOUND);
    }

    private void enforceAdminOwnership(Integer adminId) {
        Integer currentAdminId = getAuthenticatedAdminId();
        if (!currentAdminId.equals(adminId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private Integer getAuthenticatedAdminId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            Long id = userPrincipal.getId();
            return Math.toIntExact(id);
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
}
