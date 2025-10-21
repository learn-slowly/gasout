"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  location_type?: 'power_plant' | 'regional' | 'national' | null;
  power_plant_id?: string;
  region_name?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  tags?: string[];
}

interface PowerPlant {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export default function ArticlesManagementPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [powerPlants, setPowerPlants] = useState<PowerPlant[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchArticles();
    fetchPowerPlants();
  }, [statusFilter]);

  async function fetchArticles() {
    setLoading(true);
    let query = supabase.from('articles').select('*').order('published_at', { ascending: false });
    
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching articles:', error);
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  }

  async function fetchPowerPlants() {
    const { data } = await supabase
      .from('power_plants')
      .select('id, name, latitude, longitude')
      .order('name');
    
    if (data) {
      setPowerPlants(data);
    }
  }

  async function updateArticle(articleId: string, updates: Partial<Article>) {
    const { error } = await supabase
      .from('articles')
      .update({
        ...updates,
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', articleId);

    if (error) {
      console.error('Error updating article:', error);
      alert('기사 업데이트 실패: ' + error.message);
    } else {
      fetchArticles();
    }
  }

  async function approveArticle(article: Article) {
    await updateArticle(article.id, { 
      status: 'approved',
      published_date: new Date().toISOString()
    });
  }

  async function rejectArticle(articleId: string) {
    await updateArticle(articleId, { status: 'rejected' });
  }

  function ArticleCard({ article }: { article: Article }) {
    const [locationType, setLocationType] = useState<string>(article.location_type || '');
    const [selectedPlant, setSelectedPlant] = useState<string>(article.power_plant_id || '');
    const [regionName, setRegionName] = useState<string>(article.region_name || '');
    const [category, setCategory] = useState<string>(article.category || '');
    const [isEditing, setIsEditing] = useState(false);

    const handleSaveMetadata = async () => {
      const updates: Partial<Article> = {
        location_type: locationType as any,
        category
      };

      if (locationType === 'power_plant' && selectedPlant) {
        const plant = powerPlants.find(p => p.id === selectedPlant);
        updates.power_plant_id = selectedPlant;
        updates.latitude = plant?.latitude;
        updates.longitude = plant?.longitude;
      } else if (locationType === 'regional') {
        updates.region_name = regionName;
      }

      await updateArticle(article.id, updates);
      setIsEditing(false);
    };

    return (
      <Card className="p-6 mb-4">
        <div className="space-y-4">
          {/* 헤더 */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{article.source}</span>
                <span>•</span>
                <span>{new Date(article.published_at).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
            <Badge variant={
              article.status === 'approved' ? 'default' : 
              article.status === 'rejected' ? 'destructive' : 
              'secondary'
            }>
              {article.status === 'approved' ? '승인됨' : 
               article.status === 'rejected' ? '거부됨' : '대기중'}
            </Badge>
          </div>

          {/* 내용 미리보기 */}
          <div className="text-sm text-gray-700 line-clamp-3">
            {article.content || '내용 없음'}
          </div>

          {/* 메타데이터 편집 */}
          {isEditing ? (
            <div className="border-t pt-4 space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">위치 유형</label>
                <Select value={locationType} onValueChange={setLocationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="위치 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="power_plant">발전소 관련</SelectItem>
                    <SelectItem value="regional">지역 뉴스</SelectItem>
                    <SelectItem value="national">전국 뉴스</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {locationType === 'power_plant' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">발전소 선택</label>
                  <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                    <SelectTrigger>
                      <SelectValue placeholder="발전소 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {powerPlants.map(plant => (
                        <SelectItem key={plant.id} value={plant.id}>
                          {plant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {locationType === 'regional' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">지역명</label>
                  <Input 
                    value={regionName} 
                    onChange={(e) => setRegionName(e.target.value)}
                    placeholder="예: 서울, 부산, 경기도 등"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">카테고리</label>
                <Input 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="예: 환경오염, 정책, 사건사고 등"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveMetadata} size="sm">저장</Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">취소</Button>
              </div>
            </div>
          ) : (
            <div className="border-t pt-4">
              {article.location_type && (
                <div className="text-sm mb-2">
                  <span className="font-medium">위치: </span>
                  {article.location_type === 'power_plant' && powerPlants.find(p => p.id === article.power_plant_id)?.name}
                  {article.location_type === 'regional' && article.region_name}
                  {article.location_type === 'national' && '전국'}
                </div>
              )}
              {article.category && (
                <div className="text-sm mb-2">
                  <span className="font-medium">카테고리: </span>
                  {article.category}
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => window.open(article.url, '_blank')} 
              variant="outline"
              size="sm"
            >
              원문 보기
            </Button>
            
            {article.status === 'pending' && (
              <>
                <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm">
                  {isEditing ? '편집 취소' : '메타데이터 편집'}
                </Button>
                <Button onClick={() => approveArticle(article)} size="sm">
                  승인
                </Button>
                <Button onClick={() => rejectArticle(article.id)} variant="destructive" size="sm">
                  거부
                </Button>
              </>
            )}
            
            {article.status === 'approved' && (
              <Button onClick={() => updateArticle(article.id, { status: 'pending' })} variant="outline" size="sm">
                승인 취소
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">기사 관리</h1>
        
        {/* 필터 */}
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="pending">대기중</SelectItem>
              <SelectItem value="approved">승인됨</SelectItem>
              <SelectItem value="rejected">거부됨</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchArticles} variant="outline">
            새로고침
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">로딩 중...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">기사가 없습니다.</div>
      ) : (
        <div>
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

