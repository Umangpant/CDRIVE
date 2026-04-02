package com.MyProject.Ecomm.controller;

import com.MyProject.Ecomm.model.ProductModel;
import com.MyProject.Ecomm.security.AuthenticatedUserFacade;
import com.MyProject.Ecomm.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ProjectController {
    private final ProductService productService;
    private final AuthenticatedUserFacade authenticatedUserFacade;

    @Autowired
    public ProjectController(ProductService productService,
                             AuthenticatedUserFacade authenticatedUserFacade) {
        this.productService = productService;
        this.authenticatedUserFacade = authenticatedUserFacade;
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductModel>> getAllProducts() {
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/products/{pathId}")
    public ResponseEntity<ProductModel> getProductById(@PathVariable int pathId) {
        Optional<ProductModel> productOptional = productService.getProductById(pathId);
        return productOptional
                .map(product -> new ResponseEntity<>(product, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/products")
    public ResponseEntity<?> addProduct(@RequestPart ProductModel product,
                                        @RequestPart MultipartFile imageFile) {
        try {
            product.setAddedBy(authenticatedUserFacade.getCurrentUserId());
            product.setAddedByEmail(authenticatedUserFacade.getCurrentUserEmail());

            ProductModel savedProduct = productService.addOrUpdateProduct(product, imageFile);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/products/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable int productId) {
        ProductModel product = productService.getProduct(productId);
        byte[] imageFile = product.getImageData();

        return ResponseEntity.ok().contentType(MediaType.valueOf(product.getImageType())).body(imageFile);
    }

    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductIdAlt(@PathVariable int productId) {
        return getImageByProductId(productId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/products/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable int id,
                                                @RequestPart ProductModel product,
                                                @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        Optional<ProductModel> existingProduct = productService.getProductById(id);
        if (existingProduct.isEmpty()) {
            return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
        }

        enforceAdminOwnership(existingProduct.get());
        product.setAddedBy(authenticatedUserFacade.getCurrentUserId());
        product.setAddedByEmail(authenticatedUserFacade.getCurrentUserEmail());

        ProductModel updatedProduct;
        try {
            updatedProduct = productService.updateProduct(id, product, imageFile);
        } catch (IOException e) {
            return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
        }

        if (updatedProduct != null) {
            return new ResponseEntity<>("updated", HttpStatus.OK);
        }
        return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id) {
        Optional<ProductModel> existingProduct = productService.getProductById(id);
        if (existingProduct.isEmpty()) {
            return new ResponseEntity<>("FAILED TO DELETE: Product not found.", HttpStatus.NOT_FOUND);
        }

        enforceAdminOwnership(existingProduct.get());

        boolean deleted = productService.deleteProduct(id);
        if (deleted) {
            return new ResponseEntity<>("DELETED", HttpStatus.OK);
        }
        return new ResponseEntity<>("FAILED TO DELETE: Product not found.", HttpStatus.NOT_FOUND);
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<ProductModel>> searchProducts(@RequestParam String keyword) {
        System.out.println("Searching with keyword: " + keyword);
        List<ProductModel> products = productService.searchProducts(keyword);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    private void enforceAdminOwnership(ProductModel product) {
        Integer productOwnerId = product.getAddedBy();
        if (productOwnerId != null && !productOwnerId.equals(authenticatedUserFacade.getCurrentUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }
}
