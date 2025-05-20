const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Path to your database file - adjust as needed
const dbPath = path.resolve(__dirname, 'db/ecommerce.db');
const db = new sqlite3.Database(dbPath);

// Path to your images directory - adjust as needed
const imagesDir = path.resolve(__dirname, 'public/images');

// Create the images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  console.log(`Creating images directory at: ${imagesDir}`);
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to update the database with local image URLs
function updateDatabaseImageUrls() {
  console.log('Updating database image URLs to use local paths...');
  
  // Get all products
  db.all('SELECT id, image_url FROM products', [], (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return;
    }
    
    console.log(`Found ${products.length} products to update.`);
    
    // Update each product
    products.forEach(product => {
      // Generate a local file path for each product
      const localImageUrl = `/images/Product${product.id}.png`;
      
      // Update the database
      db.run(
        'UPDATE products SET image_url = ? WHERE id = ?',
        [localImageUrl, product.id],
        function(err) {
          if (err) {
            console.error(`Error updating product ${product.id}:`, err);
          } else {
            console.log(`Updated product ${product.id} to use ${localImageUrl}`);
          }
        }
      );
    });
  });
}

// Create dummy placeholder images for the products
function createPlaceholderImages() {
  console.log('Creating placeholder images...');
  
  // Get all products
  db.all('SELECT id, name FROM products', [], (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return;
    }
    
    // For each product, create a simple placeholder text file
    // (In a real scenario, you'd generate actual image files)
    products.forEach(product => {
      const imagePath = path.join(imagesDir, `Product${product.id}.png`);
      const placeholderContent = `This is a placeholder for Product ${product.id}. In a real app, this would be an actual image.`;
      
      // Write the placeholder file
      fs.writeFile(imagePath, placeholderContent, err => {
        if (err) {
          console.error(`Error creating placeholder for product ${product.id}:`, err);
        } else {
          console.log(`Created placeholder image at: ${imagePath}`);
        }
      });
    });
  });
}

// Execute the updates
console.log('Starting database and file system updates...');
updateDatabaseImageUrls();
createPlaceholderImages();

// Close the database connection after a delay to allow updates to complete
setTimeout(() => {
  console.log('Closing database connection...');
  db.close();
  console.log('Done! Your database now references local image paths and placeholder images have been created.');
  console.log('IMPORTANT: Replace the placeholder files with actual product images!');
}, 3000);