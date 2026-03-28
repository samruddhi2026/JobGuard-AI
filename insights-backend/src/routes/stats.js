const express = require('express');
const router = express.Router();
const ProcessorService = require('../services/processor');
const ScraperService = require('../services/scraper');
const Job = require('../models/Job');

// GET /api/stats/insights
router.get('/insights', async (req, res) => {
    try {
        const { location, role, experience } = req.query;
        
        // If no jobs exist, trigger an initial scrape
        const count = await Job.countDocuments();
        if (count === 0) {
            console.log('No jobs found. Triggering initial scrape...');
            await ScraperService.scrapeJobs();
        }

        const insights = await ProcessorService.getMarketInsights({ location, role, experience });
        res.json(insights);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch insights', details: error.message });
    }
});

// GET /api/stats/skills (Direct endpoint as requested)
router.get('/skills', async (req, res) => {
    try {
        const { location, role } = req.query;
        const insights = await ProcessorService.getMarketInsights({ location, role });
        res.json(insights.top_skills);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

// GET /api/stats/trends (Direct endpoint as requested)
router.get('/trends', async (req, res) => {
    try {
        const { location, role } = req.query;
        const insights = await ProcessorService.getMarketInsights({ location, role });
        res.json(insights.trends);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
});

// POST /api/stats/sync (Manual sync)
router.post('/sync', async (req, res) => {
    try {
        const { query, location } = req.body;
        const jobs = await ScraperService.scrapeJobs(query, location);
        res.json({ message: 'Sync complete', count: jobs.length });
    } catch (error) {
        res.status(500).json({ error: 'Sync failed' });
    }
});

module.exports = router;
