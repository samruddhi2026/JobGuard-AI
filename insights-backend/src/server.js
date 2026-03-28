const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stats', require('./routes/stats'));

// Basic health check
app.get('/health', (req, res) => res.json({ status: 'ok', storage: 'json' }));

app.listen(PORT, () => {
    console.log(`🚀 Insights Backend running on http://localhost:${PORT}`);
    console.log(`📡 Storage Mode: Local JSON (MongoDB fallback ready)`);
});
