"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, Search, FileCheck, Home, Menu, X, TrendingUp, Brain } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
    const pathname = usePathname();
    const isDashboard = pathname === "/dashboard";
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-border/40 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-3">
                <Link href="/" className="flex items-center gap-2 group min-w-0" onClick={closeMenu}>
                    <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-lg sm:text-xl font-bold gradient-text truncate">JobGuard AI</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <NavLink href="/verifier" icon={<Shield className="w-4 h-4" />} label="Verifier" onClick={closeMenu} />
                    <NavLink href="/ats-checker" icon={<FileCheck className="w-4 h-4" />} label="ATS Checker" onClick={closeMenu} />
                    <NavLink href="/career-finder" icon={<Search className="w-4 h-4" />} label="Career Finder" onClick={closeMenu} />
                    <NavLink href="/match" icon={<LayoutDashboard className="w-4 h-4" />} label="Expert Match" onClick={closeMenu} />
                    <NavLink href="/insights" icon={<TrendingUp className="w-4 h-4" />} label="Insights" onClick={closeMenu} />
                    <NavLink href="/ai-coach" icon={<Brain className="w-4 h-4" />} label="AI Coach" onClick={closeMenu} />
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <ThemeToggle />
                    <Link
                        href={isDashboard ? "/" : "/dashboard"}
                        className={`hidden sm:flex px-5 py-2 rounded-full font-bold text-sm transition-all items-center gap-2 ${isDashboard
                            ? "bg-muted text-foreground hover:bg-muted/80"
                            : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30"
                            }`}
                        onClick={closeMenu}
                    >
                        {isDashboard ? (
                            <><Home className="w-4 h-4" /> Home</>
                        ) : (
                            <><LayoutDashboard className="w-4 h-4" /> Dashboard</>
                        )}
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((open) => !open)}
                        className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2"
                        aria-label="Toggle navigation menu"
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden mt-4 rounded-2xl border border-white/10 bg-background/95 p-4 space-y-3">
                    <NavLink href="/verifier" icon={<Shield className="w-4 h-4" />} label="Verifier" onClick={closeMenu} />
                    <NavLink href="/ats-checker" icon={<FileCheck className="w-4 h-4" />} label="ATS Checker" onClick={closeMenu} />
                    <NavLink href="/career-finder" icon={<Search className="w-4 h-4" />} label="Career Finder" onClick={closeMenu} />
                    <NavLink href="/match" icon={<LayoutDashboard className="w-4 h-4" />} label="Expert Match" onClick={closeMenu} />
                    <NavLink href="/insights" icon={<TrendingUp className="w-4 h-4" />} label="Insights" onClick={closeMenu} />
                    <NavLink href="/ai-coach" icon={<Brain className="w-4 h-4" />} label="AI Coach" onClick={closeMenu} />
                    <Link
                        href={isDashboard ? "/" : "/dashboard"}
                        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${isDashboard
                            ? "bg-muted text-foreground hover:bg-muted/80"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                            }`}
                        onClick={closeMenu}
                    >
                        {isDashboard ? (
                            <><Home className="w-4 h-4" /> Home</>
                        ) : (
                            <><LayoutDashboard className="w-4 h-4" /> Dashboard</>
                        )}
                    </Link>
                </div>
            )}
        </nav>
    );
};

const NavLink = ({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick?: () => void }) => (
    <Link
        href={href}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={onClick}
    >
        {icon}
        {label}
    </Link>
);

export default Navbar;
