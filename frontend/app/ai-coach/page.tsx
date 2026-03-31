"use client";

import { useState, useEffect, Suspense } from "react";
import { Brain, Sparkles, Send, Copy, Check, MessageSquare, FileText, LoaderCircle as Loader2, ArrowRight, Zap, Target, AlertCircle, ListChecks, Wand2, X, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

interface InterviewQuestion {
    question: string;
    hint: string;
}

interface InterviewPrep {
    questions: InterviewQuestion[];
    general_tips: string[];
}

interface CoverLetter {
    salutation: string;
    opening: string;
    body_paragraphs: string[];
    closing: string;
}

interface GapAnalysis {
    match_score: number;
    matching_skills: string[];
    missing_skills: string[];
    improvement_tips: string[];
}

interface SkillEnhancement {
    skill: string;
    suggestions: string[];
}

function AICoachContent() {
    const searchParams = useSearchParams();
    const [jd, setJd] = useState("");
    const [resume, setResume] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"interview" | "cover-letter" | "match">("interview");
    
    const [interviewData, setInterviewData] = useState<InterviewPrep | null>(null);
    const [coverLetterData, setCoverLetterData] = useState<CoverLetter | null>(null);
    const [gapData, setGapData] = useState<GapAnalysis | null>(null);
    const [copied, setCopied] = useState(false);

    // AI Re-writer State
    const [loadingSkill, setLoadingSkill] = useState<string | null>(null);
    const [enhancements, setEnhancements] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const jdParam = searchParams.get("jd");
        if (jdParam) setJd(jdParam);
        
        const savedResume = localStorage.getItem("jobguard_resume");
        if (savedResume) setResume(savedResume);
    }, [searchParams]);

    const saveResume = (val: string) => {
        setResume(val);
        localStorage.setItem("jobguard_resume", val);
    };

    const generateAI = async () => {
        if (!jd.trim()) {
            toast.error("Please provide a job description first.");
            return;
        }

        if (activeTab === "match" && !resume.trim()) {
            toast.error("Please provide your resume text for analysis.");
            return;
        }

        setLoading(true);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
            let endpoint = "";
            let body = {};

            if (activeTab === "interview") {
                endpoint = "/ai/interview-prep";
                body = { job_description: jd };
            } else if (activeTab === "cover-letter") {
                endpoint = "/ai/cover-letter";
                body = { job_description: jd, resume_text: resume };
            } else if (activeTab === "match") {
                endpoint = "/ai/gap-analysis";
                body = { job_description: jd, resume_text: resume };
            }
            
            const res = await fetch(`${apiBase}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            
            if (!res.ok) throw new Error("AI Generation failed");
            
            const result = await res.json();
            if (activeTab === "interview") setInterviewData(result);
            else if (activeTab === "cover-letter") setCoverLetterData(result);
            else if (activeTab === "match") {
                setGapData(result);
                setEnhancements({}); // Clear previous enhancements
            }
            
            toast.success("Analysis complete!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to connect to AI service.");
        } finally {
            setLoading(false);
        }
    };

    const enhanceSkill = async (skill: string) => {
        if (!jd.trim()) return;
        setLoadingSkill(skill);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
            const res = await fetch(`${apiBase}/ai/suggest-bullets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skill_name: skill, job_description: jd }),
            });
            const result = await res.json();
            setEnhancements(prev => ({ ...prev, [skill]: result.suggestions }));
        } catch (err) {
            toast.error("Failed to generate suggestions.");
        } finally {
            setLoadingSkill(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const fullCoverLetter = coverLetterData ? 
        `${coverLetterData.salutation}\n\n${coverLetterData.opening}\n\n${coverLetterData.body_paragraphs.join("\n\n")}\n\n${coverLetterData.closing}` : "";

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-background/50">
            <Navbar />
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12 text-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-sm font-bold mb-4"
                    >
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Career Coaching
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        Elevate Your <span className="gradient-text">Interview Performance</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Personalized coaching and gap analysis to help you land your dream role.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 space-y-6">
                        <div className="glass p-6 rounded-3xl border border-white/10 shadow-xl shadow-indigo-500/5">
                            <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Job Description
                            </label>
                            <textarea 
                                value={jd}
                                onChange={(e) => setJd(e.target.value)}
                                placeholder="Paste the job description here..."
                                className="w-full h-48 bg-background/50 border border-border/40 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none mb-6"
                            />

                            <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-primary" />
                                Your Resume (Optional for Prep, Required for Match)
                            </label>
                            <textarea 
                                value={resume}
                                onChange={(e) => saveResume(e.target.value)}
                                placeholder="Paste your resume summary/skills here..."
                                className="w-full h-48 bg-background/50 border border-border/40 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                            />
                            
                            <button 
                                onClick={generateAI}
                                disabled={loading}
                                className="w-full mt-6 bg-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Brain className="w-5 h-5" />
                                        {activeTab === 'match' ? 'Analyze Resume Gap' : 'Generate Guide'}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                            <h3 className="text-sm font-bold text-indigo-500 mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Pro Tip
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                A Resume-JD match score above 80% significantly increases your chances of passing initial ATS filters.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex p-1 bg-muted/30 rounded-2xl border border-border/40 w-fit overflow-x-auto max-w-full">
                            <button 
                                onClick={() => setActiveTab("interview")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'interview' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <MessageSquare className="w-4 h-4" /> Interview Prep
                            </button>
                            <button 
                                onClick={() => setActiveTab("match")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'match' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Target className="w-4 h-4" /> Resume Match
                            </button>
                            <button 
                                onClick={() => setActiveTab("cover-letter")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'cover-letter' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <FileText className="w-4 h-4" /> Cover Letter
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === "interview" && (
                                <motion.div 
                                    key="interview"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {!interviewData && !loading ? (
                                        <div className="glass p-12 rounded-3xl border border-dashed border-white/20 text-center text-muted-foreground">
                                            <Brain className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>Paste a job description and click generate to get interview practice questions.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {interviewData?.questions?.map((q, idx) => (
                                                <motion.div 
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="glass p-6 rounded-2xl border border-white/10 group"
                                                >
                                                    <div className="flex justify-between items-start gap-4 mb-3">
                                                        <h3 className="font-bold text-lg leading-tight">{q.question}</h3>
                                                        <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-md">Q{idx + 1}</span>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-background/50 text-sm text-muted-foreground border border-border/20 group-hover:border-primary/20 transition-colors">
                                                        <span className="font-bold text-primary text-xs uppercase mr-2 opacity-70">Strategy:</span>
                                                        {q.hint}
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {interviewData?.general_tips && (
                                                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 mt-8">
                                                    <h3 className="font-bold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Preparation Tips</h3>
                                                    <ul className="space-y-2">
                                                        {interviewData?.general_tips?.map((tip, idx) => (
                                                            <li key={idx} className="text-sm text-muted-foreground flex gap-3">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "match" && (
                                <motion.div 
                                    key="match"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {!gapData && !loading ? (
                                        <div className="glass p-12 rounded-3xl border border-dashed border-white/20 text-center text-muted-foreground">
                                            <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>Paste your resume and the JD to see how well you match the role.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="glass p-8 rounded-3xl border border-white/10 text-center relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4">
                                                    <Target className="w-20 h-20 text-indigo-500/5 opacity-20" />
                                                </div>
                                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">ATS Match Score</h3>
                                                <div className="text-7xl font-black gradient-text mb-2">{gapData?.match_score}%</div>
                                                <p className="text-sm text-muted-foreground">
                                                    {gapData?.match_score! > 80 ? "Excellent match! You are ready to apply." : "Good potential, but some key sections could be improved."}
                                                </p>
                                                <div className="h-3 w-full bg-muted/30 rounded-full mt-8 overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${gapData?.match_score}%` }}
                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="glass p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
                                                    <h4 className="flex items-center gap-2 font-bold mb-4 text-emerald-500">
                                                        <Check className="w-4 h-4" /> Strong Keywords
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {gapData?.matching_skills.map(s => (
                                                            <span key={s} className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="glass p-6 rounded-2xl border border-amber-500/10 bg-amber-500/5">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="flex items-center gap-2 font-bold text-amber-500">
                                                            <AlertCircle className="w-4 h-4" /> Missing Skills
                                                        </h4>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {gapData?.missing_skills.map(s => (
                                                                <div key={s} className="group relative">
                                                                    <button 
                                                                        onClick={() => enhanceSkill(s)}
                                                                        className={`px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1.5 ${loadingSkill === s ? 'animate-pulse' : ''}`}
                                                                    >
                                                                        {s}
                                                                        {loadingSkill === s ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 opacity-50" />}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <AnimatePresence>
                                                            {Object.keys(enhancements).map(skill => (
                                                                <motion.div 
                                                                    key={skill}
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: "auto" }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="p-4 rounded-xl bg-background border border-amber-500/20 shadow-lg relative overflow-hidden"
                                                                >
                                                                    <button 
                                                                        onClick={() => setEnhancements(prev => {
                                                                            const next = { ...prev };
                                                                            delete next[skill];
                                                                            return next;
                                                                        })}
                                                                        className="absolute top-2 right-2 p-1 hover:bg-muted rounded-md"
                                                                    >
                                                                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                                                                    </button>
                                                                    <h5 className="text-[10px] font-black uppercase text-amber-500 mb-2 flex items-center gap-1">
                                                                        <Sparkles className="w-3 h-3" />
                                                                        Success Roadmap: {skill}
                                                                    </h5>
                                                                    <ul className="space-y-2">
                                                                        {enhancements[skill].map((bullet, i) => (
                                                                            <li key={i} className="text-xs group flex items-start gap-2">
                                                                                <button 
                                                                                    onClick={() => copyToClipboard(bullet)}
                                                                                    className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                >
                                                                                    <Copy className="w-3 h-3 text-primary" />
                                                                                </button>
                                                                                <span className="leading-relaxed">{bullet}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="glass p-6 rounded-2xl border border-white/10">
                                                <h4 className="flex items-center gap-2 font-bold mb-4">
                                                    <ListChecks className="w-4 h-4 text-primary" /> Roadmap to 100%
                                                </h4>
                                                <ul className="space-y-3">
                                                    {gapData?.improvement_tips.map((tip, i) => (
                                                        <li key={i} className="text-sm text-muted-foreground flex gap-3">
                                                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
                                                            {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "cover-letter" && (
                                <motion.div 
                                    key="cover-letter"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    {!coverLetterData && !loading ? (
                                        <div className="glass p-12 rounded-3xl border border-dashed border-white/20 text-center text-muted-foreground">
                                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>Generate a professional, tailored cover letter for this role.</p>
                                        </div>
                                    ) : (
                                        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
                                            <div className="p-4 bg-muted/30 border-b border-white/10 flex justify-between items-center">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                    <FileText className="w-3 h-3" />
                                                    Draft Generated
                                                </span>
                                                <button 
                                                    onClick={() => copyToClipboard(fullCoverLetter)}
                                                    className="p-2 hover:bg-background rounded-lg transition-colors"
                                                >
                                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <div className="p-8 font-serif leading-relaxed text-foreground/90 whitespace-pre-line text-lg">
                                                {fullCoverLetter}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}



export default function AICoachPage() {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-20 flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
            <AICoachContent />
        </Suspense>
    );
}
