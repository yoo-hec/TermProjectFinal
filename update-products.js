const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Path to your database file
const dbPath = path.resolve(__dirname, 'db/ecommerce.db');
const db = new sqlite3.Database(dbPath);

console.log(`Connected to database at: ${dbPath}`);

// Updated product descriptions
const productDescriptions = [
  {
    id: 1,
    name: "Ctrl+Fit Hoodie",
    description: "Stay warm and stylish with our premium cotton-blend hoodie. Features a comfortable fit, adjustable drawstring hood, and front pocket. Perfect for workouts or casual wear.",
    price: 29.99
  },
  {
    id: 2,
    name: "Ctrl+Fit T-shirt",
    description: "Our signature breathable performance t-shirt is made from moisture-wicking fabric that keeps you cool during intense workouts. Features a modern fit and wrinkle-resistant material.",
    price: 19.99
  },
  {
    id: 3,
    name: "Ctrl+Fit Shaker",
    description: "Mix your protein shakes perfectly with our 24oz leak-proof shaker bottle. Includes a stainless steel mixing ball and measurement markings. BPA-free and dishwasher safe.",
    price: 14.99
  },
  {
    id: 4,
    name: "Ctrl+Fit Sweatpants",
    description: "Ultra-comfortable sweatpants with four-way stretch fabric that moves with you. Features deep pockets, adjustable drawstring waist, and tapered fit for athletic performance.",
    price: 34.99
  },
  {
    id: 5,
    name: "Ctrl+Fit Shorts",
    description: "Lightweight training shorts designed for maximum mobility. Quick-dry material with built-in liner and zippered pocket. Perfect for running, gym workouts, or casual wear.",
    price: 24.99
  },
  {
    id: 6,
    name: "Ctrl+Fit WindBreaker",
    description: "Windproof and water-resistant jacket ideal for outdoor training in any weather. Features reflective details, adjustable hood, and packable design that fits in its own pocket.",
    price: 39.99
  },
  {
    id: 7,
    name: "Ctrl+Fit Leggings",
    description: "High-performance compression leggings with moisture-wicking technology. Four-way stretch fabric with hidden waistband pocket. Squat-proof design for complete coverage.",
    price: 29.99
  },
  {
    id: 8,
    name: "Ctrl+Fit Water Bottle",
    description: "32oz insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Includes a leak-proof sports cap and comfortable carrying handle.",
    price: 12.99
  },
  {
    id: 9,
    name: "Ctrl+Fit Towel",
    description: "Quick-dry microfiber gym towel that absorbs 4x its weight in water. Antimicrobial treatment prevents odors, and the compact design makes it perfect for travel.",
    price: 9.99
  },
  {
    id: 10,
    name: "Ctrl+Fit Gloves",
    description: "Enhance your grip with our premium weightlifting gloves. Features padded palms, adjustable wrist straps, and breathable mesh to keep hands dry during intense sessions.",
    price: 19.99
  },
  {
    id: 11,
    name: "Ctrl+Fit Hat",
    description: "Lightweight performance cap with moisture-wicking sweatband and breathable mesh panels. Adjustable snapback and reflective logo for visibility during evening runs.",
    price: 14.99
  },
  {
    id: 12,
    name: "Ctrl+Fit Backpack",
    description: "Durable 30L gym backpack with dedicated compartments for shoes, water bottle, and electronics. Water-resistant material with reinforced bottom and comfortable padded straps.",
    price: 44.99
  }
];

// Create physical image examples
const publicImagesDir = path.resolve(__dirname, 'public/images');
if (!fs.existsSync(publicImagesDir)) {
  console.log(`Creating directory: ${publicImagesDir}`);
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

// Function to create an SVG
function createProductSVG(id, name) {
  const colors = [
    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
    '#1abc9c', '#d35400', '#34495e', '#27ae60', '#e67e22'
  ];
  
  const color = colors[id % colors.length];
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="${color}" />
    <text x="300" y="180" font-family="Arial" font-size="36" text-anchor="middle" fill="white">${name}</text>
    <text x="300" y="240" font-family="Arial" font-size="24" text-anchor="middle" fill="white">Product ${id}</text>
  </svg>`;
  
  return svgContent;
}

// Log the current product image paths
db.all("SELECT id, name, image_url FROM products", [], (err, products) => {
  if (err) {
    console.error("Error fetching products:", err);
    return;
  }
  
  console.log("Current product images in database:");
  products.forEach(product => {
    console.log(`Product ${product.id}: ${product.name} - Image: ${product.image_url}`);
  });
  
  // Update product descriptions and image paths
  const updateStmt = db.prepare("UPDATE products SET description = ?, price = ?, image_url = ? WHERE id = ?");
  
  productDescriptions.forEach(product => {
    // Create both formats of image files: Product1.png and product1.png
    const capitalFileName = `Product${product.id}.png`;
    const lowerFileName = `product${product.id}.png`;
    
    const capitalFilePath = path.join(publicImagesDir, capitalFileName);
    const lowerFilePath = path.join(publicImagesDir, lowerFileName);
    
    // Create SVG image files
    const svgContent = createProductSVG(product.id, product.name);
    
    try {
      fs.writeFileSync(capitalFilePath, svgContent);
      console.log(`Created ${capitalFilePath}`);
      
      fs.writeFileSync(lowerFilePath, svgContent);
      console.log(`Created ${lowerFilePath}`);
    } catch (error) {
      console.error(`Error creating image for product ${product.id}:`, error);
    }
    
    // Update the database
    const imageUrl = `/images/${capitalFileName}`;
    updateStmt.run(
      product.description,
      product.price,
      imageUrl,
      product.id,
      function(err) {
        if (err) {
          console.error(`Error updating product ${product.id}:`, err);
        } else {
          console.log(`Updated product ${product.id}: ${product.name}`);
        }
      }
    );
  });
  
  updateStmt.finalize();
  
  // Verify updates after completion
  setTimeout(() => {
    db.all("SELECT id, name, description, price, image_url FROM products", [], (err, updatedProducts) => {
      if (err) {
        console.error("Error fetching updated products:", err);
        return;
      }
      
      console.log("\nUpdated products in database:");
      updatedProducts.forEach(product => {
        console.log(`Product ${product.id}: ${product.name}`);
        console.log(`  Description: ${product.description.substring(0, 50)}...`);
        console.log(`  Price: $${product.price}`);
        console.log(`  Image URL: ${product.image_url}`);
        console.log("---");
      });
      
      console.log("\nDONE: Database and image files have been updated.");
      console.log("Please restart your application to see the changes.");
      
      db.close();
    });
  }, 1000);
});