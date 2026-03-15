"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { CheckCircle2, AlertCircle, RefreshCw, ArrowRightLeft, FileText, Briefcase, Zap, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface MatchResponse {
    match_score?: number;
    semantic_similarity?: number;
    experience_match?: string;
    category_match?: Record<string, number>;
    advice?: string[];
    strengths?: string[];
    weaknesses?: string[];
    matched_skills?: string[];
    missing_skills?: string[];
}

export default function ResumeJobMatch() {
    const [resume, setResume] = useState("");
    const [jd, setJd] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<MatchResponse | null>(null);

    const handleMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resume || !jd) return;

        setLoading(true);
        setResult(null);

        try {
            const data = await apiRequest<MatchResponse>("/ats/match", {
                method: "POST",
                body: JSON.stringify({ resume_text: resume, job_description: jd })
            });

            setResult(data);
            if ((data.match_score ?? 0) > 80) {
                toast.success("Excellent match found!");
            } else if ((data.match_score ?? 0) > 50) {
                toast.info("Moderate match. Review the gap analysis.");
            } else {
                toast.warning("Low match score. Significant skill gaps detected.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const matchScore = result?.match_score ?? 0;
    const semanticSimilarity = result?.semantic_similarity ?? 0;
    const categoryMatchEntries = Object.entries(result?.category_match || {});
    const advice = result?.advice ?? [];
    const strengths = result?.strengths ?? [];
    const weaknesses = result?.weaknesses ?? [];
    const matchedSkills = result?.matched_skills ?? [];
    const missingSkills = result?.missing_skills ?? [];

    return (
        <main className="min-h-screen flex flex-col pb-20">
            <Navbar />

            <section className="pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold mb-6">
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>AI Professional Matching v2.0</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Resume vs Job Match</h1>
                    <p className="text-muted-foreground text-lg">
                        See how well your profile matches a specific job description using AI.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-3xl glass p-6 space-y-4">
                                <h3 className="font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Your Resume</h3>
                                <textarea
                                    placeholder="Paste your Resume here..."
                                    className="w-full h-80 bg-white/5 border border-white/20 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-secondary outline-none resize-none placeholder:text-muted-foreground/70"
                                    value={resume}
                                    onChange={(e) => setResume(e.target.value)}
                                />
                            </div>
                            <div className="rounded-3xl glass p-6 space-y-4">
                                <h3 className="font-bold flex items-center gap-2"><Briefcase className="w-4 h-4 text-secondary" /> Job Description</h3>
                                <textarea
                                    placeholder="Paste the Job Description here..."
                                    className="w-full h-80 bg-white/5 border border-white/20 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-secondary outline-none resize-none placeholder:text-muted-foreground/70"
                                    value={jd}
                                    onChange={(e) => setJd(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleMatch}
                            disabled={loading || !resume || !jd}
                            className="w-full py-4 rounded-2xl bg-primary text-white font-bold hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> Expert Semantic Analysis</>}
                        </button>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {!result && !loading ? (
                                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border-2 border-dashed border-border/40">
                                    <ArrowRightLeft className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                                    <p className="text-muted-foreground">Submit both fields to see AI matching results.</p>
                                </div>
                            ) : loading ? (
                                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 rounded-3xl glass">
                                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-6" />
                                    <h4 className="text-xl font-bold mb-2">Calculating Similarity...</h4>
                                    <p className="text-muted-foreground text-sm">Performing semantic analysis and skill gap detection.</p>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="rounded-3xl glass p-8 border-primary/40 text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                                        <h3 className="text-muted-foreground text-sm font-bold uppercase tracking-widest mb-2">Match Score</h3>
                                        <div className="text-6xl font-black gradient-text">{matchScore}%</div>
                                        <div className="mt-4 flex justify-center gap-2">
                                            <Badge label={`Similarity: ${semanticSimilarity}%`} color="blue" />
                                            <Badge label={`Exp: ${result?.experience_match || "N/A"}`} color="green" />
                                        </div>
                                    </div>

                                    <div className="rounded-3xl glass p-6">
                                        <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> Category Match
                                        </h4>
                                        <div className="space-y-4">
                                            {categoryMatchEntries.map(([cat, score]) => (
                                                <div key={cat} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-bold">
                                                        <span>{cat}</span>
                                                        <span className="text-primary">{score}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${score}%` }}
                                                            className="h-full bg-primary"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-3xl glass p-6 border-accent/20 bg-accent/5">
                                        <h4 className="font-bold mb-4 flex items-center gap-2 text-accent">
                                            <Zap className="w-4 h-4" /> AI Expert Advice
                                        </h4>
                                        <ul className="space-y-3">
                                            {advice.map((adv, i) => (
                                                <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                                                    <span className="text-accent mt-1">-</span> {adv}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-3xl glass p-6 border-green-500/20">
                                            <h4 className="font-bold mb-3 text-xs uppercase text-green-400 flex items-center gap-2">
                                                <CheckCircle2 className="w-3 h-3" /> Strengths
                                            </h4>
                                            <ul className="space-y-2">
                                                {strengths.map((s, i) => (
                                                    <li key={i} className="text-[10px] text-muted-foreground leading-tight italic">- {s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="rounded-3xl glass p-6 border-red-500/20">
                                            <h4 className="font-bold mb-3 text-xs uppercase text-red-400 flex items-center gap-2">
                                                <AlertCircle className="w-3 h-3" /> Gaps
                                            </h4>
                                            <ul className="space-y-2">
                                                {weaknesses.map((w, i) => (
                                                    <li key={i} className="text-[10px] text-muted-foreground leading-tight italic">- {w}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl glass p-6">
                                        <h4 className="font-bold mb-4 flex items-center gap-2 text-green-400">
                                            <CheckCircle2 className="w-4 h-4" /> Matching Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {matchedSkills.length > 0 ? (
                                                matchedSkills.map((s, i) => (
                                                    <span key={i} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-medium border border-green-500/20">{s}</span>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">No matching skills detected.</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-3xl glass p-6">
                                        <h4 className="font-bold mb-4 flex items-center gap-2 text-yellow-500">
                                            <AlertCircle className="w-4 h-4" /> Missing Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {missingSkills.length > 0 ? (
                                                missingSkills.map((s, i) => (
                                                    <span key={i} className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs font-medium border border-yellow-500/20">{s}</span>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">No missing skills found! Perfect alignment.</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>
        </main>
    );
}

const Badge = ({ label, color }: { label: string; color: string }) => (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${color === "green" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
        "bg-blue-500/10 text-blue-400 border border-blue-500/20"
        }`}>
        {label}
    </span>
);
