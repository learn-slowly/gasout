import { supabase } from "@/src/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PowerPlant = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity_mw: number | null;
  status: string | null;
  operator: string | null;
  permit_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type ActivityPost = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  youtube_url: string | null;
};

export default async function PowerPlantDetail({ params }: { params: { id: string } }) {
  const { data: plant, error: plantError } = await supabase
    .from("power_plants")
    .select("*")
    .eq("id", params.id)
    .single();

  if (plantError || !plant) {
    notFound();
  }

  const { data: posts, error: postsError } = await supabase
    .from("activity_posts")
    .select("id,title,content,created_at,youtube_url")
    .eq("plant_id", params.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const powerPlant = plant as PowerPlant & { 
    classification?: string;
    plant_unit?: string;
    commissioning_date?: string;
    fuel_type?: string;
    notes?: string;
    info_link?: string;
  };
  const activityPosts = (posts ?? []) as ActivityPost[];

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case '운영중': return 'bg-red-100 text-red-800';
      case '건설중': return 'bg-orange-100 text-orange-800';
      case '계획중': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← 목록으로 돌아가기
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 기본 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 발전소 개요 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{powerPlant.name}</CardTitle>
                    <CardDescription className="text-base mt-2">{powerPlant.address}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(powerPlant.status)}>
                    {powerPlant.status || '미정'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="font-semibold text-gray-500 mb-1">발전용량</div>
                    <div className="text-lg font-bold">{powerPlant.capacity_mw ? `${powerPlant.capacity_mw} MW` : '미정'}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-500 mb-1">사업자</div>
                    <div className="text-lg font-bold">{powerPlant.operator || '미정'}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-500 mb-1">호기 정보</div>
                    <div className="text-lg font-bold">{powerPlant.plant_unit || '미정'}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-500 mb-1">준공일</div>
                    <div className="text-lg font-bold">{powerPlant.commissioning_date || '미정'}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-500 mb-1">연료 유형</div>
                    <div className="text-lg font-bold">{powerPlant.fuel_type || '미정'}</div>
                  </div>
                </div>

                {powerPlant.notes && (
                  <div className="mt-6">
                    <div className="font-semibold text-gray-500 mb-1">비고</div>
                    <p className="mt-1 text-gray-800">{powerPlant.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 활동 소식 */}
            <Card>
              <CardHeader>
                <CardTitle>활동 소식</CardTitle>
                <CardDescription>해당 발전소와 관련된 최신 활동 소식입니다</CardDescription>
              </CardHeader>
              <CardContent>
                {activityPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">등록된 활동 소식이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityPosts.map((post) => (
                      <Card key={post.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">{post.title}</h3>
                            <p className="text-sm text-gray-600">{post.content}</p>
                            {post.youtube_url && (
                              <div className="mt-2">
                                <a 
                                  href={post.youtube_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  유튜브 영상 보기 →
                                </a>
                              </div>
                            )}
                            <p className="text-xs text-gray-400">
                              {new Date(post.created_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 위치 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>위치 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">위도:</span> {powerPlant.latitude}
                  </div>
                  <div>
                    <span className="text-gray-600">경도:</span> {powerPlant.longitude}
                  </div>
                  <div className="pt-2">
                    <a 
                      href={`https://map.kakao.com/link/map/${powerPlant.name},${powerPlant.latitude},${powerPlant.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      카카오맵에서 보기 →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상태별 색상 */}
            <Card>
              <CardHeader>
                <CardTitle>상태별 색상</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span>운영중</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <span>건설중</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span>계획중</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 관련 링크 */}
            {powerPlant.info_link && (
              <Card>
                <CardHeader>
                  <CardTitle>관련 링크</CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={powerPlant.info_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    사업자 정보 페이지 바로가기 →
                  </a>
                </CardContent>
              </Card>
            )}

            {/* 최근 업데이트 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 업데이트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>마지막 수정: {new Date(powerPlant.updated_at).toLocaleDateString('ko-KR')}</div>
                  <div>등록일: {new Date(powerPlant.created_at).toLocaleDateString('ko-KR')}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}