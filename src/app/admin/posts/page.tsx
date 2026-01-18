"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Plus, LayoutDashboard, Edit, Trash2, Youtube, Zap, FileText, MonitorPlay } from "lucide-react";

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  youtube_url: string | null;
  power_plants: {
    name: string;
  } | { name: string }[];
};

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadPosts();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/admin/login");
      return;
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_posts")
        .select(`
          id,
          title,
          content,
          created_at,
          youtube_url,
          power_plants!inner(name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading posts:", error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("activity_posts")
        .delete()
        .eq("id", postId);

      if (error) {
        alert("게시물 삭제에 실패했습니다.");
        return;
      }

      // 목록 새로고침
      loadPosts();
    } catch (error) {
      alert("게시물 삭제 중 오류가 발생했습니다.");
    }
  };

  // Helper to get power plant name safely
  const getPowerPlantName = (post: Post) => {
    if (Array.isArray(post.power_plants)) {
      return post.power_plants[0]?.name || '알 수 없음';
    }
    return post.power_plants?.name || '알 수 없음';
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPowerPlantName(post).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
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

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight text-glow">활동 소식 관리</h1>
              <p className="text-sm text-slate-400 mt-1">발전소 관련 활동 소식을 관리하세요</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/posts/new">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                <Plus className="w-4 h-4 mr-2" />
                새 게시물 작성
              </Button>
            </Link>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">총 게시물</p>
                  <div className="text-3xl font-bold text-white text-glow">{posts.length}</div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">유튜브 영상</p>
                  <div className="text-3xl font-bold text-green-400 text-glow">
                    {posts.filter(p => p.youtube_url).length}
                  </div>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <Youtube className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">관련 발전소</p>
                  <div className="text-3xl font-bold text-orange-400 text-glow">
                    {new Set(posts.map(p => getPowerPlantName(p))).size}
                  </div>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 목록 */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="제목이나 발전소명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>
            </CardContent>
          </Card>

          {filteredPosts.length === 0 ? (
            <Card className="glass-card border-dashed border-white/10">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-500" />
                </div>
                <div className="text-slate-400 text-lg mb-4">
                  {searchTerm ? "검색 결과가 없습니다." : "등록된 게시물이 없습니다."}
                </div>
                {!searchTerm && (
                  <Link href="/admin/posts/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">첫 게시물 작성하기</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="glass-card hover:bg-slate-800/80 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20">
                            {getPowerPlantName(post)}
                          </Badge>
                          {post.youtube_url && (
                            <Badge variant="secondary" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 items-center gap-1">
                              <Youtube className="w-3 h-3" />
                              유튜브
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-slate-400 mb-4 line-clamp-2 leading-relaxed text-sm">
                          {post.content.length > 100
                            ? `${post.content.substring(0, 100)}...`
                            : post.content
                          }
                        </p>

                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>작성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4 min-w-[100px]">
                        <Link href={`/admin/posts/${post.id}`}>
                          <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
                            <Edit className="w-4 h-4 mr-2" />
                            편집
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="w-full bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
