const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allowlist of allowed frontend origins (no unrestricted "*").
// In production, set FRONTEND_URL to the real deployed frontend URL.
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://videcode.vercel.app',
];

const interviewRouter = require('./routes/interview');
const candidatesRouter = require('./routes/candidates');

// Middleware
app.use(
    cors({
        origin(origin, callback) {
            // Allow non-browser requests (curl, health checks) that send no Origin header.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST', 'OPTIONS'],
    })
);
app.use(express.json());

// Routes
app.use('/api/interview', interviewRouter);
app.use('/api/candidates', candidatesRouter);

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
