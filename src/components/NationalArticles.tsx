"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
  content: string;
  category?: string;
  location_type: string;
}

export default function NationalArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchArticles();

    // 실시간 구독
    const subscription = supabase
      .channel('national_articles_changes')
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
      .in('location_type', ['national', 'regional'])
      .order('published_date', { ascending: false })
      .limit(10);

    if (data) {
      setArticles(data);
    }
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">최신 뉴스</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(article => (
            <Card key={article.id} className="p-4 hover:shadow-lg transition-shadow">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <div className="space-y-2">
                  {article.category && (
                    <Badge variant="secondary" className="text-xs">
                      {article.category}
                    </Badge>
                  )}
                  
                  <h3 className="font-semibold text-base line-clamp-2 hover:text-blue-600">
                    {article.title}
                  </h3>
                  
                  <div className="text-sm text-gray-600">
                    {article.source} • {new Date(article.published_at).toLocaleDateString('ko-KR')}
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {article.content}
                  </p>
                </div>
              </a>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

