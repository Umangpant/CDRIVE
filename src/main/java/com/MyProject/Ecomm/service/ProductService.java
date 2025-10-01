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

    @Autowired
    public ProductService(ProductRepo repo) {
        this.repo = repo;
    }

    // 1. Get all products
    public List<ProductModel> getAllProducts() {
        return repo.findAll();
    }

    // 2. Get product by ID
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
    //get the image
    public ProductModel getProduct(int id) {
        return repo.findById(id).orElse(null);
    }

    // 4. Update product (handles image)
    public ProductModel updateProduct(int prodId, ProductModel productDetails, MultipartFile imageFile) throws IOException {
        Optional<ProductModel> existing = repo.findById(prodId);

        if (existing.isPresent()) {
            ProductModel existingProduct = existing.get();

            // ✅ UPDATED: Used getters/setters for 'description', 'productAvailable', 'stockQuantity'
            existingProduct.setName(productDetails.getName());
            existingProduct.setDescription(productDetails.getDescription());
            existingProduct.setBrand(productDetails.getBrand());
            existingProduct.setPrice(productDetails.getPrice());
            existingProduct.setCategory(productDetails.getCategory());
            existingProduct.setReleaseDate(productDetails.getReleaseDate());
            existingProduct.setProductAvailable(productDetails.isProductAvailable());
            existingProduct.setStockQuantity(productDetails.getStockQuantity());

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

    // 5. Delete product by ID
    public boolean deleteProduct(int prodId) {
        if (repo.existsById(prodId)) {
            repo.deleteById(prodId);
            return true;
        }
        return false;
    }

    // 6. Search products
    public List<ProductModel> searchProducts(String keyword) {
        return repo.searchProducts(keyword);
    }
}