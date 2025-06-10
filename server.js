require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// ...existing code...
app.get('/register', (req, res) => {
    const messages = req.flash('error'); // or however you are setting messages
    res.render('register', { messages });
});
// ...existing code...
app.post('/auth/register', (req, res) => {
    // ...existing code...
    if (error) {
        req.flash('error', 'Registration failed');
        return res.redirect('/register');
    }
    // ...existing code...
});
// ...existing code...
