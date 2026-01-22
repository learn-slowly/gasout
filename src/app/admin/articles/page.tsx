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
  si_do?: string;
  si_gun_gu?: string;
  eup_myeon_dong?: string;
  created_at: string;
  // AI 분석 필드
  ai_score?: number;
  is_relevant?: boolean;
  ai_summary?: string;
  ai_analyzed_at?: string;
  ai_model_version?: string;
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

  // AI 분석 상태
  const [analyzingArticles, setAnalyzingArticles] = useState<Set<string>>(new Set());

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

  const getAIBadge = (article: Article) => {
    if (article.ai_score === null || article.ai_score === undefined) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">미분석</Badge>;
    }
    
    if (article.is_relevant) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
          🤖 관련 ({article.ai_score}점)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
          무관 ({article.ai_score}점)
        </Badge>
      );
    }
  };

  // AI 분석 실행
  const analyzeArticle = async (articleId: string) => {
    setAnalyzingArticles(prev => new Set(prev).add(articleId));

    try {
      const response = await fetch('/api/admin/analyze-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      });

      const result = await response.json();

      if (result.success) {
        // 로컬 상태 업데이트
        await loadArticles(); // 기사 목록 새로고침
      } else {
        console.error('AI 분석 실패:', result.error || result.errors);
        alert(`AI 분석 실패: ${result.error || result.errors?.[0]?.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('AI 분석 오류:', error);
      alert('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setAnalyzingArticles(prev => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  };

  // 모든 미분석 기사 분석
  const analyzeAllPending = async () => {
    const pendingArticles = articles.filter(a => 
      a.status === 'pending' && (a.ai_score === null || a.ai_score === undefined)
    );

    if (pendingArticles.length === 0) {
      alert('분석할 기사가 없습니다.');
      return;
    }

    if (!confirm(`${pendingArticles.length}개의 기사를 분석하시겠습니까?`)) {
      return;
    }

    for (const article of pendingArticles) {
      await analyzeArticle(article.id);
      // API 할당량을 고려하여 딜레이 추가
      await new Promise(resolve => setTimeout(resolve, 2000));
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      <style jsx global>{`
        [data-radix-popper-content-wrapper] {
          z-index: 99999 !important;
        }
        [data-radix-select-content] {
          z-index: 99999 !important;
          position: fixed !important;
          background-color: #1e293b !important;
          border: 1px solid #334155 !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
          border-radius: 6px !important;
          color: #f8fafc !important;
        }
        [data-radix-select-viewport] {
          z-index: 99999 !important;
          background-color: #1e293b !important;
        }
        [data-radix-select-item] {
          color: #f8fafc !important;
          background-color: transparent !important;
          border-bottom: 1px solid #334155 !important;
        }
        [data-radix-select-item]:hover, [data-radix-select-item][data-highlighted] {
          background-color: #334155 !important;
          color: white !important;
        }
      `}</style>
      <div className="max-w-7xl mx-auto p-4 relative z-10">
        {/* 헤더 */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight text-glow">기사 관리</h1>
              <p className="text-sm text-slate-400 mt-1">Inoreader로부터 수집된 기사를 검토하고 승인하거나 편집합니다</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200"
            onClick={analyzeAllPending}
          >
            🤖 미분석 기사 AI 분석
          </Button>
        </div>

        {/* 필터 및 검색 */}
        <Card className="glass-card mb-6">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg text-white">필터 및 검색</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="제목 또는 내용 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white focus:ring-indigo-500/20">
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
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white focus:ring-indigo-500/20">
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
                className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                필터 초기화
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">전체 기사</p>
                  <p className="text-2xl font-bold text-white">{articles.length}</p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">대기중</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {articles.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">승인됨</p>
                  <p className="text-2xl font-bold text-green-400">
                    {articles.filter(a => a.status === 'approved').length}
                  </p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">거부됨</p>
                  <p className="text-2xl font-bold text-red-400">
                    {articles.filter(a => a.status === 'rejected').length}
                  </p>
                </div>
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 기사 목록 */}
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <Card className="glass-card border-dashed border-white/10">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 text-lg">검색 조건에 맞는 기사가 없습니다.</p>
                <Button
                  variant="link"
                  className="text-indigo-400 mt-2"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setLocationFilter("all");
                  }}
                >
                  필터 초기화
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredArticles.map((article) => (
              <Card key={article.id} className="glass-card hover:bg-slate-800/80 transition-all group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {getStatusBadge(article.status)}
                        {getLocationBadge(article.location_type)}
                        {article.power_plant_id && (
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                            <Building className="w-3 h-3 mr-1" />
                            발전소 연결됨
                          </Badge>
                        )}
                        {getAIBadge(article)}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                        {decodeHtmlEntities(article.title)}
                      </h3>

                      <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {stripHtmlTags(decodeHtmlEntities(article.content))}
                      </p>

                      {article.ai_summary && (
                        <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                          <p className="text-xs text-indigo-300 font-medium mb-1">🤖 AI 요약</p>
                          <p className="text-sm text-slate-300">{article.ai_summary}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.published_at)}
                        </div>
                        {article.latitude && article.longitude && (
                          <div className="flex items-center gap-1 text-teal-400">
                            <MapPin className="w-3 h-3" />
                            위치 정보 있음
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4 min-w-[120px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                        onClick={() => window.open(article.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        원문 보기
                      </Button>

                      <div className="flex flex-col gap-2 pt-2 border-t border-white/5 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200"
                          onClick={() => openEditModal(article)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          편집
                        </Button>

                        {/* AI 분석 버튼 */}
                        {(article.ai_score === null || article.ai_score === undefined) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200"
                            onClick={() => analyzeArticle(article.id)}
                            disabled={analyzingArticles.has(article.id)}
                          >
                            {analyzingArticles.has(article.id) ? (
                              <>
                                <div className="animate-spin w-4 h-4 mr-1 border-2 border-purple-300 border-t-transparent rounded-full" />
                                분석 중...
                              </>
                            ) : (
                              <>
                                🤖 AI 분석
                              </>
                            )}
                          </Button>
                        )}

                        {/* 상태 변경 버튼들 */}
                        <div className="flex flex-col gap-2">
                          {article.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-500 text-white"
                                onClick={() => updateArticleStatus(article.id, 'approved')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-500 text-white"
                                onClick={() => updateArticleStatus(article.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {article.status === 'approved' && (
                            <Button
                              size="sm"
                              className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                              onClick={() => updateArticleStatus(article.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              거부로 변경
                            </Button>
                          )}

                          {article.status === 'rejected' && (
                            <Button
                              size="sm"
                              className="bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 hover:text-green-300"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99998 }}>
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative" style={{ zIndex: 99998 }}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">기사 편집</h2>
                  <p className="text-sm text-slate-400">기사 내용을 수정하고 분류를 업데이트합니다</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeEditModal} className="text-slate-400 hover:text-white hover:bg-white/10">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    제목
                  </label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="기사 제목을 입력하세요"
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                  />
                </div>

                {/* 내용 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    내용
                  </label>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="기사 내용을 입력하세요"
                    className="w-full h-32 p-3 bg-slate-800/50 border border-white/10 rounded-md text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 resize-none focus:outline-none focus:ring-2"
                  />
                </div>

                {/* 위치 타입 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    뉴스 분류
                  </label>
                  <Select
                    value={editForm.location_type}
                    onValueChange={(value: 'national' | 'regional' | 'power_plant') =>
                      setEditForm(prev => ({ ...prev, location_type: value }))
                    }
                  >
                    <SelectTrigger className="w-full h-10 px-3 py-2 text-sm bg-slate-800/50 border-white/10 text-white focus:ring-indigo-500/20">
                      <SelectValue placeholder="뉴스 분류를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent
                      className="min-w-[300px] w-full bg-[#1e293b] border border-slate-700 shadow-xl rounded-md"
                      style={{
                        position: 'fixed',
                        zIndex: 99999,
                        minWidth: '300px',
                        width: 'auto',
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                      }}
                      position="popper"
                      sideOffset={4}
                      avoidCollisions={true}
                      collisionPadding={20}
                    >
                      <SelectItem value="national" className="py-3 px-4 text-sm min-h-[40px] flex items-center bg-transparent hover:bg-slate-700 text-slate-200 border-b border-slate-700 data-[highlighted]:bg-slate-700 data-[highlighted]:text-white">
                        전국 뉴스
                      </SelectItem>
                      <SelectItem value="regional" className="py-3 px-4 text-sm min-h-[40px] flex items-center bg-transparent hover:bg-slate-700 text-slate-200 border-b border-slate-700 data-[highlighted]:bg-slate-700 data-[highlighted]:text-white">
                        지역 뉴스
                      </SelectItem>
                      <SelectItem value="power_plant" className="py-3 px-4 text-sm min-h-[40px] flex items-center bg-transparent hover:bg-slate-700 text-slate-200 data-[highlighted]:bg-slate-700 data-[highlighted]:text-white">
                        발전소 뉴스
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 발전소 선택 (발전소 뉴스인 경우) */}
                {editForm.location_type === 'power_plant' && (
                  <div className="space-y-2 p-4 bg-slate-800/30 rounded-xl border border-white/5">
                    <label className="block text-sm font-medium text-slate-300">
                      관련 발전소 검색
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
                        className="w-full h-10 px-3 pl-10 py-2 text-sm bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Search className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>

                    {/* 검색 결과 목록 */}
                    <div className="max-h-[250px] overflow-y-auto border border-white/10 rounded-md bg-slate-900/50 custom-scrollbar">
                      {loadingPlants ? (
                        <div className="p-4 text-center text-slate-500 flex items-center justify-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full" />
                          발전소 목록을 불러오는 중...
                        </div>
                      ) : filteredPowerPlants.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">
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
                            className={`p-3 border-b border-white/5 cursor-pointer transition-colors ${editForm.power_plant_id === plant.id
                              ? 'bg-indigo-500/20 border-indigo-500/30'
                              : 'hover:bg-white/5'
                              }`}
                          >
                            <div className="flex items-center justify-between w-full gap-3">
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className={`font-medium text-sm truncate ${editForm.power_plant_id === plant.id ? 'text-indigo-300' : 'text-slate-300'}`}>
                                  {plant.name}
                                </span>
                                <span className="text-xs text-slate-500 truncate">
                                  {plant.plant_type} • {plant.fuel_type} • {plant.operator}
                                </span>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                {plant.hasGT && (
                                  <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20 px-1 py-0.5 h-auto">
                                    GT
                                  </Badge>
                                )}
                                {plant.hasST && (
                                  <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20 px-1 py-0.5 h-auto">
                                    ST
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* 위치 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      시/도
                    </label>
                    <Input
                      value={editForm.si_do}
                      onChange={(e) => setEditForm(prev => ({ ...prev, si_do: e.target.value }))}
                      placeholder="예: 서울특별시"
                      className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      시/군/구
                    </label>
                    <Input
                      value={editForm.si_gun_gu}
                      onChange={(e) => setEditForm(prev => ({ ...prev, si_gun_gu: e.target.value }))}
                      placeholder="예: 강남구"
                      className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      읍/면/동
                    </label>
                    <Input
                      value={editForm.eup_myeon_dong}
                      onChange={(e) => setEditForm(prev => ({ ...prev, eup_myeon_dong: e.target.value }))}
                      placeholder="예: 역삼동"
                      className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-3 pt-6 border-t border-white/10 bg-black/20 p-4 -mx-6 -mb-6 mt-4">
                  <Button
                    variant="outline"
                    onClick={closeEditModal}
                    className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    취소
                  </Button>
                  <Button onClick={updateArticle} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
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
