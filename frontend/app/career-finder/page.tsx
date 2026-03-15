"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Search, Globe, CheckCircle2, Building2, MapPin, ExternalLink, RefreshCw, Briefcase, Info, Zap, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function CareerFinder() {
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company) return;

        setLoading(true);
        setResults([]);

        try {
            const baseUrl = `${API_BASE_URL}/scraper/search`;
            const params = new URLSearchParams({
                company: company,
                ...(location ? { location } : {})
            });

            const response = await fetch(`${baseUrl}?${params.toString()}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Search failed");
            }

            const data = await response.json();
            setResults(data.jobs || []);
        } catch (err: any) {
            console.error(err);
            alert(`Search Failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col pb-20">
            <Navbar />

            {/* Modal for Job Details */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedJob(null)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto glass rounded-3xl p-8 sm:p-12 shadow-2xl border border-accent/20"
                        >
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
                            >
                                <RefreshCw className="w-6 h-6 rotate-45" />
                            </button>

                            <div className="flex flex-col gap-8">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 rounded-2xl bg-accent/10">
                                                <Building2 className="w-8 h-8 text-accent" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold">{selectedJob.company}</h2>
                                                <p className="text-muted-foreground flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" /> {selectedJob.location}
                                                </p>
                                            </div>
                                        </div>
                                        <h1 className="text-4xl font-extrabold gradient-text">{selectedJob.role}</h1>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold text-sm">
                                            Source: {selectedJob.source}
                                        </div>
                                        <span className="text-xs text-muted-foreground">Discovered {selectedJob.posted}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-8">
                                        <div>
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                                <Info className="w-5 h-5 text-accent" /> Job Description
                                            </h3>
                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                                {selectedJob.description || "No detailed description available."}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 rounded-2xl glass border-accent/20">
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-accent" /> Details
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Employment Type</p>
                                                    <p className="text-sm font-bold text-accent">{selectedJob.job_type || "Full-time"}</p>
                                                </div>
                                                <div className="pt-4 border-t border-white/5">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Experience</p>
                                                    <p className="text-sm font-bold">{selectedJob.experience || "Not specified"}</p>
                                                </div>
                                                <div className="pt-4 border-t border-white/5">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</p>
                                                    <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                                                        <CheckCircle2 className="w-4 h-4" /> Official Listing
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <a
                                                href={selectedJob.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-5 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
                                            >
                                                Apply Now <ExternalLink className="w-5 h-5" />
                                            </a>
                                            <p className="text-[10px] text-center text-muted-foreground italic">
                                                Redirects to {selectedJob.source} official portal.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {!mounted ? (
                <div className="flex-grow flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
                </div>
            ) : (
                <section className="pt-24 pb-12 px-6 max-w-6xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6">
                            <Globe className="w-3 h-3" />
                            <span>Global Career Aggregator</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Official Career Finder</h1>
                        <p className="text-muted-foreground text-lg">
                            Search company names to find verified job listings from official boards and trusted portals.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <div className="max-w-4xl mx-auto mb-16">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow group">
                                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                    <Building2 className="w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search Role (e.g. AI Engineer)"
                                    required
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 rounded-3xl glass text-lg focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                />
                            </div>

                            <div className="relative group md:w-1/3">
                                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                    <MapPin className="w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Location (e.g. USA, India)"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 rounded-3xl glass text-lg focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-5 rounded-3xl bg-accent text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5" /> Search</>}
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="relative mb-8">
                                    <div className="w-20 h-20 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
                                    <Globe className="absolute inset-0 m-auto w-8 h-8 text-accent animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Scraping Career Portals...</h3>
                                <p className="text-muted-foreground">Checking Greenhouse, Lever, LinkedIn, and Official Sites.</p>
                            </div>
                        ) : results.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-6 px-4">
                                    <h3 className="font-bold text-xl">{results.length} Verified Openings for "{company}"</h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Info className="w-3 h-3" />
                                        Prices and availability updated in real-time.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {results.map((job, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-8 rounded-[2rem] glass hover:border-accent/40 transition-all border border-transparent flex flex-col gap-4 group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Briefcase className="w-24 h-24 rotate-12" />
                                            </div>

                                            <div className="flex justify-between items-start z-10">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {job.verified && (
                                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold">
                                                                <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                                                            </div>
                                                        )}
                                                        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">{job.source}</span>
                                                    </div>
                                                    <h4 className="text-2xl font-bold group-hover:text-accent transition-colors leading-tight mb-2 line-clamp-2">{job.role}</h4>
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">{job.posted}</div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground z-10">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <Building2 className="w-4 h-4 text-accent/60" /> {job.company}
                                                </div>
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <MapPin className="w-4 h-4 text-accent/60" /> {job.location}
                                                </div>
                                            </div>

                                            <div className="mt-2 space-y-3 z-10 flex-grow">
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <p className="text-xs font-bold text-accent/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <Info className="w-3 h-3" /> Job Overview
                                                    </p>
                                                    <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed italic">
                                                        "{job.description || "No description available for this listing."}"
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="px-4 py-2 rounded-xl bg-accent/5 border border-accent/10 flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Experience:</span>
                                                        <span className="text-xs font-bold text-foreground">{job.experience || "N/A"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedJob(job)}
                                                className="mt-6 w-full py-4 rounded-2xl glass border-accent/20 text-accent hover:bg-accent/10 text-center font-bold text-sm flex items-center justify-center gap-2 transition-all z-10"
                                            >
                                                View Details <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : !loading && company ? (
                            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-border/40">
                                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-bold mb-2">No jobs found for "{company}"</h3>
                                <p className="text-muted-foreground text-sm">Try searching for a different company or check spelling.</p>
                            </div>
                        ) : null}
                    </AnimatePresence>
                </section>
            )}
        </main>
    );
}
