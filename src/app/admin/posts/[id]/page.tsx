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
      case '운영중': return 'bg-green-100 text-green-800';
      case '건설중': return 'bg-orange-100 text-orange-800';
      case '계획중': return 'bg-blue-100 text-blue-800';
      case '백지화': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">게시물 편집</h1>
            <p className="text-gray-600">활동 소식을 수정하세요</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/admin/posts")}>
              목록으로
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
              대시보드
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>게시물 수정</CardTitle>
            <CardDescription>
              작성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}
              {post.updated_at !== post.created_at && (
                <span className="ml-2 text-orange-600">
                  (수정됨: {new Date(post.updated_at).toLocaleDateString('ko-KR')})
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 발전소 선택 */}
              <div className="space-y-2">
                <Label htmlFor="plant">관련 발전소 *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-md p-2">
                  {plants.map((plant) => (
                    <div
                      key={plant.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedPlantId === plant.id
                          ? "bg-blue-50 border-2 border-blue-200"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                      onClick={() => setSelectedPlantId(plant.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{plant.name}</span>
                        <Badge className={getStatusColor(plant.status)}>
                          {plant.status || '미정'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedPlantId && (
                  <p className="text-sm text-green-600">
                    ✓ {plants.find(p => p.id === selectedPlantId)?.name} 선택됨
                  </p>
                )}
              </div>

              {/* 제목 */}
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="게시물 제목을 입력하세요"
                  required
                />
              </div>

              {/* 내용 */}
              <div className="space-y-2">
                <Label htmlFor="content">내용 *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="활동 소식의 상세 내용을 입력하세요"
                  rows={8}
                  required
                />
              </div>

              {/* 유튜브 링크 */}
              <div className="space-y-2">
                <Label htmlFor="youtube">유튜브 링크 (선택사항)</Label>
                <Input
                  id="youtube"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-sm text-gray-500">
                  유튜브 영상이 있다면 링크를 입력하세요
                </p>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "수정 중..." : "게시물 수정"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/posts")}
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
