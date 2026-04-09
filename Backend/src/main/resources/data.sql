
 -- Seed default cars without wiping admin-added data
 INSERT IGNORE INTO product_model ( id, brand, category, daily_rental_rate, description, fuel_type, image_data, image_name, image_type, model_year, name, available_location, seating_capacity ) VALUES
 (1, 'Maruti', 'Hatchback', 1500, 'Sporty hatchback with agile handling, perfect for city commutes and great mileage.', 'Petrol', NULL, 'swift.webp', 'image/webp', 2022, 'Swift', 'Delhi', 5),
 (2, 'Maruti', 'Hatchback', 1400, 'Tall-boy design offering superior headroom, known for its fuel efficiency and reliable engine.', 'Petrol', NULL, 'wagnor.webp', 'image/webp', 2021, 'WagonR', 'Mumbai', 5),
 (3, 'Toyota', 'SUV', 3500, 'A legendary, rugged SUV built for off-roading, featuring a powerful Diesel engine and 4x4 capabilities.', 'Diesel', NULL, 'fortuner.png', 'image/png', 2023, 'Fortuner', 'Bangalore', 7),
 (4, 'Tata', 'SUV', 2200, 'India’s safest compact SUV with a 5-star safety rating, turbo-petrol performance, and premium interiors.', 'Petrol', NULL, 'nexon.webp', 'image/webp', 2022, 'Nexon', 'Chennai', 5),
 (5, 'Toyota', 'SUV', 3000, 'Advanced Hybrid technology offering exceptional mileage, sleek urban design, and spacious cabin comfort.', 'Hybrid', NULL, 'hyryder.webp', 'image/webp', 2023, 'Hyryder', 'Pune', 5),
 (6, 'Tata', 'SUV', 2000, 'The Micro SUV champion, boasting high ground clearance, a commanding view, and excellent city maneuverability.', 'Petrol', NULL, 'punch.webp', 'image/webp', 2022, 'Punch', 'Hyderabad', 5);
