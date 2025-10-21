// 뉴스 위치 처리 및 분류 시스템
import { createClient } from '@supabase/supabase-js';
import { geocodeKoreanAddress, extractLocationFromNewsContent, classifyNewsByLocation } from './geocoding';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface NewsLocationData {
  id: string;
  title: string;
  content: string;
  si_do?: string;
  si_gun_gu?: string;
  eup_myeon_dong?: string;
  latitude?: number;
  longitude?: number;
  location_type: 'national' | 'regional' | 'power_plant';
  power_plant_id?: string;
  confidence: number;
}

// 뉴스에서 위치 정보 추출 및 분류
export async function processNewsLocation(articleId: string): Promise<NewsLocationData | null> {
  try {
    // 뉴스 데이터 가져오기
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();
    
    if (error || !article) {
      console.error('Error fetching article:', error);
      return null;
    }
    
    // 이미 위치 정보가 있는 경우
    if (article.latitude && article.longitude) {
      return {
        id: article.id,
        title: article.title,
        content: article.content || '',
        si_do: article.si_do,
        si_gun_gu: article.si_gun_gu,
        eup_myeon_dong: article.eup_myeon_dong,
        latitude: article.latitude,
        longitude: article.longitude,
        location_type: article.location_type || 'national',
        power_plant_id: article.power_plant_id,
        confidence: 1.0
      };
    }
    
    // 뉴스 내용에서 위치 키워드 추출
    const extractedLocations = extractLocationFromNewsContent(
      article.content || '', 
      article.title
    );
    
    if (extractedLocations.length === 0) {
      // 위치 정보를 찾을 수 없는 경우 전국 뉴스로 분류
      await updateArticleLocation(articleId, {
        location_type: 'national',
        confidence: 0.1
      });
      
      return {
        id: article.id,
        title: article.title,
        content: article.content || '',
        location_type: 'national',
        confidence: 0.1
      };
    }
    
    // 가장 관련성 높은 위치로 지오코딩 시도
    let bestLocation: any = null;
    let bestConfidence = 0;
    
    for (const location of extractedLocations) {
      const geocodingResult = await geocodeKoreanAddress(location);
      
      if ('latitude' in geocodingResult) {
        if (geocodingResult.confidence > bestConfidence) {
          bestLocation = geocodingResult;
          bestConfidence = geocodingResult.confidence;
        }
      }
    }
    
    if (bestLocation) {
      // 발전소와의 연관성 확인
      const powerPlantId = await findRelatedPowerPlant(
        bestLocation.latitude, 
        bestLocation.longitude
      );
      
      const locationType = classifyNewsByLocation(
        bestLocation.address.si_do,
        bestLocation.address.si_gun_gu,
        bestLocation.address.eup_myeon_dong,
        powerPlantId
      );
      
      // 데이터베이스 업데이트
      await updateArticleLocation(articleId, {
        si_do: bestLocation.address.si_do,
        si_gun_gu: bestLocation.address.si_gun_gu,
        eup_myeon_dong: bestLocation.address.eup_myeon_dong,
        latitude: bestLocation.latitude,
        longitude: bestLocation.longitude,
        location_type: locationType,
        power_plant_id: powerPlantId,
        confidence: bestConfidence
      });
      
      return {
        id: article.id,
        title: article.title,
        content: article.content || '',
        si_do: bestLocation.address.si_do,
        si_gun_gu: bestLocation.address.si_gun_gu,
        eup_myeon_dong: bestLocation.address.eup_myeon_dong,
        latitude: bestLocation.latitude,
        longitude: bestLocation.longitude,
        location_type: locationType,
        power_plant_id: powerPlantId,
        confidence: bestConfidence
      };
    }
    
    // 지오코딩 실패 시 전국 뉴스로 분류
    await updateArticleLocation(articleId, {
      location_type: 'national',
      confidence: 0.1
    });
    
    return {
      id: article.id,
      title: article.title,
      content: article.content || '',
      location_type: 'national',
      confidence: 0.1
    };
    
  } catch (error) {
    console.error('Error processing news location:', error);
    return null;
  }
}

// 뉴스 위치 정보 업데이트
async function updateArticleLocation(articleId: string, locationData: any) {
  try {
    const { error } = await supabase
      .from('articles')
      .update(locationData)
      .eq('id', articleId);
    
    if (error) {
      console.error('Error updating article location:', error);
    }
  } catch (error) {
    console.error('Error updating article location:', error);
  }
}

// 좌표 근처의 발전소 찾기 (반경 10km)
async function findRelatedPowerPlant(latitude: number, longitude: number): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('power_plants')
      .select('id, name, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    
    if (error || !data) {
      return null;
    }
    
    // 가장 가까운 발전소 찾기 (간단한 거리 계산)
    let closestPlant = null;
    let minDistance = Infinity;
    
    for (const plant of data) {
      const distance = calculateDistance(
        latitude, longitude,
        Number(plant.latitude), Number(plant.longitude)
      );
      
      // 10km 이내의 발전소만 고려
      if (distance <= 10 && distance < minDistance) {
        minDistance = distance;
        closestPlant = plant;
      }
    }
    
    return closestPlant?.id || null;
    
  } catch (error) {
    console.error('Error finding related power plant:', error);
    return null;
  }
}

// 두 좌표 간의 거리 계산 (km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 위치별 뉴스 조회
export async function getNewsByLocation(
  locationType: 'national' | 'regional' | 'power_plant',
  powerPlantId?: string,
  limit: number = 10
) {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'approved')
      .eq('location_type', locationType)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (powerPlantId) {
      query = query.eq('power_plant_id', powerPlantId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching news by location:', error);
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error('Error fetching news by location:', error);
    return [];
  }
}

// 좌표 기반 뉴스 조회 (반경 내)
export async function getNewsByCoordinates(
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  limit: number = 10
) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'approved')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('published_at', { ascending: false });
    
    if (error || !data) {
      return [];
    }
    
    // 반경 내 뉴스 필터링
    const nearbyNews = data.filter(article => {
      const distance = calculateDistance(
        latitude, longitude,
        Number(article.latitude), Number(article.longitude)
      );
      return distance <= radiusKm;
    });
    
    return nearbyNews.slice(0, limit);
    
  } catch (error) {
    console.error('Error fetching news by coordinates:', error);
    return [];
  }
}
