console.log('🧠 CART ROUTES LOADED');

const express = require('express');
const db = require('../db/database');
const router = express.Router();

// ✅ Add to cart (or increase if exists)
router.post('/add/:productId', (req, res) => {
  if (!req.session.user) {
    console.log('🔒 Not logged in');
    return res.redirect('/login');
  }

  const userId = req.session.user.id;
  const productId = req.params.productId;
  console.log(`🛒 Add to cart: user ${userId}, product ${productId}`);

  db.get(
    `SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?`,
    [userId, productId],
    (err, row) => {
      if (err) {
        console.error('❌ SELECT error:', err);
        return res.status(500).send('Database error');
      }

      if (row) {
        // Item exists → increment quantity
        db.run(
          `UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?`,
          [row.id],
          (err) => {
            if (err) console.error('❌ UPDATE error:', err);
            else console.log('✅ Quantity updated');
            res.redirect('/cart');
          }
        );
      } else {
        // Insert new cart item
        db.run(
          `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)`,
          [userId, productId],
          (err) => {
            if (err) console.error('❌ INSERT error:', err);
            else console.log('✅ Item inserted into cart');
            res.redirect('/cart');
          }
        );
      }
    }
  );
});

// ✅ View cart - FIXED QUERY to match database structure
router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const userId = req.session.user.id;

  db.all(
    `
    SELECT 
      p.id, 
      p.name, 
      p.description, 
      p.image_url, 
      p.price, 
      c.quantity, 
      (p.price * c.quantity) AS subtotal
    FROM cart_items c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
    `,
    [userId],
    (err, items) => {
      if (err) {
        console.error('❌ CART query error:', err);
        return res.status(500).send('Database error');
      }

      // Calculate grand total
      const total = items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);

      res.render('cart', { items, total });
    }
  );
});


// ✅ Decrease quantity or remove
router.post('/remove/:productId', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const userId = req.session.user.id;
  const productId = req.params.productId;

  db.get(
    `SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?`,
    [userId, productId],
    (err, row) => {
      if (err) {
        console.error('❌ SELECT error:', err);
        return res.status(500).send('Database error');
      }

      if (!row) {
        return res.redirect('/cart'); // Item not found
      }

      if (row.quantity > 1) {
        db.run(
          `UPDATE cart_items SET quantity = quantity - 1 WHERE user_id = ? AND product_id = ?`,
          [userId, productId],
          (err) => {
            if (err) console.error('❌ DECREMENT error:', err);
            else console.log(`➖ Decreased quantity for product ${productId}`);
            res.redirect('/cart');
          }
        );
      } else {
        db.run(
          `DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`,
          [userId, productId],
          (err) => {
            if (err) console.error('❌ DELETE error:', err);
            else console.log(`🗑️ Removed product ${productId} from cart`);
            res.redirect('/cart');
          }
        );
      }
    }
  );
});

// ✅ Increase quantity
router.post('/increase/:productId', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const userId = req.session.user.id;
  const productId = req.params.productId;

  db.run(
    `UPDATE cart_items SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?`,
    [userId, productId],
    (err) => {
      if (err) console.error('❌ INCREASE error:', err);
      else console.log(`➕ Increased quantity for product ${productId}`);
      res.redirect('/cart');
    }
  );
});

// ✅ Export routes
module.exports = router;