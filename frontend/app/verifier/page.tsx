"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Shield, AlertCircle, CheckCircle2, Search, Link as LinkIcon, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { apiRequest, apiFormRequest } from "@/lib/api"; // Added apiFormRequest based on instruction context

export default function JobVerifier() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setResult(null);

        try {
            const data = await apiRequest("/verify/verify", {
                method: "POST",
                body: JSON.stringify({ url })
            });

            setResult(data);
            if (data.status === "Safe") {
                toast.success("Link analyzed: Domain appears safe.");
            } else {
                toast.warning(`Warning: ${data.status} detected.`);
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Please enter a valid URL (e.g., https://company.com/jobs)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />

            {!mounted ? (
                <div className="flex-grow flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
            ) : (
                <>
                    <section className="flex-grow pt-24 pb-20 px-6 max-w-4xl mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-12"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
                                <Shield className="w-8 h-8 text-primary" />
                                <span>Phishing & Fraud Detection Engine</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Job Link Verifier</h1>
                            <p className="text-muted-foreground text-lg">
                                Paste any job posting link to check its authenticity and safety score.
                            </p>
                        </motion.div>

                        <form onSubmit={handleVerify} className="mb-12">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                    <LinkIcon className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://careers.company.com/apply/123"
                                    required
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full pl-14 pr-40 py-6 rounded-3xl glass text-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/70"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="absolute right-3 top-3 bottom-3 px-8 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? "Analyzing..." : "Analyze Integrity"}
                                </button>
                            </div>
                        </form>

                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="rounded-3xl glass overflow-hidden border-border/60"
                                >
                                    <div className={`p-8 flex items-center justify-between border-b border-border/40 ${result.status === "Safe" ? "bg-green-500/10" : "bg-destructive/10"
                                        }`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${result.status === "Safe" ? "bg-green-500/20 text-green-400" : "bg-destructive/20 text-destructive"
                                                }`}>
                                                {result.status === "Safe" ? <CheckCircle2 /> : <AlertCircle />}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">{result.status}</h2>
                                                <p className="text-muted-foreground text-sm">{result.domain}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold">{result.trust_score}%</div>
                                            <div className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">Trust Score</div>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        <div>
                                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">AI Explanation</h3>
                                            <p className="text-lg leading-relaxed">{result.explanation}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Risk Analysis</h3>
                                                <div className="space-y-3">
                                                    {result.red_flags.map((flag: string, i: number) => (
                                                        <div key={i} className="flex gap-3 text-sm">
                                                            <AlertCircle className={`w-4 h-4 shrink-0 ${result.status === "Safe" ? "text-green-500" : "text-yellow-500"}`} />
                                                            <span>{flag}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Safety Recommendation</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.status === "Safe"
                                                        ? "This link is likely legitimate. You can proceed with your application."
                                                        : "Extreme caution advised. Do not share personal information or scan QR codes from this site."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    {/* Quick Access */}
                    <section className="px-6 pb-20 max-w-4xl mx-auto w-full">
                        <div className="rounded-3xl bg-primary/5 p-8 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h4 className="text-xl font-bold mb-1">Company official career page?</h4>
                                <p className="text-muted-foreground">Use our finder to search verified company job boards directly.</p>
                            </div>
                            <Link href="/career-finder" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors font-bold flex items-center gap-2 shrink-0">
                                Go to Career Finder <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}
