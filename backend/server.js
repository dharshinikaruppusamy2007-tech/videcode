const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const interviewRouter = require('./routes/interview');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/interview', interviewRouter);

// Health-check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Backend server is running',
        timestamp: new Date().toISOString()
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
