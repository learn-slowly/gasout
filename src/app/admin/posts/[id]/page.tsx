"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, LayoutDashboard, Zap, Youtube, Check, Edit } from "lucide-react";

type PowerPlant = {
  id: string;
  name: string;
  status: string | null;
};

type Post = {
  id: string;
  title: string;
  content: string;
  plant_id: string;
  youtube_url: string | null;
  created_at: string;
  updated_at: string;
};

export default function EditPost({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [plants, setPlants] = useState<PowerPlant[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadData();
  }, [params.id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/admin/login");
      return;
    }
  };

  const loadData = async () => {
    try {
      // 게시물 데이터 로드
      const { data: postData, error: postError } = await supabase
        .from("activity_posts")
        .select("*")
        .eq("id", params.id)
        .single();

      if (postError || !postData) {
        setError("게시물을 찾을 수 없습니다.");
        return;
      }

      setPost(postData);
      setTitle(postData.title);
      setContent(postData.content);
      setSelectedPlantId(postData.plant_id);
      setYoutubeUrl(postData.youtube_url || "");

      // 발전소 목록 로드
      const { data: plantsData } = await supabase
        .from("power_plants")
        .select("id, name, status")
        .order("name");

      setPlants(plantsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!title.trim() || !content.trim() || !selectedPlantId) {
      setError("제목, 내용, 발전소를 모두 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("activity_posts")
        .update({
          title: title.trim(),
          content: content.trim(),
          plant_id: selectedPlantId,
          youtube_url: youtubeUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);

      if (error) {
        setError("게시물 수정에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      router.push("/admin/posts");
    } catch (err) {
      setError("게시물 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case '운영중': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case '건설중': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case '계획중': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case '백지화': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          <div className="text-lg text-slate-400">데이터를 불러오는 중...</div>
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

      <div className="p-6 max-w-4xl mx-auto relative z-10">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Edit className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight text-glow">게시물 편집</h1>
              <p className="text-sm text-slate-400 mt-1">활동 소식 내용을 수정하세요</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/posts")}
              className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로
            </Button>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-xl text-white">게시물 수정</CardTitle>
            <CardDescription className="text-slate-400 flex flex-col sm:flex-row sm:items-center gap-2">
              <span>작성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
              {post.updated_at !== post.created_at && (
                <span className="text-orange-400 flex items-center gap-1">
                  • 수정됨: {new Date(post.updated_at).toLocaleDateString('ko-KR')}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 발전소 선택 */}
              <div className="space-y-4">
                <Label htmlFor="plant" className="text-slate-300 text-base font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  관련 발전소 <span className="text-indigo-400">*</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border border-white/10 rounded-xl p-3 bg-slate-900/50 custom-scrollbar">
                  {plants.map((plant) => (
                    <div
                      key={plant.id}
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedPlantId === plant.id
                          ? "bg-indigo-500/20 border-indigo-500/50 shadow-inner shadow-indigo-500/10"
                          : "bg-slate-800/50 border-white/5 hover:bg-slate-700/50 hover:border-white/10"
                        }`}
                      onClick={() => setSelectedPlantId(plant.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${selectedPlantId === plant.id ? "text-indigo-300" : "text-slate-300"}`}>
                          {plant.name}
                        </span>
                        <Badge variant="outline" className={getStatusColor(plant.status)}>
                          {plant.status || '미정'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedPlantId && (
                  <p className="text-sm text-green-400 flex items-center gap-2 px-1 animate-pulse">
                    <Check className="w-4 h-4" />
                    {plants.find(p => p.id === selectedPlantId)?.name} 선택됨
                  </p>
                )}
              </div>

              {/* 제목 */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-slate-300 text-base font-medium">
                  제목 <span className="text-indigo-400">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="게시물 제목을 입력하세요"
                  required
                  className="h-12 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 text-lg"
                />
              </div>

              {/* 내용 */}
              <div className="space-y-3">
                <Label htmlFor="content" className="text-slate-300 text-base font-medium">
                  내용 <span className="text-indigo-400">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="활동 소식의 상세 내용을 입력하세요"
                  rows={8}
                  required
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 resize-none min-h-[200px]"
                />
              </div>

              {/* 유튜브 링크 */}
              <div className="space-y-3">
                <Label htmlFor="youtube" className="text-slate-300 text-base font-medium flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-400" />
                  유튜브 링크 <span className="text-slate-500 text-xs font-normal ml-1">(선택사항)</span>
                </Label>
                <Input
                  id="youtube"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
                <p className="text-xs text-slate-500 px-1">
                  유튜브 영상이 있다면 링크를 입력하세요. 상세 페이지에 임베드됩니다.
                </p>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 h-12 text-base font-medium"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2" />
                      수정 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      게시물 수정
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/posts")}
                  className="flex-1 bg-slate-800/50 border-white/10 text-slate-300 hover:bg-slate-700/50 hover:text-white h-12 text-base font-medium"
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
