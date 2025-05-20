
// Update database image paths to match your actual file structure
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Adjust this path to match your database location
const dbPath = path.resolve(__dirname, 'db/ecommerce.db');
const db = new sqlite3.Database(dbPath);

console.log(`Connecting to database at: ${dbPath}`);

// Update product image URLs to match your actual image filenames
db.serialize(() => {
  // First, let's see what we're working with
  db.all("SELECT id, name, image_url FROM products", [], (err, products) => {
    if (err) {
      console.error("Error fetching products:", err);
      return;
    }
    
    console.log("Current product image paths:");
    products.forEach(product => {
      console.log(`- Product ${product.id}: ${product.name} - Image URL: ${product.image_url}`);
    });
    
    // Update all products to use the correct image path format
    // Based on your screenshots, your images are named like "Product2.png" (capital P)
    const updateStmt = db.prepare("UPDATE products SET image_url = ? WHERE id = ?");
    
    products.forEach(product => {
      const newImageUrl = `/images/Product${product.id}.png`;
      
      updateStmt.run(newImageUrl, product.id, function(err) {
        if (err) {
          console.error(`Error updating image_url for product ${product.id}:`, err);
        } else {
          console.log(`Updated product ${product.id} image_url to ${newImageUrl}`);
        }
      });
    });
    
    updateStmt.finalize();
    
    // After updates, check the results
    setTimeout(() => {
      db.all("SELECT id, name, image_url FROM products", [], (err, updatedProducts) => {
        if (err) {
          console.error("Error fetching updated products:", err);
          return;
        }
        
        console.log("\nUpdated product image paths:");
        updatedProducts.forEach(product => {
          console.log(`- Product ${product.id}: ${product.name} - Image URL: ${product.image_url}`);
        });
        
        console.log("\nDatabase update complete!");
        db.close();
      });
    }, 1000);
  });
});