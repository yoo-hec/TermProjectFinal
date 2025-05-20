// Updated product routes to include 4 related products instead of 3
const express = require('express');
const router = express.Router();
const db = require('../db/database'); // Adjust path if needed

// Get all products
router.get('/', (req, res) => {
  db.all('SELECT * FROM products', [], (err, products) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).send('Database error');
    }

    // Fix image paths and format prices for each product
    const formattedProducts = products.map(product => {
      // Ensure price is a number and format it
      const price = parseFloat(product.price) || 0;
      
      // Fix image path
      const imageUrl = `/images/Product${product.id}.png`;
      
      return {
        ...product,
        price: price,
        formattedPrice: price.toFixed(2),
        image_url: imageUrl
      };
    });

    res.render('products', { products: formattedProducts });
  });
});

// Enhanced search functionality
router.get('/search', (req, res) => {
  const searchTerm = req.query.q || '';
  
  if (!searchTerm) {
    return res.redirect('/product');
  }
  
  // Enhanced search query with better matching
  const searchQuery = `
    SELECT * FROM products 
    WHERE name LIKE ? OR description LIKE ?
    ORDER BY 
      CASE 
        WHEN name LIKE ? THEN 1  /* Exact match in name starts with */
        WHEN name LIKE ? THEN 2  /* Name contains anywhere */
        WHEN description LIKE ? THEN 3  /* Description starts with */
        ELSE 4  /* Description contains anywhere */
      END
  `;
  
  const exactStartMatch = `${searchTerm}%`;
  const containsMatch = `%${searchTerm}%`;
  
  db.all(
    searchQuery, 
    [containsMatch, containsMatch, exactStartMatch, containsMatch, exactStartMatch], 
    (err, products) => {
      if (err) {
        console.error('Error searching products:', err);
        return res.status(500).send('Database error');
      }
      
      // Format products for display
      const formattedProducts = products.map(product => {
        return {
          ...product,
          price: parseFloat(product.price) || 0,
          image_url: `/images/Product${product.id}.png`
        };
      });
      
      // If only one product found, redirect to that product's page
      if (formattedProducts.length === 1) {
        return res.redirect(`/product/${formattedProducts[0].id}`);
      }
      
      // Otherwise show search results
      res.render('products', { 
        products: formattedProducts,
        searchTerm: searchTerm,
        resultCount: formattedProducts.length
      });
    }
  );
});

// Get single product with 4 related products (instead of 3)
router.get('/:id', (req, res) => {
  const productId = req.params.id;
  
  // First get the requested product
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).send('Database error');
    }
    
    if (!product) {
      return res.status(404).send('Product not found');
    }
    
    // Format price and image path
    const formattedProduct = {
      ...product,
      price: parseFloat(product.price) || 0,
      image_url: `/images/Product${product.id}.png`
    };
    
    // Check if product is saved by user
    const userId = req.session.user ? req.session.user.id : null;
    let savedQuery = 'SELECT 1 FROM saved_items WHERE user_id = ? AND product_id = ?';
    
    db.get(savedQuery, [userId, productId], (saveErr, savedItem) => {
      // It's okay if this fails, we'll just default to not saved
      const isSaved = !!savedItem;
      
      // Get 4 related products (excluding the current product)
      db.all(`
        SELECT * FROM products 
        WHERE id != ? 
        ORDER BY RANDOM() 
        LIMIT 4
      `, [productId], (err, relatedProducts) => {
        if (err) {
          console.error('Error fetching related products:', err);
          // Continue without related products if there's an error
          return res.render('product', { 
            product: formattedProduct,
            relatedProducts: [],
            isSaved: isSaved
          });
        }
        
        // Format related products
        const formattedRelatedProducts = relatedProducts.map(product => {
          return {
            ...product,
            price: parseFloat(product.price) || 0,
            image_url: `/images/Product${product.id}.png`
          };
        });
        
        // Render the product page with all data
        res.render('product', { 
          product: formattedProduct,
          relatedProducts: formattedRelatedProducts,
          isSaved: isSaved
        });
      });
    });
  });
});

// Add to cart directly from products listing
router.post('/add-to-cart/:productId', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userId = req.session.user.id;
  const productId = req.params.productId;
  const returnUrl = req.body.returnUrl || '/product';
  
  db.get(
    `SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?`,
    [userId, productId],
    (err, row) => {
      if (err) {
        console.error('Error checking cart:', err);
        return res.redirect(returnUrl);
      }

      if (row) {
        // Item exists → increment quantity
        db.run(
          `UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?`,
          [row.id],
          (err) => {
            if (err) console.error('Update error:', err);
            res.redirect(returnUrl);
          }
        );
      } else {
        // Insert new cart item
        db.run(
          `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)`,
          [userId, productId],
          (err) => {
            if (err) console.error('Insert error:', err);
            res.redirect(returnUrl);
          }
        );
      }
    }
  );
});

// Toggle save product (add/remove from saved items)
router.post('/save/:productId', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userId = req.session.user.id;
  const productId = req.params.productId;
  const returnUrl = req.body.returnUrl || `/product/${productId}`;
  
  // Check if product is already saved
  db.get(
    `SELECT * FROM saved_items WHERE user_id = ? AND product_id = ?`,
    [userId, productId],
    (err, row) => {
      if (err) {
        console.error('Error checking saved items:', err);
        return res.redirect(returnUrl);
      }

      if (row) {
        // Product is already saved, so remove it
        db.run(
          `DELETE FROM saved_items WHERE id = ?`,
          [row.id],
          (err) => {
            if (err) console.error('Delete error:', err);
            res.redirect(returnUrl);
          }
        );
      } else {
        // Product is not saved, so add it
        db.run(
          `INSERT INTO saved_items (user_id, product_id) VALUES (?, ?)`,
          [userId, productId],
          (err) => {
            if (err) console.error('Insert error:', err);
            res.redirect(returnUrl);
          }
        );
      }
    }
  );
});

module.exports = router;