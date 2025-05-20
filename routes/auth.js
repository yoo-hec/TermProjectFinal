// Updated auth routes with login/signup functionality
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Login page
router.get('/login', (req, res) => {
    const error = req.query.error;
    const message = req.query.message;
    res.render('login', { error, message });
});

// Process login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Validate
    if (!username || !password) {
        return res.redirect('/login?error=Please provide both username and password');
    }
    
    // Check credentials - using plaintext for demo (in production, use password hashing!)
    db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, user) => {
            if (err) {
                console.error('Database error during login:', err);
                return res.redirect('/login?error=Database error');
            }
            
            if (!user) {
                return res.redirect('/login?error=Invalid username or password');
            }
            
            // Simple password check (in a real app, you'd use bcrypt.compare)
            if (user.password !== password) {
                return res.redirect('/login?error=Invalid username or password');
            }
            
            // Set session - don't store password in session
            req.session.user = {
                id: user.id,
                username: user.username
            };
            
            // Redirect to home page or requested URL
            const redirectUrl = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        }
    );
});

// Signup page
router.get('/signup', (req, res) => {
    const error = req.query.error;
    res.render('signup', { error });
});

// Process signup
router.post('/signup', (req, res) => {
    const { username, password, confirmPassword } = req.body;
    
    // Validate
    if (!username || !password) {
        return res.redirect('/signup?error=Please provide both username and password');
    }
    
    if (password !== confirmPassword) {
        return res.redirect('/signup?error=Passwords do not match');
    }
    
    // Check if username already exists
    db.get(
        'SELECT id FROM users WHERE username = ?',
        [username],
        (err, user) => {
            if (err) {
                console.error('Database error during signup:', err);
                return res.redirect('/signup?error=Database error');
            }
            
            if (user) {
                return res.redirect('/signup?error=Username already exists');
            }
            
            // Create new user (in production, hash the password!)
            db.run(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, password],
                function(err) {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.redirect('/signup?error=Error creating account');
                    }
                    
                    // Set session for the new user
                    req.session.user = {
                        id: this.lastID,
                        username: username
                    };
                    
                    res.redirect('/');
                }
            );
        }
    );
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Fix for the profile password change function
router.post('/profile/change-password', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    
    const userId = req.session.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.redirect('/profile?error=All fields are required');
    }
    
    if (newPassword !== confirmPassword) {
        return res.redirect('/profile?error=New passwords do not match');
    }
    
    // Check current password
    db.get(
        'SELECT password FROM users WHERE id = ?',
        [userId],
        (err, user) => {
            if (err || !user) {
                console.error('Error fetching user:', err);
                return res.redirect('/profile?error=Database error');
            }
            
            // Verify current password (in production, use bcrypt.compare)
            if (user.password !== currentPassword) {
                return res.redirect('/profile?error=Current password is incorrect');
            }
            
            // Update with new password (in production, use bcrypt.hash)
            db.run(
                'UPDATE users SET password = ? WHERE id = ?',
                [newPassword, userId],
                (err) => {
                    if (err) {
                        console.error('Error updating password:', err);
                        return res.redirect('/profile?error=Error updating password');
                    }
                    
                    // Log the user out after password change for security
                    req.session.destroy(() => {
                        res.redirect('/login?message=Password updated. Please log in with your new password.');
                    });
                }
            );
        }
    );
});

// Ensure the users table exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    `);
});

module.exports = router;