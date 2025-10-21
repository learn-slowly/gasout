"use client";

import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createClient } from '@/lib/supabase/client';

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
  content: string;
  location_type: 'power_plant' | 'regional' | 'national';
  latitude?: number;
  longitude?: number;
  category?: string;
}

// 기사 마커 아이콘 (뉴스 아이콘)
const articleIcon = L.divIcon({
  html: `
    <div style="
      background-color: #3B82F6;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      font-weight: bold;
    ">📰</div>
  `,
  className: 'custom-article-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export default function ArticleMarkers() {
  const [articles, setArticles] = useState<Article[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchArticles();

    // 실시간 구독 (새 기사가 승인되면 자동으로 표시)
    const subscription = supabase
      .channel('articles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'articles',
          filter: 'status=eq.approved'
        },
        () => {
          fetchArticles();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchArticles() {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'approved')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('published_date', { ascending: false })
      .limit(50);

    if (data) {
      setArticles(data);
    }
  }

  return (
    <>
      {articles.map(article => (
        <Marker
          key={article.id}
          position={[article.latitude!, article.longitude!]}
          icon={articleIcon}
        >
          <Popup maxWidth={300}>
            <div className="space-y-2">
              <div className="font-semibold text-base">{article.title}</div>
              <div className="text-sm text-gray-600">
                {article.source} • {new Date(article.published_at).toLocaleDateString('ko-KR')}
              </div>
              {article.category && (
                <div className="text-sm">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {article.category}
                  </span>
                </div>
              )}
              <div className="text-sm line-clamp-3">{article.content}</div>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-block mt-2"
              >
                전문 보기 →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

