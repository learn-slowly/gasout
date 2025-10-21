"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Globe, 
  MapPin, 
  Building, 
  Filter,
  Eye,
  EyeOff,
  Newspaper
} from "lucide-react";

interface NewsMapControlsProps {
  showNewsMarkers: boolean;
  onToggleNewsMarkers: () => void;
  newsFilter: {
    locationType?: 'national' | 'regional' | 'power_plant';
    powerPlantId?: string;
  };
  onFilterChange: (filter: {
    locationType?: 'national' | 'regional' | 'power_plant';
    powerPlantId?: string;
  }) => void;
  nationalNewsCount: number;
  onToggleNationalNews: () => void;
  showNationalNews: boolean;
  className?: string;
}

export default function NewsMapControls({
  showNewsMarkers,
  onToggleNewsMarkers,
  newsFilter,
  onFilterChange,
  nationalNewsCount,
  onToggleNationalNews,
  showNationalNews,
  className = ""
}: NewsMapControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'national':
        return '전국';
      case 'regional':
        return '지역';
      case 'power_plant':
        return '발전소';
      default:
        return '전체';
    }
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'national':
        return <Globe className="w-4 h-4" />;
      case 'regional':
        return <MapPin className="w-4 h-4" />;
      case 'power_plant':
        return <Building className="w-4 h-4" />;
      default:
        return <Filter className="w-4 h-4" />;
    }
  };

  return (
    <div className={`absolute top-4 right-4 z-10 ${className}`}>
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border p-3">
        {/* 메인 컨트롤 */}
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant={showNewsMarkers ? "default" : "outline"}
            size="sm"
            onClick={onToggleNewsMarkers}
            className="flex items-center gap-2"
          >
            {showNewsMarkers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            뉴스 마커
          </Button>
          
          <Button
            variant={showNationalNews ? "default" : "outline"}
            size="sm"
            onClick={onToggleNationalNews}
            className="flex items-center gap-2"
          >
            <Newspaper className="w-4 h-4" />
            전국 뉴스
            {nationalNewsCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {nationalNewsCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* 확장된 필터 옵션 */}
        {isExpanded && (
          <div className="space-y-3 border-t pt-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                뉴스 타입 필터
              </label>
              <Select
                value={newsFilter.locationType || 'all'}
                onValueChange={(value) => {
                  onFilterChange({
                    ...newsFilter,
                    locationType: value === 'all' ? undefined : value as any
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="뉴스 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      전체
                    </div>
                  </SelectItem>
                  <SelectItem value="national">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      전국 뉴스
                    </div>
                  </SelectItem>
                  <SelectItem value="regional">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      지역 뉴스
                    </div>
                  </SelectItem>
                  <SelectItem value="power_plant">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      발전소 뉴스
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 현재 필터 표시 */}
            {newsFilter.locationType && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">현재 필터:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getLocationTypeIcon(newsFilter.locationType)}
                  {getLocationTypeLabel(newsFilter.locationType)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFilterChange({ ...newsFilter, locationType: undefined })}
                  className="p-1 h-auto text-xs"
                >
                  ✕
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
