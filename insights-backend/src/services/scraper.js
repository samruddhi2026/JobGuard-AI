const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../models/Job');

class ScraperService {
    static SKILL_KEYWORDS = [
        'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'AWS', 'Docker',
        'Next.js', 'Express', 'MongoDB', 'PostgreSQL', 'Kubernetes', 'Java', 'Go', 'Rust',
        'PHP', 'C++', 'C#', 'Angular', 'Vue.js', 'Tailwind', 'Sass', 'HTML', 'CSS'
    ];

    static async scrapeJobs(query = 'Software Engineer', location = '') {
        console.log(`🔍 Starting scrape for: ${query} in ${location}`);
        const jobs = [];
        
        // Generate 60+ highly varied simulated jobs
        const companies = ['TechCorp', 'DevSync', 'StartupX', 'DataLabs', 'CloudScale', 'UI Pros', 'Backend Hub', 'GlobalSoft', 'InnovateIT', 'CyberGuard'];
        const locs = ['Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Bangalore', 'Dubai', 'Singapore', 'Austin', 'Seattle'];
        const baseSkills = this.SKILL_KEYWORDS;
        
        const simulatedJobs = [];
        for (let i = 0; i < 65; i++) {
            const randomCompany = companies[Math.floor(Math.random() * companies.length)];
            const randomLoc = locs[Math.floor(Math.random() * locs.length)];
            
            // Randomize date distribution (last 30 days)
            // Bias towards more recent jobs (last 7 days) to see growth
            const isRecent = Math.random() > 0.4; 
            const daysAgo = isRecent ? Math.floor(Math.random() * 7) : Math.floor(Math.random() * 23) + 7;
            const datePosted = new Date(Date.now() - daysAgo * 86400000);
            
            // Randomize skill selection (3-6 skills per job)
            const numSkills = Math.floor(Math.random() * 4) + 3;
            const shuffledSkills = [...baseSkills].sort(() => 0.5 - Math.random());
            const selectedSkills = shuffledSkills.slice(0, numSkills);
            
            simulatedJobs.push({
                title: `${selectedSkills[0]} Developer`,
                company: randomCompany,
                location: randomLoc,
                description: `We are looking for an expert in ${selectedSkills.join(', ')}.`,
                source: ['Indeed', 'LinkedIn', 'Naukri', 'Glassdoor'][Math.floor(Math.random() * 4)],
                date_posted: datePosted,
                skills: selectedSkills,
                job_url: `https://example.com/job/${Math.random().toString(36).substr(2, 9)}`
            });
        }

        console.log(`Simulating ${simulatedJobs.length} jobs with high variance...`);

        try {

            for (const item of simulatedJobs) {
                const skills = this.extractSkills(item.description);
                const jobData = {
                    ...item,
                    skills,
                    job_url: `https://example.com/job/${Math.random().toString(36).substr(2, 9)}`,
                    date_posted: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000) // Random date in last 30 days
                };
                
                try {
                    await Job.findOneAndUpdate(
                        { job_url: jobData.job_url },
                        jobData,
                        { upsert: true, new: true }
                    );
                    jobs.push(jobData);
                } catch (e) {
                    console.error('Error saving job:', e.message);
                }
            }

            console.log(`✅ Scraped and saved ${jobs.length} jobs.`);
            return jobs;
        } catch (error) {
            console.error('❌ Scraper error:', error);
            return [];
        }
    }

    static extractSkills(description) {
        if (!description) return [];
        const skills = [];
        const text = description.toLowerCase();
        
        this.SKILL_KEYWORDS.forEach(skill => {
            const escapedSkill = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
            if (regex.test(text)) {
                skills.push(this.normalizeSkill(skill));
            }
        });

        // Special case mappings
        if (/\b(javascript|js)\b/i.test(text)) skills.push('JavaScript');
        if (/\b(node|nodejs)\b/i.test(text)) skills.push('Node.js');
        
        return [...new Set(skills)];
    }

    static normalizeSkill(skill) {
        const mapping = {
            'JS': 'JavaScript',
            'Node': 'Node.js',
            'ReactJS': 'React',
            'Postgres': 'PostgreSQL',
            'ExpressJS': 'Express'
        };
        return mapping[skill] || skill;
    }
}

module.exports = ScraperService;
