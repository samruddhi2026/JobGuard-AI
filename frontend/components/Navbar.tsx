"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, Search, FileCheck, Home } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
    const pathname = usePathname();
    const isDashboard = pathname === "/dashboard";

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-border/40 px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Shield className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xl font-bold gradient-text">JobGuard AI</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <NavLink href="/verifier" icon={<Shield className="w-4 h-4" />} label="Verifier" />
                <NavLink href="/ats-checker" icon={<FileCheck className="w-4 h-4" />} label="ATS Checker" />
                <NavLink href="/career-finder" icon={<Search className="w-4 h-4" />} label="Career Finder" />
                <NavLink href="/match" icon={<LayoutDashboard className="w-4 h-4" />} label="Expert Match" />
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link
                    href={isDashboard ? "/" : "/dashboard"}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${isDashboard
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30"
                        }`}
                >
                    {isDashboard ? (
                        <><Home className="w-4 h-4" /> Home</>
                    ) : (
                        <><LayoutDashboard className="w-4 h-4" /> Dashboard</>
                    )}
                </Link>
            </div>
        </nav>
    );
};

const NavLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
    <Link
        href={href}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
        {icon}
        {label}
    </Link>
);

export default Navbar;
