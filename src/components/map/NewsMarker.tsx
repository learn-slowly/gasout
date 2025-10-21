"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NewsMarkerProps {
  map: L.Map;
  onNewsClick?: (news: any) => void;
  showNewsMarkers?: boolean;
  newsFilter?: {
    locationType?: 'national' | 'regional' | 'power_plant';
    powerPlantId?: string;
  };
}

export default function NewsMarker({ 
  map, 
  onNewsClick, 
  showNewsMarkers = true,
  newsFilter 
}: NewsMarkerProps) {
  const markersRef = useRef<L.Marker[]>([]);
  const newsDataRef = useRef<any[]>([]);

  useEffect(() => {
    if (!map || !showNewsMarkers) return;

    loadAndDisplayNewsMarkers();

    return () => {
      // 마커 정리
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, [map, showNewsMarkers, newsFilter]);

  const loadAndDisplayNewsMarkers = async () => {
    try {
      // 기존 마커 제거
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];

      // 뉴스 데이터 로드
      const newsData = await loadNewsData();
      newsDataRef.current = newsData;

      // 뉴스 마커 생성
      newsData.forEach(news => {
        if (news.latitude && news.longitude) {
          const marker = createNewsMarker(news);
          marker.addTo(map);
          markersRef.current.push(marker);
        }
      });

    } catch (error) {
      console.error('Error loading news markers:', error);
    }
  };

  const loadNewsData = async () => {
    try {
      let query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'approved')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('published_at', { ascending: false })
        .limit(50); // 성능을 위해 최대 50개로 제한

      // 필터 적용
      if (newsFilter?.locationType) {
        query = query.eq('location_type', newsFilter.locationType);
      }

      if (newsFilter?.powerPlantId) {
        query = query.eq('power_plant_id', newsFilter.powerPlantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading news data:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error loading news data:', error);
      return [];
    }
  };

  const createNewsMarker = (news: any) => {
    // 뉴스 타입별 아이콘 색상
    const getNewsIconColor = (locationType: string) => {
      switch (locationType) {
        case 'national':
          return '#3B82F6'; // 파란색 - 전국 뉴스
        case 'regional':
          return '#10B981'; // 초록색 - 지역 뉴스
        case 'power_plant':
          return '#F59E0B'; // 주황색 - 발전소 뉴스
        default:
          return '#6B7280'; // 회색
      }
    };

    const color = getNewsIconColor(news.location_type);
    
    const icon = L.divIcon({
      className: 'news-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 8px;
          font-weight: bold;
        ">N</div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const marker = L.marker([news.latitude, news.longitude], { icon });

    // 팝업 내용 생성
    const popupContent = `
      <div class="news-popup" style="min-width: 200px; max-width: 300px;">
        <div class="news-header" style="margin-bottom: 8px;">
          <div class="news-type" style="
            display: inline-block;
            padding: 2px 6px;
            background-color: ${color};
            color: white;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 4px;
          ">
            ${getLocationTypeLabel(news.location_type)}
          </div>
          <h4 class="news-title" style="
            font-size: 14px;
            font-weight: bold;
            margin: 0;
            line-height: 1.3;
            color: #1F2937;
          ">${news.title}</h4>
        </div>
        
        <div class="news-content" style="
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 8px;
          line-height: 1.4;
        ">
          ${truncateText(news.content || '', 100)}
        </div>
        
        <div class="news-meta" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #9CA3AF;
          margin-bottom: 8px;
        ">
          <span>${formatDate(news.published_at)}</span>
          ${news.si_do && news.si_gun_gu ? 
            `<span>${news.si_do} ${news.si_gun_gu}</span>` : ''
          }
        </div>
        
        <div class="news-actions" style="text-align: center;">
          <button 
            onclick="window.open('${news.url}', '_blank')"
            style="
              background-color: ${color};
              color: white;
              border: none;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 11px;
              cursor: pointer;
              margin-right: 4px;
            "
          >
            원문 보기
          </button>
          <button 
            onclick="window.dispatchEvent(new CustomEvent('newsClick', { detail: { newsId: '${news.id}' } }))"
            style="
              background-color: #6B7280;
              color: white;
              border: none;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 11px;
              cursor: pointer;
            "
          >
            상세 보기
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);

    // 클릭 이벤트
    marker.on('click', () => {
      if (onNewsClick) {
        onNewsClick(news);
      }
    });

    return marker;
  };

  const getLocationTypeLabel = (locationType: string) => {
    switch (locationType) {
      case 'national':
        return '전국';
      case 'regional':
        return '지역';
      case 'power_plant':
        return '발전소';
      default:
        return '뉴스';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return null; // 이 컴포넌트는 마커만 렌더링하므로 JSX 반환하지 않음
}
