const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Adjust this path to match your database location
const dbPath = path.resolve(__dirname, 'db/ecommerce.db');
const db = new sqlite3.Database(dbPath);

console.log(`Connecting to database at: ${dbPath}`);

// Update all products with sensible prices
db.serialize(() => {
  // First, let's see what products we have
  db.all("SELECT id, name, price FROM products", [], (err, rows) => {
    if (err) {
      console.error("Error fetching products:", err);
      return;
    }
    
    console.log("Current product prices:");
    rows.forEach(row => {
      console.log(`- ${row.id}: ${row.name} - $${row.price}`);
    });
    
    // Now update all prices with reasonable values
    const updateStmt = db.prepare("UPDATE products SET price = ? WHERE id = ?");
    
    // Set fixed prices for each product
    const productPrices = {
      1: 29.99,  // Hoodie
      2: 19.99,  // T-shirt
      3: 14.99,  // Shaker
      4: 34.99,  // Sweatpants
      5: 24.99,  // Shorts
      6: 39.99,  // WindBreaker
      7: 29.99,  // Leggings
      8: 12.99,  // Water Bottle
      9: 9.99,   // Towel
      10: 49.99, // Product 10
      11: 19.99, // Product 11
      12: 24.99  // Product 12
    };
    
    // Update each product with a reasonable price
    Object.entries(productPrices).forEach(([id, price]) => {
      updateStmt.run(price, id, function(err) {
        if (err) {
          console.error(`Error updating price for product ${id}:`, err);
        } else {
          console.log(`Updated product ${id} price to $${price}`);
        }
      });
    });
    
    updateStmt.finalize();
    
    // Verify the updates
    setTimeout(() => {
      db.all("SELECT id, name, price FROM products", [], (err, updatedRows) => {
        if (err) {
          console.error("Error fetching updated products:", err);
          return;
        }
        
        console.log("\nUpdated product prices:");
        updatedRows.forEach(row => {
          console.log(`- ${row.id}: ${row.name} - $${row.price}`);
        });
        
        console.log("\nPrice update complete!");
        db.close();
      });
    }, 1000);
  });
});