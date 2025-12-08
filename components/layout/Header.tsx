"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap, Newspaper, Info, Lock, Megaphone, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";




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
            <header
                className={`fixed top-0 left-0 right-0 transition-all duration-300 ${mobileMenuOpen ? "z-[70]" : "z-50"} ${isScrolled ? "py-3" : "py-5"} ${mobileMenuOpen
                    ? "bg-transparent"
                    : isScrolled
                        ? "bg-white backdrop-blur-xl border-b border-slate-200/50 shadow-sm"
                        : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-900/20 transition-transform group-hover:scale-105 group-hover:rotate-3">
                                <Zap className="h-6 w-6" />
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900">GasOut.kr</h1>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Now or Never</p>
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
                                                ? "text-slate-900 bg-slate-100/50"
                                                : "text-slate-400 hover:text-slate-900 hover:bg-slate-100/50"
                                                }`}
                                        >
                                            {item.name}
                                        </Button>
                                    </Link>
                                );
                            })}
                            <div className="w-px h-6 bg-slate-200 mx-2" />
                            <Link href="/admin">
                                <Button variant="outline" size="sm" className="gap-2 border-slate-200 hover:border-slate-300 hover:bg-white/80">
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
                                className={`relative z-[70] transition-all duration-300 ${mobileMenuOpen ? "rotate-90 text-slate-900" : ""}`}
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-white h-dvh md:hidden flex flex-col pt-24 px-6 animate-in fade-in slide-in-from-top-5 duration-200">
                    <nav className="flex flex-col gap-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === item.href
                                    ? "bg-slate-100 text-slate-900 font-bold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${pathname === item.href ? "bg-white shadow-sm" : "bg-slate-100"}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className="text-lg">{item.name}</span>
                            </Link>
                        ))}
                        <hr className="border-slate-100 my-2" />
                        <Link
                            href="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-4 p-4 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                            <div className="p-2 rounded-lg bg-slate-100">
                                <Lock className="w-5 h-5" />
                            </div>
                            <span className="text-lg">관리자 로그인</span>
                        </Link>
                    </nav>
                </div>
            )}
        </>
    );
}
