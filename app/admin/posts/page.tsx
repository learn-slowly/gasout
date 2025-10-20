"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  youtube_url: string | null;
  power_plants: {
    name: string;
  };
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

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.power_plants.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
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
      <div className="p-6 max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">활동 소식 관리</h1>
            <p className="text-gray-600">발전소 관련 활동 소식을 관리하세요</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/posts/new">
              <Button>새 게시물 작성</Button>
            </Link>
            <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
              대시보드
            </Button>
          </div>
        </div>

        {/* 검색 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <Input
              placeholder="제목이나 발전소명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* 게시물 목록 */}
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                {searchTerm ? "검색 결과가 없습니다." : "등록된 게시물이 없습니다."}
              </div>
              {!searchTerm && (
                <Link href="/admin/posts/new">
                  <Button className="mt-4">첫 게시물 작성하기</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                        <Badge variant="outline">{post.power_plants.name}</Badge>
                        {post.youtube_url && (
                          <Badge variant="secondary">유튜브</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {post.content.length > 100 
                          ? `${post.content.substring(0, 100)}...` 
                          : post.content
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        작성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/admin/posts/${post.id}`}>
                        <Button variant="outline" size="sm">편집</Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 통계 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>게시물 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
                <div className="text-sm text-gray-600">총 게시물</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {posts.filter(p => p.youtube_url).length}
                </div>
                <div className="text-sm text-gray-600">유튜브 포함</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(posts.map(p => p.power_plants.name)).size}
                </div>
                <div className="text-sm text-gray-600">관련 발전소</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
