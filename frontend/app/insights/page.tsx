"use client";

import { useEffect, useState } from "react";
import { TrendingUp, MapPin, Briefcase, Zap, BarChart3, Globe, Shield, Info, Activity, Database, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface InsightData {
    top_skills: { name: string; value: number; growth: string; market_share: string }[];
    top_locations: { name: string; value: string; label: string }[];
    metrics: {
        sample_size: number;
        data_sources: string[];
        confidence_score: string;
        market_sentiment: string;
    };
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
            <div className="container mx-auto px-4 py-20 flex flex-col justify-center items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Aggregating Market Intelligence...</p>
            </div>
        );
    }

    const maxSkillValue = Math.max(...(data?.top_skills?.map(s => s.value) || [100]));

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <header className="mb-12 text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-sm font-bold mb-4 border border-indigo-500/20"
                >
                    <Activity className="w-4 h-4" />
                    Live Market Intelligence Report
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
                >
                    The State of <span className="gradient-text">Tech Talent 2025</span>
                </motion.h1>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground"
                >
                    <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                        <Database className="w-3.5 h-3.5" />
                        Sample Size: <span className="text-foreground font-bold">{data?.metrics.sample_size?.toLocaleString()}+ Listings</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                        <Shield className="w-3.5 h-3.5" />
                        Confidence: <span className="text-foreground font-bold">{data?.metrics.confidence_score}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        Updated: <span className="text-foreground font-bold">
                            {data?.last_updated ? formatDistanceToNow(new Date(data.last_updated), { addSuffix: true }) : "Just now"}
                        </span>
                    </span>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
                {/* Top Skills Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="md:col-span-7 glass p-8 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/5"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Core Skill Demand</h2>
                                <p className="text-xs text-muted-foreground">Weighted market share index</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1">Status</div>
                             <div className="inline-flex items-center gap-1 text-emerald-500 text-xs font-bold">
                                 <TrendingUp className="w-3 h-3" />
                                 Active
                             </div>
                        </div>
                    </div>
                    
                    <div className="space-y-5">
                        {data?.top_skills?.map((skill, idx) => (
                            <div key={skill.name} className="group">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{skill.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black uppercase ${skill.market_share === 'High' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-muted text-muted-foreground'}`}>
                                            {skill.market_share}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono font-bold text-emerald-500">{skill.growth}</span>
                                        <span className="text-lg font-black">{skill.value}%</span>
                                    </div>
                                </div>
                                <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(skill.value / maxSkillValue) * 100}%` }}
                                        transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.05 }}
                                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full relative"
                                    >
                                        <div className="absolute top-0 right-0 h-full w-4 bg-white/20 blur-sm" />
                                    </motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Workplace Dynamics & Distribution */}
                <div className="md:col-span-5 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-background to-emerald-500/5"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Workplace Policy</h2>
                                <p className="text-xs text-muted-foreground">Global role distribution</p>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            {data?.top_locations?.map((loc, idx) => (
                                <div key={loc.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center font-bold text-xs">
                                            {loc.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{loc.name}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase font-black">{loc.label}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black">{loc.value}</div>
                                        <div className="h-1 w-20 bg-muted/50 rounded-full overflow-hidden mt-1">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: loc.value }}
                                                className={`h-full ${idx === 0 ? 'bg-emerald-500' : (idx === 1 ? 'bg-amber-500' : 'bg-blue-500')}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4"
                    >
                        <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm mb-1">Intelligence Methodology</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Our data combines real-time signals from <span className="text-foreground font-medium">{data?.metrics.data_sources.slice(0, 3).join(", ")}</span> and {data?.metrics.data_sources.length! - 3} other sources, weighted against historical benchmarks and seasonality.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Verification Footer */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center justify-between p-8 glass rounded-3xl border border-white/10 bg-muted/5 gap-8"
            >
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {data?.metrics.data_sources.map((source, i) => (
                            <div key={i} className="w-10 h-10 rounded-full bg-background border-2 border-muted flex items-center justify-center text-[10px] font-black uppercase overflow-hidden shadow-lg">
                                {source[0]}
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className="text-sm font-bold">Verified Data Sources</div>
                        <div className="text-xs text-muted-foreground">{data?.metrics.data_sources.join(" • ")}</div>
                    </div>
                </div>
                <div className="text-center md:text-right">
                    <div className="text-xs text-muted-foreground uppercase font-black mb-1">Sentiment Index</div>
                    <div className={`text-2xl font-black ${data?.metrics.market_sentiment === 'Positive' || data?.metrics.market_sentiment === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {data?.metrics.market_sentiment}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
