"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { FileCheck, Upload, CheckCircle2, AlertCircle, RefreshCw, Zap, Target, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { apiFormRequest } from "@/lib/api";

interface AtsBreakdown {
    keyword_score?: number;
    formatting_score?: number;
    structure_score?: number;
    readability_score?: number;
}

interface AtsResponse {
    ats_score?: number;
    breakdown?: AtsBreakdown;
    suggestions?: string[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = [".pdf", ".docx", ".txt"];

export default function ATSChecker() {
    const [resume, setResume] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AtsResponse | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const extension = selectedFile.name.slice(selectedFile.name.lastIndexOf(".")).toLowerCase();

            if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
                toast.error("Upload a PDF, DOCX, or TXT resume.");
                e.target.value = "";
                return;
            }

            if (selectedFile.size > MAX_FILE_SIZE) {
                toast.error("Resume file must be 5MB or smaller.");
                e.target.value = "";
                return;
            }

            setFile(selectedFile);
            setResume(""); // Clear text if file is uploaded
        }
    };

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resume && !file) {
            toast.error("Please paste your resume or upload a file.");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const formData = new FormData();
            if (file) {
                formData.append("file", file);
            } else {
                formData.append("resume_text", resume);
            }

            const data = await apiFormRequest<AtsResponse>("/ats/ats-check", formData);
            setResult(data);
            if ((data.ats_score ?? 0) > 70) {
                toast.success("Resume analysis complete. Strong score!");
            } else {
                toast.info("Analysis complete. Check suggestions for improvements.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const score = result?.ats_score ?? 0;
    const breakdown = result?.breakdown;
    const suggestions = result?.suggestions ?? [];

    return (
        <main className="min-h-screen flex flex-col pb-20">
            <Navbar />

            <section className="pt-24 pb-12 px-6 max-w-5xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
                        <Zap className="w-3 h-3" />
                        <span>AI Resume Intelligence v1.2</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">ATS Resume Score Checker</h1>
                    <p className="text-muted-foreground text-lg">
                        Scan your resume against global ATS benchmarks used by top employers.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Input Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="rounded-3xl glass p-8 border-border/60">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Resume Input</h3>
                                <div className="text-xs text-muted-foreground">
                                    {file ? file.name : `${resume.length} characters`}
                                </div>
                            </div>

                            <div
                                onClick={() => !file && fileInputRef.current?.click()}
                                className={`mb-6 p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center group ${file
                                    ? "border-primary bg-primary/5"
                                    : "border-border/40 hover:border-primary/50 hover:bg-white/5 cursor-pointer"
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".pdf,.docx,.txt"
                                    className="hidden"
                                />
                                {file ? (
                                    <>
                                        <div className="p-4 rounded-full bg-secondary/20 text-secondary mb-4">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div className="font-bold text-lg mb-1">{file.name}</div>
                                        <div className="text-xs text-muted-foreground mb-4">{(file.size / 1024).toFixed(1)} KB</div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center gap-2"
                                        >
                                            <X className="w-3 h-3" /> Remove File
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-4 rounded-full bg-white/5 text-muted-foreground mb-4 group-hover:text-secondary group-hover:bg-secondary/10 transition-all">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <div className="font-bold text-lg mb-1">Upload Resume File</div>
                                        <div className="text-xs text-muted-foreground">PDF, DOCX, or TXT (Max 5MB)</div>
                                    </>
                                )}
                            </div>

                            {!file && (
                                <textarea
                                    placeholder="Or paste your resume text here... (Experience, Skills, Education)"
                                    className="w-full h-48 bg-white/5 border border-white/20 rounded-2xl p-6 focus:ring-2 focus:ring-secondary/50 outline-none transition-all resize-none text-sm leading-relaxed mb-6 placeholder:text-muted-foreground/70"
                                    value={resume}
                                    onChange={(e) => setResume(e.target.value)}
                                />
                            )}

                            <button
                                onClick={handleCheck}
                                disabled={loading || (!resume && !file)}
                                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                {loading ? "Analyzing..." : "Check ATS Score"}
                            </button>
                        </div>
                    </motion.div>

                    {/* Results Side */}
                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {!result && !loading ? (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border-2 border-dashed border-border/40">
                                    <div className="p-6 rounded-full bg-secondary/10 text-secondary mb-4">
                                        <FileCheck className="w-12 h-12" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-2">Ready for Scan</h4>
                                    <p className="text-muted-foreground max-w-xs">Enter your resume text on the left to begin the AI analysis.</p>
                                </div>
                            ) : loading ? (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-3xl glass">
                                    <div className="relative mb-8">
                                        <div className="w-24 h-24 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Target className="w-8 h-8 text-secondary animate-pulse" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold mb-2">Analyzing Structure...</h4>
                                    <p className="text-muted-foreground">Identifying sections and technical keywords.</p>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Score Card */}
                                    <div className="rounded-3xl glass p-8 border-secondary/30 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                                        <div className="flex items-end justify-between mb-8">
                                            <div>
                                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Overall ATS Score</h3>
                                                <div className="text-6xl font-black text-primary">{score}</div>
                                            </div>
                                            <div className="text-right pb-1">
                                                {score >= 80 ? (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold ring-1 ring-green-500/20">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Excellent</span>
                                                    </div>
                                                ) : score >= 60 ? (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold ring-1 ring-blue-500/20">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Good Match</span>
                                                    </div>
                                                ) : score >= 40 ? (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-bold ring-1 ring-yellow-500/20">
                                                        <AlertCircle className="w-3 h-3" />
                                                        <span>Average</span>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold ring-1 ring-red-500/20">
                                                        <AlertCircle className="w-3 h-3" />
                                                        <span>{score === 0 ? "Invalid Input" : "Poor Match"}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <ScoreMetric label="Keywords" score={breakdown?.keyword_score ?? 0} />
                                            <ScoreMetric label="Formatting" score={breakdown?.formatting_score ?? 0} />
                                            <ScoreMetric label="Structure" score={breakdown?.structure_score ?? 0} />
                                            <ScoreMetric label="Readability" score={breakdown?.readability_score ?? 0} />
                                        </div>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="rounded-3xl glass p-8">
                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                                            Improvement Suggestions
                                        </h3>
                                        <div className="space-y-4">
                                            {suggestions.length > 0 ? (
                                                suggestions.map((suggestion, i) => (
                                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 text-sm hover:bg-white/10 transition-colors">
                                                        <div className="p-1 px-2 h-fit rounded-lg bg-white/10 text-[10px] font-bold shrink-0">#{i + 1}</div>
                                                        <p className="leading-relaxed">{suggestion}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No suggestions were returned for this resume yet.</p>
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

const ScoreMetric = ({ label, score }: { label: string; score: number }) => (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">{label}</div>
        <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{score}</span>
            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: `${score}%` }} />
            </div>
        </div>
    </div>
);
