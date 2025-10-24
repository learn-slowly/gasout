"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function NewPlantPage() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    capacity_mw: "",
    status: "운영중",
    plant_type: "",
    fuel_type: "",
    operator: "",
    permit_date: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase
        .from("power_plants")
        .insert([{
          name: formData.name,
          address: formData.address,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          capacity_mw: parseInt(formData.capacity_mw) || null,
          status: formData.status,
          plant_type: formData.plant_type,
          fuel_type: formData.fuel_type,
          operator: formData.operator,
          permit_date: formData.permit_date || null,
          description: formData.description
        }]);

      if (error) throw error;

      router.push("/admin/plants");
    } catch (err) {
      setError("발전소 추가에 실패했습니다.");
      console.error("Error adding plant:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">새 발전소 추가</h1>
                <p className="text-xs text-gray-500">발전소 정보를 입력하세요</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/admin/plants")}
                className="text-xs"
              >
                목록으로
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/admin/dashboard")}
                className="text-xs"
              >
                대시보드
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="text-xs text-red-600 hover:bg-red-50"
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>발전소 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">발전소명 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">주소 *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="latitude">위도 *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="longitude">경도 *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="capacity_mw">발전 용량 (MW)</Label>
                    <Input
                      id="capacity_mw"
                      type="number"
                      value={formData.capacity_mw}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity_mw: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">상태</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="운영중">운영중</SelectItem>
                        <SelectItem value="건설중">건설중</SelectItem>
                        <SelectItem value="계획중">계획중</SelectItem>
                        <SelectItem value="백지화">백지화</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="plant_type">발전소 유형</Label>
                    <Input
                      id="plant_type"
                      value={formData.plant_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, plant_type: e.target.value }))}
                      placeholder="예: 화력, 수력, 원자력, 열병합"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fuel_type">연료 유형</Label>
                    <Input
                      id="fuel_type"
                      value={formData.fuel_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, fuel_type: e.target.value }))}
                      placeholder="예: 석탄, LNG, 경유, 기타화력"
                    />
                  </div>

                  <div>
                    <Label htmlFor="operator">운영사</Label>
                    <Input
                      id="operator"
                      value={formData.operator}
                      onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="permit_date">허가일</Label>
                    <Input
                      id="permit_date"
                      type="date"
                      value={formData.permit_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, permit_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "추가 중..." : "발전소 추가"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/admin/plants")}>
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
