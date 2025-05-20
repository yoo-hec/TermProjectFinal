const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// Database
const db = require('./db/database');

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const productRoutes = require('./routes/products');
const cartRoutes= require('./routes/cart');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// Additional explicit route for images to ensure they load properly
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Image debugging middleware
app.use((req, res, next) => {
  if (req.url.startsWith('/images/')) {
    console.log('Image requested:', req.url);
  }
  next();
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false
}));

// Custom auth middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Route mounting
app.use('/', authRoutes);
app.use('/profile', profileRoutes);
app.use('/product', productRoutes);
app.use('/cart', cartRoutes);

// Home route with price formatting
app.get('/', (req, res) => {
  db.all(`SELECT * FROM products LIMIT 4`, (err, featured) => {
      if (err) return res.status(500).send('Database error');
      
      // Format products with proper image paths and prices
      const formattedFeatured = featured.map(product => {
          return {
              ...product,
              // Ensure price is a number
              price: parseFloat(product.price) || 0,
              // Use direct path to image file based on id
              image_url: `/images/Product${product.id}.png`
          };
      });
      
      res.render('index', { featured: formattedFeatured });
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});