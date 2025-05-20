const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Adjust these paths to match your project structure
const dbPath = path.resolve(__dirname, 'db/ecommerce.db');
const publicDir = path.resolve(__dirname, 'public');
const imagesDir = path.resolve(publicDir, 'images');

// Ensure the images directory exists
if (!fs.existsSync(imagesDir)) {
  console.log(`Creating images directory: ${imagesDir}`);
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Connect to the database
const db = new sqlite3.Database(dbPath);
console.log(`Connected to database at: ${dbPath}`);

// Function to create a simple colored image placeholder
function createColoredPlaceholder(filePath, productId) {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3',
    '#33FFF3', '#FF8C33', '#8C33FF', '#33FF8C', '#FF338C'
  ];
  
  // Generate a simple SVG with the product number and a background color
  const colorIndex = (productId - 1) % colors.length;
  const bgColor = colors[colorIndex];
  const textColor = '#FFFFFF';
  
  const svgContent = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="${bgColor}" />
    <text x="300" y="200" font-family="Arial" font-size="48" text-anchor="middle" fill="${textColor}">Product ${productId}</text>
  </svg>`;
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created SVG placeholder: ${filePath}`);
}

// Function to generate an HTML placeholder
function createHtmlPlaceholder(filePath, productId, productName) {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3',
    '#33FFF3', '#FF8C33', '#8C33FF', '#33FF8C', '#FF338C'
  ];
  
  const colorIndex = (productId - 1) % colors.length;
  const bgColor = colors[colorIndex];
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 600px;
      height: 400px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: ${bgColor};
      color: white;
      font-family: Arial, sans-serif;
    }
    .product-placeholder {
      text-align: center;
    }
    h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    p {
      font-size: 18px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="product-placeholder">
    <h1>${productName}</h1>
    <p>Product ${productId}</p>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(filePath, htmlContent);
  console.log(`Created HTML placeholder: ${filePath}`);
}

// Update product image URLs and create placeholder images
db.all("SELECT id, name, image_url FROM products", [], (err, products) => {
  if (err) {
    console.error("Error fetching products:", err);
    db.close();
    return;
  }
  
  console.log(`Found ${products.length} products.`);
  
  // Update each product's image_url and create a placeholder image
  const updateStmt = db.prepare("UPDATE products SET image_url = ? WHERE id = ?");
  
  products.forEach(product => {
    // Create the file path for the product image
    const imageFileName = `product${product.id}.png`;
    const imagePath = path.join(imagesDir, imageFileName);
    
    // Set the new image URL (relative to public directory)
    const newImageUrl = `/images/${imageFileName}`;
    
    // Update the database
    updateStmt.run(newImageUrl, product.id, function(err) {
      if (err) {
        console.error(`Error updating image_url for product ${product.id}:`, err);
      } else {
        console.log(`Updated product ${product.id} image_url to ${newImageUrl}`);
      }
    });
    
    // Create a placeholder image file
    try {
      // You can choose between SVG or HTML placeholders
      // createHtmlPlaceholder(imagePath, product.id, product.name);
      createColoredPlaceholder(imagePath, product.id);
    } catch (error) {
      console.error(`Error creating placeholder for product ${product.id}:`, error);
    }
  });
  
  updateStmt.finalize();
  
  // Close the database after a delay to ensure updates complete
  setTimeout(() => {
    console.log("Updates complete. Closing database connection.");
    db.close();
    
    console.log("\n-------------------------------------------");
    console.log("INSTRUCTIONS:");
    console.log("1. Placeholder images have been created in:", imagesDir);
    console.log("2. The database has been updated with correct image paths");
    console.log("3. Restart your application to see the changes");
    console.log("4. Replace the placeholder images with real product images if needed");
    console.log("-------------------------------------------");
  }, 1000);
});