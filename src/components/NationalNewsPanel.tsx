"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Calendar, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Newspaper
} from "lucide-react";

// HTML 엔티티 디코딩 함수
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// HTML 태그 제거 함수
function stripHtmlTags(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NationalNewsPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

export default function NationalNewsPanel({ 
  isVisible, 
  onToggle, 
  className = "" 
}: NationalNewsPanelProps) {
  const [nationalNews, setNationalNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadNationalNews();
    }
  }, [isVisible]);

  const loadNationalNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'approved')
        .eq('location_type', 'national')
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading national news:', error);
        return;
      }

      setNationalNews(data || []);
    } catch (error) {
      console.error('Error loading national news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-20 ${className}`}>
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm w-full">
        <CardHeader 
          className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              전국 뉴스
              <Badge variant="secondary" className="ml-2">
                {nationalNews.length}
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">뉴스를 불러오는 중...</span>
              </div>
            ) : nationalNews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">전국 뉴스가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nationalNews.map((news) => (
                  <div
                    key={news.id}
                    className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                          {decodeHtmlEntities(news.title)}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {truncateText(stripHtmlTags(decodeHtmlEntities(news.content || '')), 80)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(news.published_at)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            전국
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 p-1 h-auto"
                        onClick={() => window.open(news.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
      </Card>
    </div>
  );
}
