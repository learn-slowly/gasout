"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Building,
  Globe
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

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    url: string;
    content: string;
    published_at: string;
    status: 'pending' | 'approved' | 'rejected';
    location_type: 'national' | 'regional' | 'power_plant';
    power_plant_id?: string;
    latitude?: number;
    longitude?: number;
  };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function NewsCard({ 
  article, 
  onApprove, 
  onReject, 
  showActions = true,
  compact = false 
}: NewsCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">대기중</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">승인됨</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">거부됨</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getLocationBadge = (locationType: string) => {
    switch (locationType) {
      case 'national':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Globe className="w-3 h-3 mr-1" />
            전국
          </Badge>
        );
      case 'regional':
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <MapPin className="w-3 h-3 mr-1" />
            지역
          </Badge>
        );
      case 'power_plant':
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Building className="w-3 h-3 mr-1" />
            발전소
          </Badge>
        );
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
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

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge(article.status)}
                {getLocationBadge(article.location_type)}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {article.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(article.published_at)}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(article.url, '_blank')}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
              {showActions && article.status === 'pending' && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 h-6 px-2"
                    onClick={() => onApprove?.(article.id)}
                  >
                    ✓
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 px-2"
                    onClick={() => onReject?.(article.id)}
                  >
                    ✗
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(article.status)}
              {getLocationBadge(article.location_type)}
              {article.power_plant_id && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                  <Building className="w-3 h-3 mr-1" />
                  발전소 연결됨
                </Badge>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {decodeHtmlEntities(article.title)}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {truncateText(stripHtmlTags(decodeHtmlEntities(article.content)), 200)}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(article.published_at)}
              </div>
              {article.latitude && article.longitude && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  위치 정보 있음
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(article.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              원문 보기
            </Button>
            
            {showActions && article.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onApprove?.(article.id)}
                >
                  ✓ 승인
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject?.(article.id)}
                >
                  ✗ 거부
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
