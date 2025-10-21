"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, MapPin } from "lucide-react";

interface PlantOverlayProps {
  plant: {
    id: string;
    name: string;
    address: string;
    status: string | null;
    capacity_mw: number | null;
    operator: string | null;
    plant_type: string | null;
    fuel_type: string | null;
    latitude: number;
    longitude: number;
  } | null;
  onClose: () => void;
  isMobile: boolean;
}

export default function PlantOverlay({ plant, onClose, isMobile }: PlantOverlayProps) {
  if (!plant) return null;

  // 발전원 분류 함수
  function getPlantCategory(plantType: string | undefined, fuelType: string | undefined, name: string) {
    const type = plantType?.toLowerCase() || '';
    const fuel = fuelType?.toLowerCase() || '';
    const plantName = name.toLowerCase();
    
    // 원자력
    if (type.includes('원자력') || fuel.includes('농축u') || fuel.includes('천연u')) {
      return '원자력';
    }
    
    // 열병합 (집단에너지)
    if (plantName.includes('열병합') || plantName.includes('집단에너지') || type.includes('집단에너지')) {
      return '열병합';
    }
    
    // 석탄
    if (fuel.includes('유연탄') || fuel.includes('무연탄') || fuel.includes('역청탄')) {
      return '석탄';
    }
    
    // LNG
    if (fuel.includes('lng')) {
      return 'LNG';
    }
    
    // 경유
    if (fuel.includes('경유')) {
      return '경유';
    }
    
    // 기타화력 (중유, 바이오중유, 유류 등)
    if (fuel.includes('중유') || fuel.includes('바이오') || fuel.includes('유류') || 
        type.includes('기력') || type.includes('내연력') || type.includes('복합')) {
      return '기타화력';
    }
    
    return '기타';
  }

  // 색상 클래스 함수
  function getPlantTypeColorClasses(category: string) {
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
  }

  const category = getPlantCategory(plant.plant_type, plant.fuel_type, plant.name);
  const colorClasses = getPlantTypeColorClasses(category);

  // 모바일에서 하단에서 올라오는 애니메이션
  useEffect(() => {
    if (isMobile) {
      const overlay = document.getElementById('plant-overlay-mobile');
      if (overlay) {
        overlay.style.transform = 'translateY(100%)';
        setTimeout(() => {
          overlay.style.transform = 'translateY(0)';
        }, 10);
      }
    }
  }, [isMobile]);

  if (isMobile) {
    return (
      <div 
        id="plant-overlay-mobile"
        className="fixed inset-0 z-[9999] flex items-end"
        onClick={onClose}
        style={{ transition: 'transform 0.3s ease-in-out' }}
      >
        <div 
          className="w-full bg-white rounded-t-lg max-h-[70vh] overflow-y-auto shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 드래그 핸들 */}
          <div className="flex justify-center py-2">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">발전소 정보</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-4 space-y-4">
            {/* 발전소 기본 정보 */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{plant.name}</h2>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${colorClasses} text-xs`}>
                  {category}
                </Badge>
                {plant.fuel_type && (
                  <span className="text-sm text-gray-600">({plant.fuel_type})</span>
                )}
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{plant.address}</span>
              </div>
              
              {plant.capacity_mw && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">용량:</span>
                  <span className="text-sm text-gray-600">{plant.capacity_mw} MW</span>
                </div>
              )}
              
              {plant.operator && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">사업자:</span>
                  <span className="text-sm text-gray-600">{plant.operator}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">상태:</span>
                <Badge variant="outline" className="text-xs">
                  {plant.status || '미정'}
                </Badge>
              </div>
            </div>

            {/* 관련 뉴스 섹션 (추후 구현) */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">관련 뉴스</h3>
              <p className="text-sm text-gray-500">뉴스 기능은 곧 추가될 예정입니다.</p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => window.open(`/powerplant/${plant.id}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                상세 정보
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 데스크톱 사이드바
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-[9999] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">발전소 정보</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-4 space-y-4">
        {/* 발전소 기본 정보 */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{plant.name}</h2>
          <div className="flex items-center gap-2 mb-3">
            <Badge className={`${colorClasses} text-xs`}>
              {category}
            </Badge>
            {plant.fuel_type && (
              <span className="text-sm text-gray-600">({plant.fuel_type})</span>
            )}
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{plant.address}</span>
          </div>
          
          {plant.capacity_mw && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">용량:</span>
              <span className="text-sm text-gray-600">{plant.capacity_mw} MW</span>
            </div>
          )}
          
          {plant.operator && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">사업자:</span>
              <span className="text-sm text-gray-600">{plant.operator}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">상태:</span>
            <Badge variant="outline" className="text-xs">
              {plant.status || '미정'}
            </Badge>
          </div>
        </div>

        {/* 관련 뉴스 섹션 (추후 구현) */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">관련 뉴스</h3>
          <p className="text-sm text-gray-500">뉴스 기능은 곧 추가될 예정입니다.</p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.open(`/powerplant/${plant.id}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            상세 정보
          </Button>
        </div>
      </div>
    </div>
  );
}
