"use client";

import { useEffect, useState } from "react";
import { TrendingUp, MapPin, Briefcase, Zap, BarChart3, Globe, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface InsightData {
    top_skills: { name: string; value: number }[];
    top_locations: { name: string; value: number }[];
    market_sentiment: string;
    last_updated: string;
}

export default function InsightsPage() {
    const [data, setData] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/stats/insights`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error("Failed to fetch insights:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const maxSkillValue = Math.max(...(data?.top_skills?.map(s => s.value) || [100]));
    const maxLocValue = Math.max(...(data?.top_locations?.map(l => l.value) || [100]));

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <header className="mb-12 text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4"
                >
                    <TrendingUp className="w-4 h-4" />
                    Market Intelligence
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black mb-4 gradient-text"
                >
                    Global Job Market Insights
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground max-w-2xl mx-auto"
                >
                    Real-time analysis of the technology landscape based on 10,000+ verified listings across our premium corporate boards.
                </motion.p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Top Skills Chart */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="glass p-8 rounded-3xl border border-white/10"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">Trending Skills</h2>
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">Demand Index</span>
                    </div>
                    
                    <div className="space-y-6">
                        {data?.top_skills?.map((skill, idx) => (
                            <div key={skill.name} className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>{skill.name}</span>
                                    <span className="text-muted-foreground">{skill.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(skill.value / maxSkillValue) * 100}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Top Locations Chart */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="glass p-8 rounded-3xl border border-white/10"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">Geographic Reach</h2>
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">Volume</span>
                    </div>
                    
                    <div className="space-y-6">
                        {data?.top_locations?.map((loc, idx) => (
                            <div key={loc.name} className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                        {loc.name}
                                    </div>
                                    <span className="text-muted-foreground">{loc.value} jobs</span>
                                </div>
                                <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(loc.value / maxLocValue) * 100}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-sm text-center text-emerald-500 font-medium">
                            <TrendingUp className="w-4 h-4 inline mr-2" />
                            Remote work remains the #1 category globally.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Market Stats Footer */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
                <div className="glass p-6 rounded-2xl border border-white/10 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Market Sentiment</p>
                    <p className="text-2xl font-bold text-primary">{data?.market_sentiment}</p>
                </div>
                <div className="glass p-6 rounded-2xl border border-white/10 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Last Update</p>
                    <p className="text-2xl font-bold">{data?.last_updated}</p>
                </div>
                <div className="glass p-6 rounded-2xl border border-white/10 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Data Origin</p>
                    <p className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Premium ATS
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
