"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// HTML 엔티티 디코딩 함수
function decodeHtmlEntities(text: string): string {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// HTML 태그 제거 함수
function stripHtmlTags(html: string): string {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

interface NewsArticle {
    id: number;
    title: string;
    url: string;
    published_at: string;
    source: string;
    location_type: 'national' | 'regional' | 'power_plant';
    si_do?: string;
    si_gun_gu?: string;
    content?: string;
}

const ITEMS_PER_PAGE = 12;

export default function NewsPage() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchNews(true);
    }, [filterType, searchTerm]);

    const fetchNews = async (reset: boolean = false, targetPage?: number) => {
        try {
            if (reset) {
                setLoading(true);
                setPage(1);
            }

            let query = supabase
                .from('articles')
                .select('*', { count: 'exact' })
                .eq('status', 'approved')
                .order('published_at', { ascending: false });

            if (filterType !== 'all') {
                query = query.eq('location_type', filterType);
            }

            if (searchTerm) {
                query = query.ilike('title', `%${searchTerm}%`);
            }

            const currentPage = reset ? 1 : (targetPage ?? page);
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error, count } = await query.range(from, to);

            if (error) throw error;

            if (reset) {
                setNews(data || []);
            } else {
                setNews(prev => [...prev, ...(data || [])]);
            }

            if (count) {
                setHasMore(to < count - 1);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNews(false, nextPage);
    };

    return (
        <div className="min-h-screen bg-gray-50/50">


            {/* 메인 컨텐츠 */}
            <main className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-10 space-y-8">
                <div className="space-y-8">
                    {/* 검색 및 필터 */}
                    {/* 검색 및 필터 */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-6 rounded-2xl shadow-lg shadow-slate-900/5 animate-fade-in-up">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[140px] border-slate-200 focus:ring-slate-900">
                                    <SelectValue placeholder="전체 보기" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">전체 뉴스</SelectItem>
                                    <SelectItem value="national">전국 뉴스</SelectItem>
                                    <SelectItem value="regional">지역 뉴스</SelectItem>
                                    <SelectItem value="power_plant">발전소 뉴스</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
                            <Input
                                placeholder="검색어를 입력하세요..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-slate-200 focus:ring-slate-900"
                                onKeyDown={(e) => e.key === 'Enter' && fetchNews(true)}
                            />
                            <Button onClick={() => fetchNews(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
                                검색
                            </Button>
                        </div>
                    </div>

                    {/* 뉴스 그리드 */}
                    {loading && news.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-slate-900"></div>
                            <p className="mt-4 text-slate-500 font-medium">뉴스를 불러오는 중입니다...</p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <p className="text-slate-500 text-lg">검색 결과가 없습니다.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {news.map((item, index) => (
                                    <Card key={item.id} className="group border-0 shadow-lg shadow-slate-900/5 glass-card ring-1 ring-white/20 rounded-2xl overflow-hidden hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                        <CardContent className="p-6 flex flex-col h-full">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide ${item.location_type === 'national' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                    item.location_type === 'regional' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                        'bg-purple-50 text-purple-700 border border-purple-100'
                                                    }`}>
                                                    {item.location_type === 'national' ? '전국' :
                                                        item.location_type === 'regional' ? '지역' : '발전소'}
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {new Date(item.published_at).toLocaleDateString('ko-KR')}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-lg text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
                                                {decodeHtmlEntities(item.title)}
                                            </h3>

                                            <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1 leading-relaxed">
                                                {stripHtmlTags(decodeHtmlEntities(item.content || '')).substring(0, 150)}...
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                                {item.si_do && item.si_gun_gu ? (
                                                    <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                                        <span className="text-lg">📍</span> {item.si_do} {item.si_gun_gu}
                                                    </div>
                                                ) : (
                                                    <div></div>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 -mr-2"
                                                    onClick={() => window.open(item.url, '_blank')}
                                                >
                                                    원문 보기
                                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {hasMore && (
                                <div className="flex justify-center pt-8">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-8 rounded-full shadow-sm"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-slate-900 mr-2"></div>
                                                불러오는 중...
                                            </>
                                        ) : (
                                            '더 보기'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
