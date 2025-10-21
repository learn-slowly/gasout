"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import NewsCard from "./NewsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Globe,
  MapPin,
  Building
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NewsListProps {
  locationType?: 'national' | 'regional' | 'power_plant';
  powerPlantId?: string;
  limit?: number;
  showStats?: boolean;
  compact?: boolean;
}

export default function NewsList({ 
  locationType, 
  powerPlantId, 
  limit = 10,
  showStats = true,
  compact = false 
}: NewsListProps) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    loadArticles();
  }, [locationType, powerPlantId, limit]);

  const loadArticles = async () => {
    try {
      let query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'approved') // 승인된 기사만 표시
        .order('published_at', { ascending: false });

      // 위치 타입 필터
      if (locationType) {
        query = query.eq('location_type', locationType);
      }

      // 발전소 ID 필터
      if (powerPlantId) {
        query = query.eq('power_plant_id', powerPlantId);
      }

      // 개수 제한
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await data;

      if (error) throw error;

      setArticles(data || []);

      // 통계 계산
      if (showStats) {
        const { data: statsData } = await supabase
          .from('articles')
          .select('status')
          .eq('status', 'approved');

        setStats({
          total: statsData?.length || 0,
          approved: statsData?.length || 0,
          pending: 0,
          rejected: 0
        });
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationTitle = () => {
    switch (locationType) {
      case 'national':
        return '전국 뉴스';
      case 'regional':
        return '지역 뉴스';
      case 'power_plant':
        return '발전소 뉴스';
      default:
        return '뉴스';
    }
  };

  const getLocationIcon = () => {
    switch (locationType) {
      case 'national':
        return <Globe className="w-4 h-4" />;
      case 'regional':
        return <MapPin className="w-4 h-4" />;
      case 'power_plant':
        return <Building className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">뉴스를 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 및 통계 */}
      {showStats && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getLocationIcon()}
            <h2 className="text-lg font-semibold text-gray-900">
              {getLocationTitle()}
            </h2>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {articles.length}개
            </Badge>
          </div>
        </div>
      )}

      {/* 뉴스 목록 */}
      {articles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>표시할 뉴스가 없습니다.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              showActions={false}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  );
}
