"use client";

import { useEffect, useState, useMemo, cloneElement, ReactElement } from "react";
import { TrendingUp, MapPin, Briefcase, Zap, Globe, Shield, Activity, Database, Clock, Filter, ChevronDown, BarChart3, PieChart as PieIcon, LineChart as LineIcon, Info, LoaderCircle as Loader2, Sparkles, Rocket } from "lucide-react";
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
    recommendations: { skill: string; reason: string; type: string }[];
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
                            <Zap className="w-3.5 h-3.5 fill-indigo-500" />
                            Premium Career Intelligence
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                            Market <span className="gradient-text">Insights</span> Pro
                        </h1>
                        <p className="text-muted-foreground">
                            Global talent analyzer fueled by {data?.metrics.sample_size.toLocaleString()}+ real-time listings.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                         <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full border border-white/5">
                            <Clock className="w-3.5 h-3.5" />
                            Last Sync: {data?.last_updated ? formatDistanceToNow(new Date(data.last_updated), { addSuffix: true }) : "Just now"}
                        </span>
                    </div>
                </header>

                {/* SaaS Filter Bar */}
                <div className="sticky top-4 z-40 mb-12">
                    <div className="glass p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-wrap items-center gap-2 backdrop-blur-xl bg-background/80">
                        <div className="px-4 py-2 flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest border-r border-white/5 mr-2">
                            <Filter className="w-3.5 h-3.5" /> Market Context
                        </div>
                        
                        <FilterDropdown label="Region" current={location} options={["All", "Remote", "USA", "Europe", "India", "UK"]} onChange={setLocation} />
                        <FilterDropdown label="Job Domain" current={role} options={["All", "Engineering", "Design", "Product", "Marketing"]} onChange={setRole} />
                        <FilterDropdown label="Exp. Tier" current={experience} options={["All", "Entry", "Senior", "Lead", "Exec"]} onChange={setExperience} />
                        
                        <div className="ml-auto px-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-500/80 tracking-widest uppercase">Live Scraper Active</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="h-[600px] flex flex-col justify-center items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="text-sm font-bold tracking-widest uppercase opacity-50">Aggregating Market Data...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* KPI Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MetricCard icon={<Database />} label="Analysed Listings" value={data?.metrics.sample_size.toLocaleString()!} trend="GLOBAL" />
                            <MetricCard icon={<Activity />} label="Trend Velocity" value={data?.metrics.market_sentiment!} trend="DYNAMICS" color="text-indigo-500" />
                            <MetricCard icon={<Globe />} label="Remote Adoption" value={data?.top_locations.find(l=>l.name==='Remote')?.value!} trend="ADOPTION" />
                            <MetricCard icon={<Shield />} label="Trust Cluster" value={data?.metrics.confidence_score!} trend="VERIFIED" />
                        </div>

                        {/* Visual Intelligence Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Trend Chart */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8 glass p-8 rounded-3xl border border-white/10 shadow-lg">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold flex items-center gap-2 italic">
                                        <LineIcon className="w-5 h-5 text-indigo-500" />
                                        Demand Curve <span className="text-xs font-normal text-muted-foreground not-italic opacity-50 ml-2">(30D View)</span>
                                    </h2>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data?.trends}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: '#6366f1' }} />
                                            <Line type="monotone" dataKey="demand" stroke="#6366f1" strokeWidth={5} dot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Recommendations Area */}
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-4">
                                <div className="glass p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 opacity-10">
                                        <Sparkles className="w-24 h-24 text-indigo-500" />
                                    </div>
                                    <h2 className="text-lg font-black flex items-center gap-2 mb-4 uppercase tracking-wider text-indigo-400">
                                        <Rocket className="w-5 h-5" /> Rising Stars
                                    </h2>
                                    <div className="space-y-3">
                                        {data?.recommendations.map((rec, i) => (
                                            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-sm group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{rec.skill}</span>
                                                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-black">RISING</span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed italic">"{rec.reason}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="glass p-6 rounded-3xl border border-white/10">
                                    <h2 className="text-sm font-black flex items-center gap-2 mb-4 uppercase tracking-widest text-muted-foreground">
                                        <Globe className="w-4 h-4" /> Global Policy
                                    </h2>
                                    <div className="h-[150px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={data?.top_locations} innerRadius={45} outerRadius={60} paddingAngle={5} dataKey="raw">
                                                    {data?.top_locations.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-between mt-2 px-4">
                                        {data?.top_locations.map((loc, i) => (
                                            <div key={loc.name} className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: COLORS[i] }} />
                                                <span className="text-[10px] uppercase font-black opacity-50">{loc.name[0]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Skills Analytics Section */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-3xl border border-white/10 shadow-lg">
                            <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                                <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <BarChart3 className="w-8 h-8 text-primary" />
                                    </div>
                                    Skill Market Index
                                </h2>
                                <div className="bg-muted px-4 py-2 rounded-2xl border border-white/5 hidden md:block">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-50">Filter:</span>
                                    <span className="text-xs font-black uppercase tracking-widest ml-2">{role} {location}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                {/* Interactive Bar Chart */}
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data?.top_skills} layout="vertical" margin={{ left: 20, right: 40 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" stroke="#999" fontSize={12} axisLine={false} tickLine={false} width={80} />
                                            <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '12px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                            <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={25}>
                                                {data?.top_skills.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : 'rgba(99, 102, 241, 0.3)'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Detailed Skill Metrics */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-white/5 pb-2">
                                        <span>Tech Stack</span>
                                        <div className="flex gap-12">
                                            <span>Market Share</span>
                                            <span>Growth</span>
                                        </div>
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto pr-4 space-y-4 thin-scrollbar">
                                        {data?.top_skills.map((skill, i) => (
                                            <div key={skill.name} className="flex justify-between items-center group cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xl font-black opacity-20 group-hover:opacity-100 transition-opacity">{(i + 1).toString().padStart(2, '0')}</span>
                                                    <span className="font-bold border-l-2 border-indigo-500/20 pl-4 group-hover:border-indigo-500 transition-all">{skill.name}</span>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-1 bg-muted/30 rounded-full overflow-hidden hidden md:block">
                                                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${skill.value}%` }} className="h-full bg-indigo-500" />
                                                    </div>
                                                    <span className="text-sm font-black w-10 text-right">{skill.value}%</span>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${skill.growth.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {skill.growth}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        
                        <footer className="text-center py-10">
                            <div className="inline-flex items-center gap-6 bg-muted/30 px-6 py-3 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> LinkedIn Integrated</span>
                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Indeed Scraped</span>
                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Greenhouse Alpha</span>
                            </div>
                            <p className="mt-4 text-[10px] text-muted-foreground opacity-30 italic">
                                Market Insights Pro v2.4 (SaaS Tier) • © 2026 JobGuard Intelligence
                            </p>
                        </footer>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .thin-scrollbar::-webkit-scrollbar { width: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .gradient-text { background: linear-gradient(to right, #6366f1, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            `}</style>
        </div>
    );
}

function FilterDropdown({ label, current, options, onChange }: { label: string, current: string, options: string[], onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    
    return (
        <div className="relative">
            <button 
                onClick={() => setOpen(!open)}
                className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-3 border border-transparent hover:border-white/10"
            >
                <span className="opacity-40">{label}:</span>
                <span className="text-indigo-400">{current}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform opacity-40 ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-3 w-56 glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-1.5 z-50 bg-background/95 backdrop-blur-3xl"
                    >
                        {options.map(opt => (
                            <button 
                                key={opt}
                                onClick={() => { onChange(opt); setOpen(false); }}
                                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${current === opt ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
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
        <div className="glass p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all group overflow-hidden relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/5 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                    {cloneElement(icon, { className: "w-5 h-5" } as any)}
                </div>
                <span className="text-[9px] font-black uppercase text-emerald-500 tracking-tighter bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/10">{trend}</span>
            </div>
            <div className={`text-3xl font-black tracking-tighter ${color} mb-1`}>{value}</div>
            <div className="text-[10px] uppercase font-black text-muted-foreground opacity-40 tracking-[0.2em]">{label}</div>
        </div>
    );
}
