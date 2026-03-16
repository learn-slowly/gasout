// 한국 시/도 목록 및 지도 중심 좌표
export const KOREAN_REGIONS: Record<string, { label: string; center: [number, number]; zoom: number }> = {
  '서울': { label: '서울특별시', center: [37.5665, 126.9780], zoom: 11 },
  '부산': { label: '부산광역시', center: [35.1796, 129.0756], zoom: 11 },
  '대구': { label: '대구광역시', center: [35.8714, 128.6014], zoom: 11 },
  '인천': { label: '인천광역시', center: [37.4563, 126.7052], zoom: 11 },
  '광주': { label: '광주광역시', center: [35.1595, 126.8526], zoom: 11 },
  '대전': { label: '대전광역시', center: [36.3504, 127.3845], zoom: 11 },
  '울산': { label: '울산광역시', center: [35.5384, 129.3114], zoom: 11 },
  '세종': { label: '세종특별자치시', center: [36.4800, 127.0000], zoom: 11 },
  '경기': { label: '경기도', center: [37.4138, 127.5183], zoom: 9 },
  '강원': { label: '강원특별자치도', center: [37.8228, 128.1555], zoom: 9 },
  '충북': { label: '충청북도', center: [36.6357, 127.4917], zoom: 9 },
  '충남': { label: '충청남도', center: [36.5184, 126.8000], zoom: 9 },
  '전북': { label: '전북특별자치도', center: [35.7175, 127.1530], zoom: 9 },
  '전남': { label: '전라남도', center: [34.8679, 126.9910], zoom: 9 },
  '경북': { label: '경상북도', center: [36.4919, 128.8889], zoom: 9 },
  '경남': { label: '경상남도', center: [35.4606, 128.2132], zoom: 9 },
  '제주': { label: '제주특별자치도', center: [33.4996, 126.5312], zoom: 10 },
};

/**
 * location 문자열에서 시/도 지역 키를 추출합니다.
 */
export function extractRegion(location?: string): string | null {
  if (!location) return null;
  const loc = location.trim();

  const patterns: [RegExp, string][] = [
    [/^서울/, '서울'], [/^부산/, '부산'], [/^대구/, '대구'], [/^인천/, '인천'],
    [/^광주(?!군)/, '광주'], [/^대전/, '대전'], [/^울산/, '울산'], [/^세종/, '세종'],
    [/^경기/, '경기'], [/^강원/, '강원'], [/^충청?북/, '충북'], [/^충청?남/, '충남'],
    [/^전라?북|^전북/, '전북'], [/^전라?남|^전남/, '전남'],
    [/^경상?북|^경북/, '경북'], [/^경상?남|^경남/, '경남'], [/^제주/, '제주'],
  ];

  for (const [regex, key] of patterns) {
    if (regex.test(loc)) return key;
  }
  return null;
}
