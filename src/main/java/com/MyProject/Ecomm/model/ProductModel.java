package com.MyProject.Ecomm.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    // ✅ CHANGED: desc -> description
    private String description;
    private String brand;

    private BigDecimal price;
    private String category;

    // ProductModel.java (Corrected to match 09/30/2025 format)
   @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "MM-dd-yyyy")
   private Date releaseDate;



    private boolean productAvailable;

    private int stockQuantity;

    private String imageName;
    private String imageType;

    @Lob
    private byte[] imageData;
}
