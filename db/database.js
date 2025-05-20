const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath);

// Create Users table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    `);

    // Create Products table with price column added
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT NOT NULL,
            price REAL NOT NULL DEFAULT 0.00
        );
    `);
    
    // Create cart_items table
    db.run(`
         CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            size TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

    // Seed 12 products if table is empty
    db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO products (name, description, image_url, price)
                VALUES (?, ?, ?, ?)
            `);
            for (let i = 1; i <= 12; i++) {
                stmt.run(
                    `Product ${i}`,
                    `This is a great product number ${i}. Highly recommended!`,
                    `/images/Product${i}.png`,  // Use local image paths
                    (Math.random() * 50 + 10).toFixed(2)  // Random price between $10 and $60
                );
            }
            stmt.finalize();
        }
    });

    // FIXED: Add price column if it doesn't exist (for existing databases)
    db.all("PRAGMA table_info(products)", (err, rows) => {
        if (err) {
            console.error("Error checking table structure:", err);
            return;
        }
        
        // Check if price column exists using Array.find instead of some
        let hasPriceColumn = false;
        if (Array.isArray(rows)) {
            hasPriceColumn = rows.some(row => row.name === 'price');
        } else {
            // If rows is not an array, try a different approach
            console.log("PRAGMA result format unexpected, checking differently");
            hasPriceColumn = false; // Assume price doesn't exist, it's safer
        }
        
        if (!hasPriceColumn) {
            console.log("Adding missing price column to products table");
            db.run("ALTER TABLE products ADD COLUMN price REAL NOT NULL DEFAULT 0.00", (err) => {
                if (err) {
                    console.error("Error adding price column:", err);
                    return;
                }
                
                // Update existing products with random prices
                db.run(`UPDATE products SET price = ROUND((RANDOM() * 50 + 10), 2) WHERE price = 0`, (err) => {
                    if (err) console.error("Error updating prices:", err);
                    else console.log("Updated prices for existing products");
                });
            });
        }
    });

    // Add size column to cart_items if it doesn't exist
    db.all("PRAGMA table_info(cart_items)", (err, rows) => {
        if (err) {
            console.error("Error checking cart_items table structure:", err);
            return;
        }
        
        // Check if size column exists
        let hasSizeColumn = false;
        if (Array.isArray(rows)) {
            hasSizeColumn = rows.some(row => row.name === 'size');
        } else {
            console.log("PRAGMA result format unexpected, checking differently");
            hasSizeColumn = false; // Assume size doesn't exist, it's safer
        }
        
        if (!hasSizeColumn) {
            console.log("Adding size column to cart_items table");
            db.run("ALTER TABLE cart_items ADD COLUMN size TEXT", (err) => {
                if (err) {
                    console.error("Error adding size column:", err);
                    return;
                } else {
                    console.log("Size column added successfully to cart_items table");
                }
            });
        }
    });

    // Fix product descriptions with proper quoting
    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit Keychain',
            description = 'Sleek and durable keychain featuring our logo. Made from high-quality materials that will last through daily use and intense workouts.'
        WHERE id = 10
    `, function(err) {
        if (err) console.error('Error updating keychain description:', err);
    });

    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit Duffel Bag',
            description = 'Spacious gym duffel with dedicated compartments for shoes, wet items, and valuables. Features comfortable shoulder straps and durable water-resistant material.'
        WHERE id = 11
    `, function(err) {
        if (err) console.error('Error updating duffel bag description:', err);
    });

    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit Long Sleeve',
            description = 'Performance long sleeve shirt with moisture-wicking fabric and UPF 50+ sun protection. Perfect for outdoor workouts or layering in colder weather.'
        WHERE id = 12
    `, function(err) {
        if (err) console.error('Error updating long sleeve description:', err);
    });

    // Update other products to ensure all have correct descriptions
    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit Hoodie',
            description = 'Stay warm and stylish with our premium cotton-blend hoodie. Features a comfortable fit, adjustable drawstring hood, and front pocket. Perfect for workouts or casual wear.'
        WHERE id = 1
    `, function(err) {
        if (err) console.error('Error updating hoodie description:', err);
    });

    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit T-shirt',
            description = 'Our signature breathable performance t-shirt is made from moisture-wicking fabric that keeps you cool and dry during workouts. Features a comfortable fit and lightweight design.'
        WHERE id = 2
    `, function(err) {
        if (err) console.error('Error updating t-shirt description:', err);
    });

    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit Shaker',
            description = 'Mix your protein shakes perfectly with our 24oz leak-proof shaker bottle. Includes a stainless steel mixing ball and convenient carrying loop. BPA-free and dishwasher safe.'
        WHERE id = 3
    `, function(err) {
        if (err) console.error('Error updating shaker description:', err);
    });

    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit Sweatpants',
            description = 'Ultra-comfortable sweatpants with four-way stretch fabric that moves with you. Features deep pockets, adjustable drawstring waist, and tapered fit for athletic performance.'
        WHERE id = 4
    `, function(err) {
        if (err) console.error('Error updating sweatpants description:', err);
    });

    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit Shorts',
            description = 'Lightweight training shorts designed for maximum mobility. Quick-dry material with built-in liner and zippered pockets. Perfect for running, training, or everyday wear.'
        WHERE id = 5
    `, function(err) {
        if (err) console.error('Error updating shorts description:', err);
    });

    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit WindBreaker',
            description = 'Windproof and water-resistant jacket ideal for outdoor training in any weather. Features reflective details for visibility, adjustable hood, and zippered pockets.'
        WHERE id = 6
    `, function(err) {
        if (err) console.error('Error updating windbreaker description:', err);
    });

    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit Leggings',
            description = 'High-performance compression leggings with four-way stretch. Features a high waistband, hidden pocket, and moisture-wicking fabric perfect for any workout.'
        WHERE id = 7
    `, function(err) {
        if (err) console.error('Error updating leggings description:', err);
    });

    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit Water Bottle',
            description = 'Insulated stainless steel water bottle that keeps your drinks cold for 24 hours or hot for 12 hours. Includes a leak-proof cap and comfortable carry handle.'
        WHERE id = 8
    `, function(err) {
        if (err) console.error('Error updating water bottle description:', err);
    });

    db.run(`
        UPDATE products SET 
            name = 'Ctrl+Fit Towel',
            description = 'Quick-dry microfiber gym towel that''s super absorbent and compact. Perfect for wiping down equipment or for use during hot yoga or intense training sessions.'
        WHERE id = 9
    `, function(err) {
        if (err) console.error('Error updating towel description:', err);
    });
});

module.exports = db;