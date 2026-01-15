"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap, Newspaper, Info, Lock, Megaphone, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: "소개", href: "/about", icon: Info },
        { name: "기후시민선언", href: "/test", icon: Megaphone },
        { name: "가스발전지도", href: "/", icon: Zap },
        { name: "뉴스아카이브", href: "/news", icon: Newspaper },
        { name: "더알아보기", href: "/learn-more", icon: BookOpen },
    ];

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 right-0 transition-all duration-300 ${mobileMenuOpen ? "z-[70]" : "z-50"} ${isScrolled ? "py-3" : "py-5"} ${mobileMenuOpen
                    ? "bg-transparent"
                    : isScrolled
                        ? "bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
                        : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-900 text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 group-hover:rotate-3">
                                <Zap className="h-6 w-6" />
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-foreground text-glow">GasOut.kr</h1>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Now or Never</p>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`relative px-4 py-2 h-auto text-sm font-normal transition-all ${isActive
                                                ? "text-primary bg-primary/10 hover:bg-primary/20"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                                }`}
                                        >
                                            {item.name}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="navbar-active"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                />
                                            )}
                                        </Button>
                                    </Link>
                                );
                            })}
                            <div className="w-px h-6 bg-white/10 mx-2" />
                            <Link href="/admin">
                                <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary">
                                    <Lock className="w-3 h-3" />
                                    <span>관리자</span>
                                </Button>
                            </Link>
                        </nav>

                        {/* Mobile Menu Toggle */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={`relative z-[70] transition-all duration-300 hover:bg-white/5 ${mobileMenuOpen ? "rotate-90 text-primary" : "text-foreground"}`}
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-3xl h-dvh md:hidden flex flex-col pt-24 px-6"
                    >
                        <nav className="flex flex-col gap-4">
                            {navItems.map((item, index) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === item.href
                                            ? "bg-primary/10 text-primary font-bold border border-primary/20"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${pathname === item.href ? "bg-primary/20 text-primary" : "bg-white/5"}`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-lg">{item.name}</span>
                                    </Link>
                                </motion.div>
                            ))}
                            <hr className="border-white/10 my-2" />
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Link
                                    href="/admin"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                >
                                    <div className="p-2 rounded-lg bg-white/5">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <span className="text-lg">관리자 로그인</span>
                                </Link>
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

