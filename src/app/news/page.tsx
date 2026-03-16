"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
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
import { ArrowLeft, ExternalLink, Search, X, ChevronDown } from "lucide-react";

function decodeHtmlEntities(text: string): string {
    if (typeof document === 'undefined') return text;
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

function stripHtmlTags(html: string): string {
    if (typeof document === 'undefined') return html;
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
    tags?: string[];
}

const ITEMS_PER_PAGE = 12;

const LOCATION_LABELS: Record<string, string> = {
    national: '전국',
    regional: '지역',
    power_plant: '발전소',
};

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [tagFilter, setTagFilter] = useState<string>("all");
    const [periodFilter, setPeriodFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const fetchNews = useCallback(async (reset: boolean = false, targetPage?: number) => {
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

            if (filterType !== 'all') query = query.eq('location_type', filterType);
            if (tagFilter !== 'all') query = query.contains('tags', [tagFilter]);

            if (periodFilter !== 'all') {
                const startDate = new Date();
                switch (periodFilter) {
                    case '1week': startDate.setDate(startDate.getDate() - 7); break;
                    case '1month': startDate.setMonth(startDate.getMonth() - 1); break;
                    case '3months': startDate.setMonth(startDate.getMonth() - 3); break;
                }
                query = query.gte('published_at', startDate.toISOString());
            }

            if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);

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

            if (count != null) {
                setTotalCount(count);
                setHasMore(to < count - 1);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    }, [filterType, tagFilter, periodFilter, searchTerm, page]);

    useEffect(() => {
        fetchNews(true);
    }, [filterType, tagFilter, periodFilter, searchTerm]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNews(false, nextPage);
    };

    const hasActiveFilters = filterType !== 'all' || tagFilter !== 'all' || periodFilter !== 'all' || searchTerm !== '';

    const clearFilters = () => {
        setFilterType("all");
        setTagFilter("all");
        setPeriodFilter("all");
        setSearchTerm("");
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-3xl mx-auto px-5 pt-28 pb-20">

                {/* Back */}
                <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10">
                    <ArrowLeft className="w-4 h-4" />
                    지도로 돌아가기
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">
                        뉴스
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        LNG 인프라 관련 뉴스를 실시간으로 수집합니다
                        {totalCount > 0 && <span className="ml-1 text-slate-500">({totalCount}건)</span>}
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="뉴스 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-900/50 border-slate-800 text-foreground placeholder:text-slate-500 h-11 rounded-xl"
                        onKeyDown={(e) => e.key === 'Enter' && fetchNews(true)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-auto min-w-[100px] bg-slate-900/50 border-slate-800 text-slate-200 h-9 rounded-lg text-sm">
                            <SelectValue placeholder="지역" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                            <SelectItem value="all">전체 지역</SelectItem>
                            <SelectItem value="national">전국</SelectItem>
                            <SelectItem value="regional">지역</SelectItem>
                            <SelectItem value="power_plant">발전소</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={tagFilter} onValueChange={setTagFilter}>
                        <SelectTrigger className="w-auto min-w-[100px] bg-slate-900/50 border-slate-800 text-slate-200 h-9 rounded-lg text-sm">
                            <SelectValue placeholder="주제" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                            <SelectItem value="all">전체 주제</SelectItem>
                            <SelectItem value="LNG 발전소">LNG 발전소</SelectItem>
                            <SelectItem value="탄소중립">탄소중립</SelectItem>
                            <SelectItem value="석탄화력">석탄화력</SelectItem>
                            <SelectItem value="시민단체">시민단체</SelectItem>
                            <SelectItem value="에너지정책">에너지정책</SelectItem>
                            <SelectItem value="원전">원전</SelectItem>
                            <SelectItem value="재생에너지">재생에너지</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={periodFilter} onValueChange={setPeriodFilter}>
                        <SelectTrigger className="w-auto min-w-[100px] bg-slate-900/50 border-slate-800 text-slate-200 h-9 rounded-lg text-sm">
                            <SelectValue placeholder="기간" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                            <SelectItem value="all">전체 기간</SelectItem>
                            <SelectItem value="1week">최근 1주일</SelectItem>
                            <SelectItem value="1month">최근 1개월</SelectItem>
                            <SelectItem value="3months">최근 3개월</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="h-9 px-3 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            초기화
                        </button>
                    )}
                </div>

                {/* News List */}
                {loading && news.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-700 border-t-slate-300"></div>
                        <span className="ml-3 text-sm text-muted-foreground">불러오는 중...</span>
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">검색 결과가 없습니다</p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-slate-800/50">
                            {news.map((item) => (
                                <article
                                    key={item.id}
                                    className="py-5 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Meta */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                                                    item.location_type === 'national' ? 'bg-blue-500/15 text-blue-400' :
                                                    item.location_type === 'regional' ? 'bg-emerald-500/15 text-emerald-400' :
                                                    'bg-purple-500/15 text-purple-400'
                                                }`}>
                                                    {LOCATION_LABELS[item.location_type] || item.location_type}
                                                </span>
                                                {item.tags && item.tags.slice(0, 2).map((tag, idx) => (
                                                    <span key={idx} className="text-[11px] text-slate-500">
                                                        {tag}
                                                    </span>
                                                ))}
                                                <span className="text-[11px] text-slate-600 ml-auto shrink-0">
                                                    {formatRelativeDate(item.published_at)}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <h3 className="text-[15px] font-semibold text-slate-200 leading-snug group-hover:text-white transition-colors line-clamp-2">
                                                    {decodeHtmlEntities(item.title)}
                                                </h3>
                                            </a>

                                            {/* Content preview */}
                                            {item.content && (
                                                <p className="text-sm text-slate-500 mt-1.5 line-clamp-1">
                                                    {stripHtmlTags(decodeHtmlEntities(item.content)).substring(0, 120)}
                                                </p>
                                            )}

                                            {/* Location */}
                                            {item.si_do && (
                                                <div className="text-[11px] text-slate-600 mt-2">
                                                    {item.si_do}{item.si_gun_gu ? ` ${item.si_gun_gu}` : ''}
                                                </div>
                                            )}
                                        </div>

                                        {/* Link icon */}
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="shrink-0 mt-1 p-2 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="flex justify-center pt-8">
                                <Button
                                    variant="ghost"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full px-6"
                                >
                                    {loading ? '불러오는 중...' : (
                                        <>
                                            더 보기
                                            <ChevronDown className="w-4 h-4 ml-1" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
