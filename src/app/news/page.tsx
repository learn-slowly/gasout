"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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

            if (error) {
                // Fallback if column doesn't exist yet, just ignore error and try fetching without filter? 
                // Or just throw. Let's log it.
                console.error("Supabase query error (possibly missing columns):", error);
                throw error;
            }

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* 헤더 */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">뉴스 아카이브</h1>
                            <p className="text-sm text-gray-600 mt-1">LNG 발전소와 탄소중립 관련 최신 뉴스</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 메인 컨텐츠 */}
            <main className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-10 space-y-8">
                <div className="space-y-8">
                    {/* 검색 및 필터 */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl shadow-md border border-gray-200 animate-fade-in-up">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[140px] bg-white border-gray-300 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <SelectValue placeholder="전체 보기" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-200">
                                    <SelectItem value="all" className="text-gray-900 font-medium">전체 뉴스</SelectItem>
                                    <SelectItem value="national" className="text-gray-900 font-medium">전국 뉴스</SelectItem>
                                    <SelectItem value="regional" className="text-gray-900 font-medium">지역 뉴스</SelectItem>
                                    <SelectItem value="power_plant" className="text-gray-900 font-medium">발전소 뉴스</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
                            <Input
                                placeholder="검색어를 입력하세요..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onKeyDown={(e) => e.key === 'Enter' && fetchNews(true)}
                            />
                            <Button onClick={() => fetchNews(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md">
                                검색
                            </Button>
                        </div>
                    </div>

                    {/* 뉴스 그리드 */}
                    {loading && news.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-md">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
                            <p className="mt-4 text-gray-700 font-semibold text-lg">뉴스를 불러오는 중입니다...</p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200 border-dashed shadow-md">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-700 text-lg font-semibold">검색 결과가 없습니다.</p>
                            <p className="text-gray-500 text-sm mt-2">다른 검색어로 시도해보세요.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {news.map((item, index) => (
                                    <Card key={item.id} className="group bg-white border-2 border-gray-200 shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                        <CardContent className="p-6 flex flex-col h-full">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className={`text-xs px-3 py-1.5 rounded-full font-bold tracking-wide shadow-sm ${item.location_type === 'national' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                    item.location_type === 'regional' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                                        'bg-purple-100 text-purple-800 border border-purple-200'
                                                    }`}>
                                                    {item.location_type === 'national' ? '전국' :
                                                        item.location_type === 'regional' ? '지역' : '발전소'}
                                                </span>
                                                <span className="text-xs text-gray-600 font-semibold">
                                                    {new Date(item.published_at).toLocaleDateString('ko-KR')}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                                                {decodeHtmlEntities(item.title)}
                                            </h3>

                                            <p className="text-sm text-gray-700 line-clamp-3 mb-6 flex-1 leading-relaxed">
                                                {stripHtmlTags(decodeHtmlEntities(item.content || '')).substring(0, 150)}...
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 mt-auto">
                                                {item.si_do && item.si_gun_gu ? (
                                                    <div className="text-xs text-gray-700 flex items-center gap-1.5 font-semibold">
                                                        <span className="text-lg">📍</span> {item.si_do} {item.si_gun_gu}
                                                    </div>
                                                ) : (
                                                    <div></div>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-semibold -mr-2"
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
                                        className="bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 px-10 py-3 rounded-full shadow-md font-semibold transition-all"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                                                불러오는 중...
                                            </>
                                        ) : (
                                            <>
                                                더 보기
                                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </>
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
