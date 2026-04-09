package com.MyProject.Ecomm.service;

import com.MyProject.Ecomm.model.ProductModel;
import com.MyProject.Ecomm.repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepo repo;
    private final BookingService bookingService;

    @Autowired
    public ProductService(ProductRepo repo, BookingService bookingService) {
        this.repo = repo;
        this.bookingService = bookingService;
    }

    // 1. Get all products (cars)
    public List<ProductModel> getAllProducts() {
        return repo.findAll();
    }

    // Admin: Get products by adminId
    public List<ProductModel> getProductsByAdmin(Integer adminId) {
        return repo.findByAddedBy(adminId);
    }

    // 2. Get product (car) by ID
    public Optional<ProductModel> getProductById(int prodId) {
        return repo.findById(prodId);
    }

    // 3. Insert product (handles image)
    public ProductModel addOrUpdateProduct(ProductModel product, MultipartFile image) throws IOException {
        // Only set image data if a file is provided and not empty
        if (image != null && !image.isEmpty()) {
            product.setImageName(image.getOriginalFilename());
            product.setImageType(image.getContentType());
            product.setImageData(image.getBytes());
        }

        return repo.save(product);
    }
    
    // Get the image
    public ProductModel getProduct(int id) {
        return repo.findById(id).orElse(null);
    }

    // 4. Update product (handles image and all car fields)
    public ProductModel updateProduct(int prodId, ProductModel productDetails, MultipartFile imageFile) throws IOException {
        Optional<ProductModel> existing = repo.findById(prodId);

        if (existing.isPresent()) {
            ProductModel existingProduct = existing.get();

            // --- Updated Car Rental Fields with Correct Lombok Getters/Setters ---
            
            existingProduct.setName(productDetails.getName());
            existingProduct.setDescription(productDetails.getDescription());
            existingProduct.setBrand(productDetails.getBrand());
            
            // ✅ CORRECTED: Using setDailyRentalRate and getDailyRentalRate (Replaced 'price')
            existingProduct.setDailyRentalRate(productDetails.getDailyRentalRate());
            
            existingProduct.setCategory(productDetails.getCategory());
            existingProduct.setProductAvailable(productDetails.isProductAvailable());
            existingProduct.setStockQuantity(productDetails.getStockQuantity());
            
            // ✅ CORRECTED: Using setModelYear and getModelYear (Replaced 'releaseDate')
            existingProduct.setModelYear(productDetails.getModelYear());
            
            // ✅ CORRECTED: Using setFuelType and getFuelType (Replaced 'productAvailable')
            existingProduct.setFuelType(productDetails.getFuelType());
            
            // ✅ CORRECTED: Using setSeatingCapacity and getSeatingCapacity (Replaced 'stockQuantity')
            existingProduct.setSeatingCapacity(productDetails.getSeatingCapacity());
            
            // ✅ CORRECTED: Using setAvailableLocation and getAvailableLocation (Replaced 'transmissionType')
            existingProduct.setAvailableLocation(productDetails.getAvailableLocation());
            existingProduct.setAddedBy(productDetails.getAddedBy());
            existingProduct.setAddedByEmail(productDetails.getAddedByEmail());


            // Update image data only if a new file is provided
            if (imageFile != null && !imageFile.isEmpty()) {
                existingProduct.setImageName(imageFile.getOriginalFilename());
                existingProduct.setImageType(imageFile.getContentType());
                existingProduct.setImageData(imageFile.getBytes());
            }

            return repo.save(existingProduct);
        }
        return null;
    }

    // 5. Delete product (car) by ID
    public boolean deleteProduct(int prodId) {
        if (repo.existsById(prodId)) {
            bookingService.deleteBookingsByProductId(prodId);
            repo.deleteById(prodId);
            return true;
        }
        return false;
    }

    // 6. Search products (cars)
    public List<ProductModel> searchProducts(String keyword) {
        return repo.searchProducts(keyword);
    }
}
