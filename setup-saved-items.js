// Create this as setup-saved-items.js in your project root
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to your database file
const dbPath = path.resolve(__dirname, 'db/ecommerce.db');
const db = new sqlite3.Database(dbPath);

console.log(`Connected to database at: ${dbPath}`);

// Create necessary tables
db.serialize(() => {
  // Create saved_items table if it doesn't exist
  console.log('Creating saved_items table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS saved_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(user_id, product_id)
    );
  `);
  
  // Create orders table if it doesn't exist
  console.log('Creating orders table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      total REAL NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'Processing',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  
  // Create order_items table if it doesn't exist
  console.log('Creating order_items table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);
  
  // Create user_preferences table if it doesn't exist
  console.log('Creating user_preferences table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email_notifications INTEGER DEFAULT 1,
      sms_notifications INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id)
    );
  `);
  
  // Create addresses table if it doesn't exist
  console.log('Creating addresses table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      country TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  
  // Check if we have any users
  db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
    if (err) {
      console.error('Error checking users:', err);
      return;
    }
    
    // If no users exist, create a test user
    if (result.count === 0) {
      console.log('Creating test user...');
      db.run(`
        INSERT INTO users (username, password)
        VALUES ('testuser', 'password');
      `);
    }
  });
  
  console.log('Database setup complete!');
});

// Close the database connection after a delay to ensure all operations complete
setTimeout(() => {
  db.close();
  console.log('Database connection closed.');
}, 1000);