package com.MyProject.Ecomm.controller;
import com.MyProject.Ecomm.model.ProductModel;
import com.MyProject.Ecomm.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin // Prevents CORS issues between frontend and backend
public class ProjectController {

    private final ProductService productService;

    @Autowired
    public ProjectController(ProductService productService) {
        this.productService = productService;
    }

    // 1. Get all products
    @GetMapping("/products")
    public ResponseEntity<List<ProductModel>> getAllProducts() {
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
    }

    // 2. Get product by ID
    @GetMapping("/products/{pathId}")
    public ResponseEntity<ProductModel>
    getProductById(@PathVariable int pathId) {
        Optional<ProductModel> productOptional = productService.getProductById(pathId);
        return productOptional
                .map(product -> new ResponseEntity<>(product, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // 3. Add new product (handles both text and image parts)
    @PostMapping("/products")
    public ResponseEntity<?>  addProduct(@RequestPart ProductModel product, @RequestPart MultipartFile imageFile) {
        try {
            ProductModel product1 = productService.addOrUpdateProduct(product, imageFile);
            return new ResponseEntity<>(product1, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 4. Get product image by ID

    @GetMapping("/products/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable int productId) {
        ProductModel product = productService.getProduct(productId);
        byte[] imageFile = product.getImageData();

        return ResponseEntity.ok().contentType(MediaType.valueOf(product.getImageType())).body(imageFile);
    }
    //alternate mapping for prouct req

   @GetMapping("/product/{productId}/image")
   public ResponseEntity<byte[]> getImageByProductIdAlt(@PathVariable int productId) {
       return getImageByProductId(productId);
   }
    // 5. Update product by ID
    @PutMapping("/products/{id}")
    public ResponseEntity<String>
    updateProduct(@PathVariable int id, @RequestPart ProductModel product, @RequestPart MultipartFile imageFile) {

        ProductModel product1 = null;
        try {
            product1 = productService.updateProduct(id, product, imageFile);
        } catch (IOException e) {
            return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
        }
        if (product1 != null) {
            return new ResponseEntity<>("updated", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
        }
    }
    // 6. Delete product by ID
    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id) {
        boolean deleted = productService.deleteProduct(id);
        if (deleted) {
            return new ResponseEntity<>("DELETED", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("FAILED TO DELETE: Product not found.", HttpStatus.NOT_FOUND);
        }
    }
    // 7. Search products by keyword
    @GetMapping("/products/search")
    public ResponseEntity<List<ProductModel>> searchProducts(@RequestParam String keyword) {
        System.out.println("Searching with keyword: " + keyword);
        List<ProductModel> products = productService.searchProducts(keyword);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
}