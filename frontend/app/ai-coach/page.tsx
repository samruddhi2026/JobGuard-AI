"use client";

import { useState, useEffect, Suspense } from "react";
import { Brain, Sparkles, Send, Copy, Check, MessageSquare, FileText, Loader2, ArrowRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

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

function AICoachContent() {
    const searchParams = useSearchParams();
    const [jd, setJd] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"interview" | "cover-letter">("interview");
    const [interviewData, setInterviewData] = useState<InterviewPrep | null>(null);
    const [coverLetterData, setCoverLetterData] = useState<CoverLetter | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const jdParam = searchParams.get("jd");
        if (jdParam) {
            setJd(jdParam);
        }
    }, [searchParams]);

    const generateAI = async () => {
        if (!jd.trim()) {
            toast.error("Please provide a job description first.");
            return;
        }

        setLoading(true);
        try {
            const endpoint = activeTab === "interview" ? "/api/v1/ai/interview-prep" : "/api/v1/ai/cover-letter";
            const body = activeTab === "interview" ? { job_description: jd } : { job_description: jd, resume_text: "" };
            
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            
            if (!res.ok) throw new Error("AI Generation failed");
            
            const result = await res.json();
            if (activeTab === "interview") setInterviewData(result);
            else setCoverLetterData(result);
            
            toast.success("AI Generation successful!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to connect to AI service.");
        } finally {
            setLoading(false);
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

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
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
                    Transform any job description into a high-impact preparation guide. 
                    Practice with tailored questions or generate a professional cover letter in seconds.
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
                            className="w-full h-80 bg-background/50 border border-border/40 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
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
                                    Generate Coaching Guide
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
                            Include the 'Requirements' and 'Responsibilities' sections of the JD for the most accurate AI matching and question generation.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    <div className="flex p-1 bg-muted/30 rounded-2xl border border-border/40 w-fit">
                        <button 
                            onClick={() => setActiveTab("interview")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'interview' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <MessageSquare className="w-4 h-4" /> Interview Prep
                        </button>
                        <button 
                            onClick={() => setActiveTab("cover-letter")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'cover-letter' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <FileText className="w-4 h-4" /> Cover Letter
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "interview" ? (
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
                        ) : (
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
    );
}

export default function AICoachPage() {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-20 flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
            <AICoachContent />
        </Suspense>
    );
}
