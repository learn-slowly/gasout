// 주소-좌표 변환 유틸리티
// OpenStreetMap의 Nominatim API 사용

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: {
    si_do: string;
    si_gun_gu: string;
    eup_myeon_dong: string;
    full_address: string;
  };
  confidence: number;
}

export interface GeocodingError {
  error: string;
  message: string;
}

// 한국 주소를 좌표로 변환
export async function geocodeKoreanAddress(address: string): Promise<GeocodingResult | GeocodingError> {
  try {
    // Nominatim API 호출 (한국 주소에 최적화)
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&countrycodes=kr&format=json&limit=1&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GasOut-News-Mapping/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return {
        error: 'NO_RESULTS',
        message: '주소를 찾을 수 없습니다.'
      };
    }
    
    const result = data[0];
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    // 주소 구성 요소 추출
    const addressComponents = result.address || {};
    
    return {
      latitude: lat,
      longitude: lon,
      address: {
        si_do: extractSiDo(addressComponents),
        si_gun_gu: extractSiGunGu(addressComponents),
        eup_myeon_dong: extractEupMyeonDong(addressComponents),
        full_address: result.display_name || address
      },
      confidence: parseFloat(result.importance || '0.5')
    };
    
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      error: 'GEOCODING_FAILED',
      message: error instanceof Error ? error.message : '지오코딩 중 오류가 발생했습니다.'
    };
  }
}

// 시/도 추출
function extractSiDo(addressComponents: any): string {
  // 한국의 행정구역 체계에 맞춰 추출
  if (addressComponents.state) {
    return addressComponents.state;
  }
  if (addressComponents.province) {
    return addressComponents.province;
  }
  if (addressComponents.region) {
    return addressComponents.region;
  }
  return '';
}

// 시/군/구 추출
function extractSiGunGu(addressComponents: any): string {
  if (addressComponents.city) {
    return addressComponents.city;
  }
  if (addressComponents.county) {
    return addressComponents.county;
  }
  if (addressComponents.town) {
    return addressComponents.town;
  }
  return '';
}

// 읍/면/동 추출
function extractEupMyeonDong(addressComponents: any): string {
  if (addressComponents.suburb) {
    return addressComponents.suburb;
  }
  if (addressComponents.village) {
    return addressComponents.village;
  }
  if (addressComponents.neighbourhood) {
    return addressComponents.neighbourhood;
  }
  return '';
}

// 좌표를 주소로 변환 (역지오코딩)
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | GeocodingError> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&countrycodes=kr`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GasOut-News-Mapping/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.display_name) {
      return {
        error: 'NO_RESULTS',
        message: '해당 좌표의 주소를 찾을 수 없습니다.'
      };
    }
    
    return data.display_name;
    
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      error: 'REVERSE_GEOCODING_FAILED',
      message: error instanceof Error ? error.message : '역지오코딩 중 오류가 발생했습니다.'
    };
  }
}

// 뉴스 내용에서 위치 정보 추출 (간단한 키워드 기반)
export function extractLocationFromNewsContent(content: string, title: string): string[] {
  const locations: string[] = [];
  
  // 한국의 주요 시/도 키워드
  const siDoKeywords = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ];
  
  // 시/군/구 키워드 (주요 도시)
  const siGunGuKeywords = [
    '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
    '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
    '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
  ];
  
  const fullText = `${title} ${content}`.toLowerCase();
  
  // 시/도 검색
  siDoKeywords.forEach(keyword => {
    if (fullText.includes(keyword.toLowerCase())) {
      locations.push(keyword);
    }
  });
  
  // 시/군/구 검색
  siGunGuKeywords.forEach(keyword => {
    if (fullText.includes(keyword.toLowerCase())) {
      locations.push(keyword);
    }
  });
  
  return [...new Set(locations)]; // 중복 제거
}

// 위치 정보를 기반으로 뉴스 분류
export function classifyNewsByLocation(
  siDo: string, 
  siGunGu: string, 
  eupMyeonDong: string,
  powerPlantId?: string
): 'national' | 'regional' | 'power_plant' {
  
  // 발전소와 직접 연관된 뉴스
  if (powerPlantId) {
    return 'power_plant';
  }
  
  // 특정 지역(시/군/구)과 연관된 뉴스
  if (siGunGu && siGunGu.trim() !== '') {
    return 'regional';
  }
  
  // 전국적 이슈 (정책, 산업 전반 등)
  return 'national';
}
