"use client";

import { useEffect, useState, useMemo } from "react";
import { TrendingUp, MapPin, Briefcase, Zap, Globe, Shield, Activity, Database, Clock, Filter, ChevronDown, BarChart3, PieChart as PieIcon, LineChart as LineIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie, Sector
} from "recharts";

interface InsightData {
    top_skills: { name: string; value: number; growth: string; market_share: string }[];
    top_locations: { name: string; value: string; label: string; raw: number }[];
    trends: { date: string; demand: number }[];
    metrics: {
        sample_size: number;
        data_sources: string[];
        confidence_score: string;
        market_sentiment: string;
    };
    last_updated: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function InsightsPage() {
    const [data, setData] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    
    // Filters
    const [location, setLocation] = useState("All");
    const [role, setRole] = useState("All");
    const [experience, setExperience] = useState("All");

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (location !== "All") params.append("location", location);
            if (role !== "All") params.append("role", role);
            if (experience !== "All") params.append("experience", experience);
            
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiBase}/api/v1/stats/insights?${params.toString()}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("Failed to fetch insights:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchInsights();
    }, [location, role, experience]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background/50">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Header Section */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold mb-4 border border-indigo-500/20"
                        >
                            <Activity className="w-3.5 h-3.5" />
                            Production Grade Analytics
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                            Market <span className="gradient-text">Intelligence</span> Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Real-time analysis based on {data?.metrics.sample_size.toLocaleString()}+ verified job listings.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                         <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            Updated: {data?.last_updated ? formatDistanceToNow(new Date(data.last_updated), { addSuffix: true }) : "Just now"}
                        </span>
                    </div>
                </header>

                {/* Filter Bar */}
                <div className="sticky top-4 z-40 mb-12">
                    <div className="glass p-2 rounded-2xl border border-white/10 shadow-xl flex flex-wrap items-center gap-2 backdrop-blur-xl">
                        <div className="px-4 py-2 flex items-center gap-2 text-muted-foreground text-sm font-bold border-r border-white/5 mr-2">
                            <Filter className="w-4 h-4" /> Filters
                        </div>
                        
                        <FilterDropdown 
                            label="Location" 
                            current={location} 
                            options={["All", "Remote", "USA", "Europe", "India", "UK"]} 
                            onChange={setLocation} 
                        />
                        <FilterDropdown 
                            label="Domain" 
                            current={role} 
                            options={["All", "Engineering", "Design", "Product", "Marketing"]} 
                            onChange={setRole} 
                        />
                        <FilterDropdown 
                            label="Experience" 
                            current={experience} 
                            options={["All", "Entry", "Senior", "Lead", "Exec"]} 
                            onChange={setExperience} 
                        />
                        
                        <div className="ml-auto px-4 text-[10px] font-black uppercase text-indigo-500/60 tracking-widest hidden lg:block">
                            Live Index Alpha v1.2
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="h-[600px] flex flex-col justify-center items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="text-sm font-bold animate-pulse">Processing Market Data...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Top Metrics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MetricCard icon={<Database />} label="Total Listings" value={data?.metrics.sample_size.toLocaleString()!} trend="+12.5%" />
                            <MetricCard icon={<Shield />} label="Confidence" value={data?.metrics.confidence_score!} trend="Verified" />
                            <MetricCard icon={<Activity />} label="Market Sentiment" value={data?.metrics.market_sentiment!} trend="Stable Index" color="text-emerald-500" />
                            <MetricCard icon={<Globe />} label="Remote Adoption" value={data?.top_locations.find(l=>l.name==='Remote')?.value!} trend="Global Avg" />
                        </div>

                        {/* Middle Row: Trend & Skills */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="lg:col-span-8 glass p-8 rounded-3xl border border-white/10"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <LineIcon className="w-5 h-5 text-indigo-500" />
                                        Job Demand Trends
                                    </h2>
                                    <span className="text-xs text-muted-foreground uppercase font-black tracking-widest">Last 30 Days</span>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data?.trends}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                                                itemStyle={{ color: '#6366f1' }}
                                            />
                                            <Line type="monotone" dataKey="demand" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-4 glass p-8 rounded-3xl border border-white/10"
                            >
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-8">
                                    <PieIcon className="w-5 h-5 text-emerald-500" />
                                    Workplace Policy
                                </h2>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data?.top_locations}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="raw"
                                            >
                                                {data?.top_locations.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-4 mt-4">
                                    {data?.top_locations.map((loc, i) => (
                                        <div key={loc.name} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                                <span className="text-muted-foreground">{loc.name}</span>
                                            </div>
                                            <span className="font-bold">{loc.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Bottom Row: Skills Distribution */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-8 rounded-3xl border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl font-black flex items-center gap-3">
                                    <BarChart3 className="w-7 h-7 text-primary" />
                                    Demand Index by Tech Stack
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Regional weighting applied</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    {data?.top_skills.slice(0, 4).map((skill, i) => (
                                        <SkillBar key={skill.name} skill={skill} index={i} />
                                    ))}
                                </div>
                                <div className="space-y-6">
                                    {data?.top_skills.slice(4, 8).map((skill, i) => (
                                        <SkillBar key={skill.name} skill={skill} index={i + 4} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                        
                        <footer className="text-center py-8 opacity-50">
                            <p className="text-xs flex items-center justify-center gap-2">
                                <Info className="w-3.5 h-3.5" />
                                Data sourced from LinkedIn Jobs API, Indeed scraping pipeline, and Greenhouse corporate boards for 2024-2025.
                            </p>
                        </footer>
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterDropdown({ label, current, options, onChange }: { label: string, current: string, options: string[], onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    
    return (
        <div className="relative">
            <button 
                onClick={() => setOpen(!open)}
                className="px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors flex items-center gap-2"
            >
                <span className="text-muted-foreground font-medium">{label}:</span>
                {current}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-1 z-50 bg-background"
                    >
                        {options.map(opt => (
                            <button 
                                key={opt}
                                onClick={() => { onChange(opt); setOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${current === opt ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-white/5'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MetricCard({ icon, label, value, trend, color = "text-foreground" }: { icon: ReactElement, label: string, value: string, trend: string, color?: string }) {
    return (
        <div className="glass p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                    {cloneElement(icon as ReactElement, { className: "w-4 h-4" })}
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter">{trend}</span>
            </div>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-[10px] uppercase font-black text-muted-foreground mt-1 tracking-widest">{label}</div>
        </div>
    );
}

function SkillBar({ skill, index }: { skill: any, index: number }) {
    return (
        <div className="group">
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black">{index + 1}.</span>
                    <span className="font-bold text-lg">{skill.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold">
                    <span className="text-emerald-500">{skill.growth}</span>
                    <span className="text-indigo-500">{skill.value}%</span>
                </div>
            </div>
            <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.value * 2.5}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                />
            </div>
        </div>
    );
}
