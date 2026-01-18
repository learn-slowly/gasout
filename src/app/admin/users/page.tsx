"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, LayoutDashboard, LogOut, Search, UserCheck, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";

type User = {
  id: string;
  role: string;
  created_at: string;
  auth: {
    users: {
      email: string;
    } | null;
  } | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadUsers();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/admin/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/admin/login");
      return;
    }
  };

  const loadUsers = async () => {
    try {
      // @ts-ignore - Supabase type inference for joined tables can be tricky
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          role,
          created_at,
          auth:users!inner(email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers((data as unknown as User[]) || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          <div className="text-lg text-slate-400">사용자 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    (user.auth?.users?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/20 via-background to-background pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 px-6 py-8">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/10 shrink-0">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight text-glow">사용자 관리</h1>
              <p className="text-sm text-slate-400 mt-1">관리자 계정 및 권한 관리</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/dashboard")}
              className="bg-slate-800/50 border-white/10 text-slate-300 hover:bg-slate-700/50 hover:text-white"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              대시보드
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* 검색 */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="이메일 주소 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
        </div>

        {/* 사용자 목록 */}
        <Card className="glass-card border-0 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                등록된 사용자 <span className="text-slate-500 text-sm font-normal ml-2">({filteredUsers.length}명)</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center">
                <Users className="w-12 h-12 mb-4 opacity-20" />
                <p>등록된 사용자가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-800/40 border border-white/5 rounded-xl hover:bg-slate-800/60 transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5">
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center border border-white/5">
                        <Mail className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">{user.auth?.users?.email || '이메일 없음'}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`px-3 py-1 ${user.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}
                      >
                        <Shield className="w-3 h-3 mr-1.5" />
                        {user.role === 'admin' ? '관리자' : '일반 사용자'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
