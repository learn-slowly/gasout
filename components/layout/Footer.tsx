"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Mail, Github } from "lucide-react";

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on map page (Home) for app-like experience
    if (pathname === "/") return null;

    return (
        <footer className="bg-white border-t border-slate-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                                <Zap className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold text-slate-900">GasOut.kr</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                            전국 화력 발전소 현황과 기후 위기 관련 뉴스를 제공하는<br />
                            시민 참여형 데이터 플랫폼입니다.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 mb-4">사이트맵</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link href="/about" className="hover:text-slate-900 hover:underline">소개</Link></li>
                            <li><Link href="/test" className="hover:text-slate-900 hover:underline">기후시민선언</Link></li>
                            <li><Link href="/news" className="hover:text-slate-900 hover:underline">뉴스아카이브</Link></li>
                            <li><Link href="/learn-more" className="hover:text-slate-900 hover:underline">더 알아보기</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 mb-4">문의/제보</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <a href="mailto:contact@gasout.kr" className="hover:text-slate-900 hover:underline">contact@gasout.kr</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Github className="w-4 h-4" />
                                <a href="https://github.com/gasout-kr" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 hover:underline">GitHub</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <p>© 2024 GasOut.kr. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
                        <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
