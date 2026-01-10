"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  ExternalLink, 
  Search,
  Filter,
  Calendar,
  MapPin,
  Building,
  Edit,
  Save,
  X
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

interface Article {
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
  created_at: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  
  // 편집 모달 상태
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    location_type: 'national' as 'national' | 'regional' | 'power_plant',
    si_do: '',
    si_gun_gu: '',
    eup_myeon_dong: '',
    power_plant_id: ''
  });
  const [powerPlantSearch, setPowerPlantSearch] = useState('');
  const [filteredPowerPlants, setFilteredPowerPlants] = useState<any[]>([]);
  
  // 발전소 목록 상태
  const [powerPlants, setPowerPlants] = useState<any[]>([]);
  const [loadingPlants, setLoadingPlants] = useState(false);

  // 기사 데이터 로드
  useEffect(() => {
    loadArticles();
    loadPowerPlants();
  }, []);

  // 필터링 로직
  useEffect(() => {
    let filtered = articles;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(article => {
        const decodedTitle = decodeHtmlEntities(article.title);
        const decodedContent = stripHtmlTags(decodeHtmlEntities(article.content));
        return decodedTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
               decodedContent.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter(article => article.status === statusFilter);
    }

    // 위치 필터
    if (locationFilter !== "all") {
      filtered = filtered.filter(article => article.location_type === locationFilter);
    }

    setFilteredArticles(filtered);
  }, [articles, searchTerm, statusFilter, locationFilter]);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // 발전소 데이터 로드 및 그룹화
  const loadPowerPlants = async () => {
    setLoadingPlants(true);
    try {
      const { data, error } = await supabase
        .from('power_plants')
        .select('id, name, plant_type, fuel_type, operator, status')
        .order('name');

      if (error) throw error;
      
      // GT/ST 그룹화
      const groupedPlants = groupPowerPlants(data || []);
      setPowerPlants(groupedPlants);
      setFilteredPowerPlants(groupedPlants);
    } catch (error) {
      console.error('Error loading power plants:', error);
    } finally {
      setLoadingPlants(false);
    }
  };

  // 발전소 검색 필터링
  const filterPowerPlants = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredPowerPlants(powerPlants);
      return;
    }

    const filtered = powerPlants.filter(plant => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = plant.name.toLowerCase().includes(searchLower);
      const fuelMatch = plant.fuel_type?.toLowerCase().includes(searchLower);
      const typeMatch = plant.plant_type?.toLowerCase().includes(searchLower);
      const operatorMatch = plant.operator?.toLowerCase().includes(searchLower);
      
      return nameMatch || fuelMatch || typeMatch || operatorMatch;
    });
    
    setFilteredPowerPlants(filtered);
  };

  // 발전소 그룹화 함수
  const groupPowerPlants = (plants: any[]) => {
    const grouped: { [key: string]: any } = {};
    
    plants.forEach(plant => {
      // GT/ST 제거한 기본 이름 추출
      const baseName = plant.name.replace(/\s*(GT|ST)$/g, '').trim();
      
      if (!grouped[baseName]) {
        grouped[baseName] = {
          id: plant.id, // 첫 번째 발전소의 ID 사용
          name: baseName,
          plant_type: plant.plant_type,
          fuel_type: plant.fuel_type,
          operator: plant.operator,
          status: plant.status,
          hasGT: false,
          hasST: false,
          gtId: null,
          stId: null,
          originalName: plant.name
        };
      }
      
      // GT/ST 구분 추가
      if (plant.name.includes('GT')) {
        grouped[baseName].hasGT = true;
        grouped[baseName].gtId = plant.id;
      }
      if (plant.name.includes('ST')) {
        grouped[baseName].hasST = true;
        grouped[baseName].stId = plant.id;
      }
    });
    
    return Object.values(grouped);
  };

  const updateArticleStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // 로컬 상태 업데이트
      setArticles(prev => 
        prev.map(article => 
          article.id === id ? { ...article, status } : article
        )
      );
    } catch (error) {
      console.error('Error updating article status:', error);
    }
  };

  // 기사 편집 모달 열기
  const openEditModal = (article: Article) => {
    setEditingArticle(article);
    setEditForm({
      title: decodeHtmlEntities(article.title),
      content: stripHtmlTags(decodeHtmlEntities(article.content)),
      location_type: article.location_type || 'national',
      si_do: article.si_do || '',
      si_gun_gu: article.si_gun_gu || '',
      eup_myeon_dong: article.eup_myeon_dong || '',
      power_plant_id: article.power_plant_id || ''
    });
    
    // 발전소 검색 상태 초기화
    setPowerPlantSearch('');
    setFilteredPowerPlants(powerPlants);
  };

  // 기사 편집 모달 닫기
  const closeEditModal = () => {
    setEditingArticle(null);
    setEditForm({
      title: '',
      content: '',
      location_type: 'national',
      si_do: '',
      si_gun_gu: '',
      eup_myeon_dong: '',
      power_plant_id: ''
    });
  };

  // 기사 업데이트
  const updateArticle = async () => {
    if (!editingArticle) return;

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          title: editForm.title,
          content: editForm.content,
          location_type: editForm.location_type,
          si_do: editForm.si_do,
          si_gun_gu: editForm.si_gun_gu,
          eup_myeon_dong: editForm.eup_myeon_dong,
          power_plant_id: editForm.power_plant_id || null,
          status: 'approved' // 편집 후 자동 승인
        })
        .eq('id', editingArticle.id);

      if (error) throw error;

      // 로컬 상태 업데이트
      setArticles(prev => 
        prev.map(article => 
          article.id === editingArticle.id 
            ? { 
                ...article, 
                title: editForm.title,
                content: editForm.content,
                location_type: editForm.location_type,
                si_do: editForm.si_do,
                si_gun_gu: editForm.si_gun_gu,
                eup_myeon_dong: editForm.eup_myeon_dong,
                power_plant_id: editForm.power_plant_id,
                status: 'approved'
              } 
            : article
        )
      );

      closeEditModal();
    } catch (error) {
      console.error('Error updating article:', error);
    }
  };

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
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">전국</Badge>;
      case 'regional':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">지역</Badge>;
      case 'power_plant':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">발전소</Badge>;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">기사를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        [data-radix-popper-content-wrapper] {
          z-index: 99999 !important;
        }
        [data-radix-select-content] {
          z-index: 99999 !important;
          position: fixed !important;
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          border-radius: 6px !important;
        }
        [data-radix-select-viewport] {
          z-index: 99999 !important;
          background-color: white !important;
        }
        [data-radix-select-item] {
          background-color: white !important;
          border-bottom: 1px solid #f3f4f6 !important;
        }
        [data-radix-select-item]:hover {
          background-color: #f9fafb !important;
        }
      `}</style>
      <div className="max-w-7xl mx-auto p-4">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">기사 관리</h1>
          <p className="text-gray-600">Inoreader로부터 수집된 기사를 검토하고 승인합니다</p>
        </div>

        {/* 필터 및 검색 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">필터 및 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="제목 또는 내용 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="위치 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="national">전국</SelectItem>
                  <SelectItem value="regional">지역</SelectItem>
                  <SelectItem value="power_plant">발전소</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setLocationFilter("all");
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                필터 초기화
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">전체 기사</p>
                  <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">대기중</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {articles.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">승인됨</p>
                  <p className="text-2xl font-bold text-green-600">
                    {articles.filter(a => a.status === 'approved').length}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">거부됨</p>
                  <p className="text-2xl font-bold text-red-600">
                    {articles.filter(a => a.status === 'rejected').length}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 기사 목록 */}
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">검색 조건에 맞는 기사가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
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
                        {stripHtmlTags(decodeHtmlEntities(article.content))}
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
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(article)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          편집
                        </Button>
                        
                        {/* 상태 변경 버튼들 */}
                        <div className="flex gap-2">
                          {article.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => updateArticleStatus(article.id, 'approved')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                승인
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => updateArticleStatus(article.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                거부
                              </Button>
                            </>
                          )}
                          
                          {article.status === 'approved' && (
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => updateArticleStatus(article.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              거부로 변경
                            </Button>
                          )}
                          
                          {article.status === 'rejected' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => updateArticleStatus(article.id, 'approved')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              승인으로 변경
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* 편집 모달 */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 99998 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative" style={{ zIndex: 99998 }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">기사 편집</h2>
                <Button variant="ghost" size="sm" onClick={closeEditModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="기사 제목을 입력하세요"
                  />
                </div>

                {/* 내용 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내용
                  </label>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="기사 내용을 입력하세요"
                    className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                  />
                </div>

                {/* 위치 타입 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    뉴스 분류
                  </label>
                  <Select
                    value={editForm.location_type}
                    onValueChange={(value: 'national' | 'regional' | 'power_plant') => 
                      setEditForm(prev => ({ ...prev, location_type: value }))
                    }
                  >
                    <SelectTrigger className="w-full h-10 px-3 py-2 text-sm">
                      <SelectValue placeholder="뉴스 분류를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent 
                      className="min-w-[300px] w-full bg-white border border-gray-200 shadow-lg rounded-md"
                      style={{ 
                        position: 'fixed !important',
                        zIndex: '99999 !important',
                        minWidth: '300px',
                        width: 'auto',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                      }}
                      position="popper"
                      sideOffset={4}
                      avoidCollisions={true}
                      collisionPadding={20}
                    >
                      <SelectItem value="national" className="py-4 px-4 text-sm min-h-[50px] flex items-center bg-white hover:bg-gray-50 border-b border-gray-100">
                        전국 뉴스
                      </SelectItem>
                      <SelectItem value="regional" className="py-4 px-4 text-sm min-h-[50px] flex items-center bg-white hover:bg-gray-50 border-b border-gray-100">
                        지역 뉴스
                      </SelectItem>
                      <SelectItem value="power_plant" className="py-4 px-4 text-sm min-h-[50px] flex items-center bg-white hover:bg-gray-50">
                        발전소 뉴스
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 발전소 선택 (발전소 뉴스인 경우) */}
                {editForm.location_type === 'power_plant' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      관련 발전소
                    </label>
                    
                    {/* 검색 입력창 */}
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="발전소명, 연료, 타입으로 검색 (예: lng 안동, 안동 복합)"
                        value={powerPlantSearch}
                        onChange={(e) => {
                          setPowerPlantSearch(e.target.value);
                          filterPowerPlants(e.target.value);
                        }}
                        className="w-full h-10 px-3 py-2 text-sm"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* 검색 결과 목록 */}
                    <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-md bg-white">
                      {loadingPlants ? (
                        <div className="p-4 text-center text-gray-500">
                          발전소 목록을 불러오는 중...
                        </div>
                      ) : filteredPowerPlants.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          {powerPlantSearch ? '검색 결과가 없습니다' : '발전소를 검색해보세요'}
                        </div>
                      ) : (
                        filteredPowerPlants.map((plant) => (
                          <div
                            key={plant.id}
                            onClick={() => {
                              setEditForm(prev => ({ ...prev, power_plant_id: plant.id }));
                              setPowerPlantSearch(plant.name);
                            }}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                              editForm.power_plant_id === plant.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between w-full gap-3">
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium text-sm truncate">{plant.name}</span>
                                <span className="text-xs text-gray-500 truncate">
                                  {plant.plant_type} • {plant.fuel_type} • {plant.operator}
                                </span>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                {plant.hasGT && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">
                                    GT
                                  </span>
                                )}
                                {plant.hasST && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                                    ST
                                  </span>
                                )}
                                {plant.hasGT && plant.hasST && (
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded whitespace-nowrap">
                                    복합
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      💡 GT: 가스터빈, ST: 증기터빈, 복합: GT+ST 모두 보유
                    </p>
                  </div>
                )}

                {/* 위치 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시/도
                    </label>
                    <Input
                      value={editForm.si_do}
                      onChange={(e) => setEditForm(prev => ({ ...prev, si_do: e.target.value }))}
                      placeholder="예: 서울특별시"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시/군/구
                    </label>
                    <Input
                      value={editForm.si_gun_gu}
                      onChange={(e) => setEditForm(prev => ({ ...prev, si_gun_gu: e.target.value }))}
                      placeholder="예: 강남구"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      읍/면/동
                    </label>
                    <Input
                      value={editForm.eup_myeon_dong}
                      onChange={(e) => setEditForm(prev => ({ ...prev, eup_myeon_dong: e.target.value }))}
                      placeholder="예: 역삼동"
                    />
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={closeEditModal}>
                    취소
                  </Button>
                  <Button onClick={updateArticle} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    저장 및 승인
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
