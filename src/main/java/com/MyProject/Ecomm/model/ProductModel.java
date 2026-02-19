package com.MyProject.Ecomm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // --- Core Vehicle Details ---

    private String name;         // Car Model Name (e.g., 'Honda City')
    private String description; // Features, details, etc.
    private String brand;      // Manufacturer (e.g., 'Honda')

    // FIX: Changed BigDecimal to double for easier mapping from JavaScript numbers
    private double dailyRentalRate; // Cost to rent per day

    private String category;    // Vehicle Type (e.g., 'Sedan', 'SUV')

    private int modelYear;      // Year the car was manufactured (Replaced 'releaseDate')
    private String fuelType;    // e.g., 'Petrol', 'Diesel'
    private int seatingCapacity;// Number of seats

    private String AvailableLocation; // Location for car collection

    // --- Image Details ---

    // --- Admin Ownership ---

    private Integer addedBy;     // adminId
    private String addedByEmail; // optional for easier filtering

    private String imageName;
    private String imageType;

    @Lob
    private byte[] imageData;

    // Total Fields: 13
}
