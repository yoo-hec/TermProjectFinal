// Profile route fix for password changes
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Profile main page
router.get('/', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const error = req.query.error;
  const success = req.query.success;
  
  // Get user's saved items
  db.all(`
    SELECT s.id as saved_id, s.product_id, p.name, p.description, p.price, p.image_url 
    FROM saved_items s
    JOIN products p ON s.product_id = p.id
    WHERE s.user_id = ?
  `, [userId], (err, savedItems) => {
    if (err) {
      console.error('Error fetching saved items:', err);
      savedItems = [];
    }
    
    // Format saved items
    const formattedSavedItems = savedItems.map(item => {
      return {
        ...item,
        price: parseFloat(item.price) || 0,
        image_url: `/images/Product${item.product_id}.png`
      };
    });
    
    // Get user's order history
    db.all(`
      SELECT o.*, oi.product_id, oi.quantity, p.name, p.price
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC
    `, [userId], (err, orderResults) => {
      let orders = [];
      
      if (!err && orderResults && orderResults.length > 0) {
        // Process order results to group by order
        const orderMap = new Map();
        
        orderResults.forEach(row => {
          if (!orderMap.has(row.id)) {
            // Create new order
            const order = {
              id: row.id,
              order_date: row.order_date,
              total: parseFloat(row.total) || 0,
              status: row.status || 'Completed',
              items: []
            };
            
            orders.push(order);
            orderMap.set(row.id, order);
          }
          
          // Add item to order if product_id exists
          if (row.product_id) {
            const order = orderMap.get(row.id);
            order.items.push({
              product_id: row.product_id,
              name: row.name,
              price: parseFloat(row.price) || 0,
              quantity: row.quantity,
              subtotal: (parseFloat(row.price) || 0) * row.quantity
            });
          }
        });
      }
      
      res.render('profile', { 
        user: req.session.user,
        savedItems: formattedSavedItems,
        orders: orders,
        error: error,
        success: success
      });
    });
  });
});

// Update profile
router.post('/update', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const { username } = req.body;
  
  db.run(
    `UPDATE users SET username = ? WHERE id = ?`,
    [username, userId],
    (err) => {
      if (err) {
        console.error('Error updating profile:', err);
        return res.redirect('/profile?error=Error updating profile');
      }
      
      // Update session
      req.session.user.username = username;
      
      res.redirect('/profile?success=Profile updated successfully');
    }
  );
});

// Change password - Move this to auth.js
// This is just a stub that redirects to the auth version
router.post('/change-password', requireLogin, (req, res) => {
  // Redirect to the auth route that handles password changes
  res.redirect(307, '/profile/change-password');
});

// Update notification preferences
router.post('/notifications', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const { emailNotifications = 'off', smsNotifications = 'off' } = req.body;
  
  // In a real app, you'd save these preferences to a database
  // For this example, we'll just redirect back to the profile
  console.log(`Updating notification preferences for user ${userId}:`);
  console.log(`- Email notifications: ${emailNotifications}`);
  console.log(`- SMS notifications: ${smsNotifications}`);
  
  res.redirect('/profile?success=Notification preferences updated');
});

// Remove saved item
router.post('/saved/remove/:id', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const savedItemId = req.params.id;
  
  db.run(
    `DELETE FROM saved_items WHERE id = ? AND user_id = ?`,
    [savedItemId, userId],
    (err) => {
      if (err) {
        console.error('Error removing saved item:', err);
        return res.redirect('/profile?error=Error removing saved item');
      }
      
      res.redirect('/profile?success=Item removed from saved items');
    }
  );
});

// View all saved items
router.get('/saved', requireLogin, (req, res) => {
  const userId = req.session.user.id;
  
  db.all(`
    SELECT s.id as saved_id, s.product_id, p.name, p.description, p.price, p.image_url 
    FROM saved_items s
    JOIN products p ON s.product_id = p.id
    WHERE s.user_id = ?
  `, [userId], (err, savedItems) => {
    if (err) {
      console.error('Error fetching saved items:', err);
      return res.status(500).send('Error loading saved items');
    }
    
    // Format saved items
    const formattedSavedItems = savedItems.map(item => {
      return {
        ...item,
        price: parseFloat(item.price) || 0,
        image_url: `/images/Product${item.product_id}.png`
      };
    });
    
    res.render('saved-items', { 
      user: req.session.user,
      savedItems: formattedSavedItems
    });
  });
});

// Setup database tables for saved items and settings if they don't exist
db.serialize(() => {
  // Create saved_items table if it doesn't exist
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
});

module.exports = router;