"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { History, Shield, FileCheck, Search, Zap, ArrowUpRight, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface StatCard {
    label: string;
    value: string;
    trend: string;
}

interface RecentActivity {
    type: string;
    target: string;
    status: string;
    score: number;
    time: string;
}

interface DashboardResponse {
    stats?: StatCard[];
    recent_activity?: RecentActivity[];
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/stats/summary`);
            if (!response.ok) throw new Error("Failed to fetch stats");
            const json = await response.json() as DashboardResponse;
            setData(json);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to load analytics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-primary" />
                </div>
            </main>
        );
    }

    const stats = data?.stats || [
        { label: "Links Verified", value: "0", icon: <Shield className="w-5 h-5 text-primary" />, trend: "Real-time" },
        { label: "Resume Scans", value: "0", icon: <FileCheck className="w-5 h-5 text-secondary" />, trend: "0 avg score" },
        { label: "Jobs Found", value: "0", icon: <Search className="w-5 h-5 text-accent" />, trend: "Global" }
    ];

    // Map icons back since they come from backend as text/labels
    const statsWithIcons = stats.map((s, i) => ({
        ...s,
        icon: i === 0 ? <Shield className="w-5 h-5 text-primary" /> :
            i === 1 ? <FileCheck className="w-5 h-5 text-secondary" /> :
                <Search className="w-5 h-5 text-accent" />
    }));

    const recentActivity = data?.recent_activity || [];

    return (
        <main className="min-h-screen flex flex-col pb-20">
            <Navbar />

            <section className="pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Visitor Analytics</h1>
                        <p className="text-muted-foreground italic font-medium">Real-time data from all JobGuard AI users.</p>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh Data
                    </button>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4 text-sm text-yellow-100">
                        <div className="flex items-center gap-2 font-semibold text-yellow-300">
                            <AlertCircle className="h-4 w-4" />
                            Live analytics could not be loaded
                        </div>
                        <p className="mt-2 text-yellow-100/80">
                            Showing fallback values until the backend or database connection recovers. {error}
                        </p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {statsWithIcons.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-3xl glass border border-white/5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-white/5">{stat.icon}</div>
                                <div className="text-green-400 text-xs font-bold flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> {stat.trend}
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Activity Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <History className="w-5 h-5" /> Live Scan History
                            </h3>
                        </div>

                        <div className="rounded-3xl glass border border-border/40 overflow-hidden">
                            {recentActivity.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-white/5">
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Type</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Target</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Score</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {recentActivity.map((act, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${act.status === "Safe" ? "bg-green-500" : "bg-red-500"
                                                            }`} />
                                                        <span className="font-bold text-sm">{act.type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-sm font-medium truncate max-w-[200px]">{act.target}</div>
                                                    <div className={`text-[10px] uppercase font-bold ${act.status === "Safe" ? "text-green-500" : "text-red-500"
                                                        }`}>{act.status}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold border ${act.score > 70 ? "border-green-500/20 text-green-400" : "border-red-500/20 text-red-400"
                                                        }`}>{act.score}%</div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="text-xs text-muted-foreground mb-1">{act.time}</div>
                                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-20 text-center text-muted-foreground">
                                    No recent activity recorded yet. Start scanning to see data!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Cards */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-3xl glass border border-primary/20 bg-primary/5">
                            <h4 className="text-lg font-bold mb-4">Database Security</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                All scan results are stored securely in our PostgreSQL database. We use this data to
                                continually train our detection models and improve accuracy for everyone.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl glass">
                            <h4 className="text-lg font-bold mb-4">Live Insights</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0"><Zap className="w-4 h-4" /></div>
                                    <div>
                                        <div className="text-sm font-bold">Data Integrity</div>
                                        <div className="text-xs text-muted-foreground">All data shown is pulled directly from the live SQL tables.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
