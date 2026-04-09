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
    private String description;  // Features, details, etc.
    private String brand;        // Manufacturer (e.g., 'Honda')

    private double dailyRentalRate; // Cost to rent per day

    private String category;    // Vehicle Type (e.g., 'Sedan', 'SUV')

    @Column(name = "product_available", nullable = false)
    private boolean productAvailable = true;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity = 0;

    private int modelYear;      // Year the car was manufactured

    private String fuelType;    // e.g., 'Petrol', 'Diesel'
    private int seatingCapacity;// Number of seats

    private String availableLocation; // Location for car collection

    // --- Image Details ---
    private String imageName;
    private String imageType;

    @Lob
    private byte[] imageData;

    // --- Admin Ownership ---
    private Integer addedBy;     // adminId
    private String addedByEmail; // optional for easier filtering
}