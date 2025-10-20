"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PowerPlant = {
  id: string;
  name: string;
  address: string;
  status: string | null;
  capacity_mw: number | null;
  operator: string | null;
  plant_type: string | null;
  fuel_type: string | null;
};

type Props = {
  plants: PowerPlant[];
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  plantTypeFilter: string;
  setPlantTypeFilter: (filter: string) => void;
};

export default function PowerPlantList({ 
  plants, 
  statusFilter, 
  setStatusFilter, 
  plantTypeFilter, 
  setPlantTypeFilter 
}: Props) {

  const getStatusColorClasses = (status: string | null) => {
    switch (status) {
      case '운영중':
        return 'bg-red-100 text-red-800 border-red-200';
      case '건설중':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case '계획중':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 발전원 분류 함수 (연료 기반)
  const getPlantCategory = (plant: PowerPlant) => {
    const plantType = plant.plant_type?.toLowerCase() || '';
    const fuelType = plant.fuel_type?.toLowerCase() || '';
    const name = plant.name.toLowerCase();
    
    // 원자력
    if (plantType.includes('원자력') || fuelType.includes('농축u') || fuelType.includes('천연u')) {
      return '원자력';
    }
    
    // 열병합 (집단에너지)
    if (name.includes('열병합') || name.includes('집단에너지') || plantType.includes('집단에너지')) {
      return '열병합';
    }
    
    // 석탄
    if (fuelType.includes('유연탄') || fuelType.includes('무연탄') || fuelType.includes('역청탄')) {
      return '석탄';
    }
    
    // LNG
    if (fuelType.includes('lng')) {
      return 'LNG';
    }
    
    // 경유
    if (fuelType.includes('경유')) {
      return '경유';
    }
    
    // 기타화력 (중유, 바이오중유, 유류 등)
    if (fuelType.includes('중유') || fuelType.includes('바이오') || fuelType.includes('유류') || 
        plantType.includes('기력') || plantType.includes('내연력') || plantType.includes('복합')) {
      return '기타화력';
    }
    
    return '기타';
  };

  // 발전원별 색상
  const getPlantTypeColorClasses = (category: string) => {
    switch (category) {
      case '석탄':
        return 'bg-gray-900 text-white border-gray-900';
      case 'LNG':
        return 'bg-red-600 text-white border-red-600';
      case '경유':
        return 'bg-amber-600 text-white border-amber-600';
      case '기타화력':
        return 'bg-orange-600 text-white border-orange-600';
      case '원자력':
        return 'bg-purple-600 text-white border-purple-600';
      case '열병합':
        return 'bg-pink-600 text-white border-pink-600';
      default:
        return 'bg-gray-500 text-white border-gray-500';
    }
  };

  const filteredPlants = plants.filter(plant => {
    const statusMatch = statusFilter === "전체" || plant.status === statusFilter;
    const plantTypeMatch = plantTypeFilter === "전체" || getPlantCategory(plant) === plantTypeFilter;
    return statusMatch && plantTypeMatch;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 className="text-sm font-medium text-gray-900">발전소 목록</h2>
            <span className="text-xs text-gray-500">({filteredPlants.length}개)</span>
          </div>
        </div>
      </div>
      
      {/* 필터 버튼들 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">상태:</span>
            <div className="flex gap-1">
              {["전체", "운영중", "건설중", "계획중"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    statusFilter === status
                      ? status === "전체" 
                        ? "bg-blue-200 text-blue-800" 
                        : status === "운영중"
                        ? "bg-red-200 text-red-800"
                        : status === "건설중"
                        ? "bg-orange-200 text-orange-800"
                        : "bg-yellow-200 text-yellow-800"
                      : status === "전체"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : status === "운영중"
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : status === "건설중"
                      ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-xs text-gray-600 font-medium">연료:</span>
            <div className="flex gap-1">
              {["전체", "석탄", "LNG", "경유", "기타화력", "원자력", "열병합"].map((type) => (
                <button
                  key={type}
                  onClick={() => setPlantTypeFilter(type)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    plantTypeFilter === type
                      ? type === "전체" 
                        ? "bg-gray-300 text-gray-800" 
                        : type === "석탄"
                        ? "bg-gray-900 text-white"
                        : type === "LNG"
                        ? "bg-red-600 text-white"
                        : type === "경유"
                        ? "bg-amber-600 text-white"
                        : type === "기타화력"
                        ? "bg-orange-600 text-white"
                        : type === "원자력"
                        ? "bg-purple-600 text-white"
                        : "bg-pink-600 text-white"
                      : type === "전체"
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : type === "석탄"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-900 hover:text-white"
                      : type === "LNG"
                      ? "bg-red-100 text-red-700 hover:bg-red-600 hover:text-white"
                      : type === "경유"
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-600 hover:text-white"
                      : type === "기타화력"
                      ? "bg-orange-100 text-orange-700 hover:bg-orange-600 hover:text-white"
                      : type === "원자력"
                      ? "bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white"
                      : "bg-pink-100 text-pink-700 hover:bg-pink-600 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50">
        {filteredPlants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">선택한 필터에 해당하는 발전소가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredPlants.map((plant) => (
              <Card key={plant.id} className="flex h-full flex-col justify-between rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
                <CardHeader className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold leading-tight text-gray-800">
                      {plant.name}
                    </CardTitle>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ml-3 shrink-0 ${getStatusColorClasses(plant.status)}`}>
                      {plant.status || '미정'}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="mr-1.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {plant.address}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 p-4 pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">발전용량</span>
                        <span className="font-medium text-gray-800">
                          {plant.capacity_mw ? `${plant.capacity_mw} MW` : '미정'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">사업자</span>
                        <span className="font-medium text-gray-800 truncate">
                          {plant.operator || '미정'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">발전원</span>
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getPlantTypeColorClasses(getPlantCategory(plant))}`}>
                          {getPlantCategory(plant)}
                        </span>
                      </div>
                      {plant.fuel_type && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">연료</span>
                          <span className="text-xs text-gray-700">
                            {plant.fuel_type}
                          </span>
                        </div>
                      )}
                    </div>
                </CardContent>
                <div className="p-4 pt-0">
                  <Link href={`/powerplant/${plant.id}`} className="block">
                    <Button variant="outline" className="w-full">
                      상세 정보 보기
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
