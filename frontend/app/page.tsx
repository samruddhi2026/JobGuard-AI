"use client";

import Navbar from "@/components/Navbar";
import { Shield, FileCheck, Search, Zap, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      title: "Integrity Verifier",
      description: "Perform deep-packet analysis of job links to neutralize phishing and fraud attempts.",
      icon: <Shield className="w-8 h-8 text-primary" />,
      href: "/verifier",
      tag: "Security"
    },
    {
      title: "ATS Optimization",
      description: "Fine-tune your resume for global ATS benchmarks used by blue-chip employers.",
      icon: <FileCheck className="w-8 h-8 text-primary" />,
      href: "/ats-checker",
      tag: "Career"
    },
    {
      title: "Professional Search",
      description: "Access a live pipeline of verified vacancies from official corporate portals.",
      icon: <Search className="w-8 h-8 text-primary" />,
      href: "/career-finder",
      tag: "Aggregator"
    },
    {
      title: "Expert Semantic Match",
      description: "Leverage AI for precision matching and identifying critical skill alignment.",
      icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
      href: "/match",
      tag: "Matching"
    }
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
            <Zap className="w-3 h-3" />
            <span>Powering safer job searches for 50k+ seekers</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Secure Your Career with <br />
            <span className="gradient-text">JobGuard AI</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The all-in-one AI platform to detect fake job postings, optimize your resume for ATS,
            and find verified opportunities from official career sites.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/verifier"
              className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:scale-105 transition-transform"
            >
              Analyze Integrity
            </Link>
            <Link
              href="/ats-checker"
              className="px-8 py-4 rounded-2xl glass border-primary/20 font-bold text-lg hover:bg-primary/5 transition-colors"
            >
              Optimize ATS Performance
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-3xl glass hover:border-primary/50 transition-all flex flex-col h-full"
            >
              <div className="p-3 rounded-2xl bg-white/5 w-fit mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <span className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">{feature.tag}</span>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground mb-8 flex-grow">{feature.description}</p>
              <Link
                href={feature.href}
                className="flex items-center gap-2 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-20 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-1">99.9%</div>
              <div className="text-muted-foreground text-sm">Detection Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">10M+</div>
              <div className="text-muted-foreground text-sm">Links Verified</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">500+</div>
              <div className="text-muted-foreground text-sm">Matched Portals</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">24/7</div>
              <div className="text-muted-foreground text-sm">AI Protection</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
