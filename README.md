# Ctrl+Fit - Premium Fitness Wear E-commerce Website

## Project Overview

Ctrl+Fit is a modern e-commerce platform for premium fitness apparel and accessories. The website showcases a variety of fitness products with detailed product descriptions, shopping cart functionality, user accounts, and a responsive design that works across all devices.

## Features

- **User Authentication**: Secure login and signup functionality
- **Product Catalog**: Browse all products with search and filtering capabilities
- **Product Details**: Detailed product pages with sizing options and related product recommendations
- **Shopping Cart**: Add products with different sizes, manage quantities, and view summary
- **User Profiles**: Manage account details and view saved items
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Pug templates
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Session Management**: express-session
- **Static File Serving**: serve-static

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yoo-hec/TermProjectFinal.git
   cd TermProjectFinal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   # or
   node app.js
   ```

4. Open your browser and visit:

   ```
   http://localhost:3000
   ```

## Project Structure

```
ctrl-fit/
├── db/                # Database files
│   └── ecommerce.db   # SQLite database
├── public/            # Static assets
│   ├── css/           # Stylesheet files
│   └── images/        # Product and site images
├── routes/            # Express route handlers
│   ├── auth.js        # Authentication routes
│   ├── cart.js        # Shopping cart functionality
│   ├── products.js    # Product listing and details
│   └── profile.js     # User profile management
├── views/             # Pug templates
│   ├── cart.pug       # Shopping cart page
│   ├── index.pug      # Homepage
│   ├── layout.pug     # Main layout template
│   ├── login.pug      # Login page
│   ├── product.pug    # Product detail page
│   ├── products.pug   # Products listing page
│   └── profile.pug    # User profile page
├── app.js             # Main application file
├── database.js        # Database configuration
└── package.json       # Project dependencies
```

## Product Catalog

Ctrl+Fit offers a range of premium fitness products:

- **Ctrl+Fit Hoodie** - Stay warm and stylish  
- **Ctrl+Fit T-shirt** - Breathable performance fabric  
- **Ctrl+Fit Shaker** - Mix protein shakes perfectly  
- **Ctrl+Fit Sweatpants** - Ultra-comfortable with stretch fabric  
- **Ctrl+Fit Shorts** - Lightweight training shorts  
- **Ctrl+Fit WindBreaker** - Weather-resistant outerwear  
- **Ctrl+Fit Leggings** - High-performance compression  
- **Ctrl+Fit Water Bottle** - Insulated stainless steel  
- **Ctrl+Fit Towel** - Quick-dry microfiber  
- **Ctrl+Fit Keychain** - Sleek and durable  
- **Ctrl+Fit Duffel Bag** - Spacious gym bag  
- **Ctrl+Fit Long Sleeve** - Performance moisture-wicking fabric  

## API Endpoints

### Authentication

- `GET/POST /login` - User authentication  
- `GET/POST /signup` - User registration  
- `GET /logout` - Session logout  

### Products

- `GET /product` - All products listing  
- `GET /product/search` - Product search functionality  
- `GET /product/:id` - Individual product details  

### Shopping Cart

- `GET /cart` - View cart contents  
- `POST /cart/add/:id` - Add products to cart  
- `POST /cart/remove/:id` - Remove/decrease items  
- `POST /cart/increase/:id` - Increase quantities  

### User Profile

- `GET /profile` - User dashboard  
- `POST /profile/update` - Update account info  

## Database Schema

The application uses SQLite with the following main tables:

- `users` - User account information  
- `products` - Product catalog data  
- `cart_items` - Shopping cart contents  
- `saved_items` - User's saved products  
- `orders` - Order history  
- `order_items` - Individual order details  

## Cross-Platform Compatibility

This project works seamlessly across different operating systems:

- **Windows**: Standard Windows path separators  
- **macOS/Linux**: Unix-style paths  
- Automatic directory creation for required folders  

## Development

### Key Features

- MVC architecture pattern  
- Session-based authentication  
- Responsive web design  
- SQLite database with automatic seeding  
- Image fallback mechanisms  
- Cross-platform file handling  

## Troubleshooting

If you encounter issues:

- **Images not loading**: Visit `/image-test` for diagnostics  
- **File system issues**: Check `/debug-fs` for path information  
- **Database errors**: Ensure the `db` directory exists and is writable  

## Contributors

- **John Martinez**  
- **Hector Ortega**  

## License

This project is for educational purposes only.  

---

**Ctrl+Fit: Programming your fitness journey, one rep at a time.**
```
