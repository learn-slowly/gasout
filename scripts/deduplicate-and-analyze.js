const fs = require('fs');
const path = require('path');

// 신문사 가중치
const MEDIA_WEIGHTS = {
  // 1등급 - 주요 종합일간지
  '중앙일보': 15,
  '한겨레': 15,
  '경향신문': 15,
  '한국일보': 15,
  
  // 2등급 - 경제지 및 주요 일간지
  '조선일보': 10,
  '동아일보': 10,
  '매일경제': 10,
  '한국경제': 10,
  '서울경제': 10,
  
  // 3등급 - 통신사 및 방송
  '연합뉴스': 5,
  'KBS': 5,
  'MBC': 5,
  'YTN': 5,
  '뉴시스': 5,
  
  // 4등급 - 기타
  'default': 0
};

// URL에서 신문사 추출
function extractMediaFromUrl(url) {
  const patterns = {
    '중앙일보': /joongang\.co\.kr/,
    '한겨레': /hani\.co\.kr/,
    '경향신문': /khan\.co\.kr/,
    '한국일보': /hankookilbo\.com/,
    '조선일보': /chosun\.com/,
    '동아일보': /donga\.com/,
    '매일경제': /mk\.co\.kr/,
    '한국경제': /hankyung\.com/,
    '서울경제': /sedaily\.com/,
    '연합뉴스': /yna\.co\.kr/,
    'KBS': /kbs\.co\.kr/,
    'MBC': /mbc\.co\.kr/,
    'YTN': /ytn\.co\.kr/,
    '뉴시스': /newsis\.com/,
  };
  
  for (const [media, pattern] of Object.entries(patterns)) {
    if (pattern.test(url)) {
      return media;
    }
  }
  
  return 'default';
}

// 제목에서 핵심 키워드 추출
function extractKeywords(title) {
  // HTML 엔티티 디코딩
  title = title.replace(/&[^;]+;/g, '');
  
  // 불용어 제거
  const stopwords = ['는', '은', '이', '가', '을', '를', '의', '에', '와', '과', '도', '로', '으로', '에서', '부터', '까지'];
  
  // 2글자 이상 단어만 추출
  const words = title.split(/[\s,\.\-\·\(\)\[\]]+/)
    .filter(w => w.length >= 2)
    .filter(w => !stopwords.includes(w));
  
  return words.slice(0, 5); // 상위 5개 키워드
}

// 제목 유사도 계산
function calculateSimilarity(keywords1, keywords2) {
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size; // Jaccard similarity
}

// 기사 그룹화
function groupSimilarArticles(articles, threshold = 0.4) {
  const groups = [];
  const processed = new Set();
  
  for (let i = 0; i < articles.length; i++) {
    if (processed.has(i)) continue;
    
    const group = [i];
    const keywords1 = extractKeywords(articles[i].title);
    
    for (let j = i + 1; j < articles.length; j++) {
      if (processed.has(j)) continue;
      
      const keywords2 = extractKeywords(articles[j].title);
      const similarity = calculateSimilarity(keywords1, keywords2);
      
      if (similarity >= threshold) {
        group.push(j);
        processed.add(j);
      }
    }
    
    processed.add(i);
    groups.push(group);
  }
  
  return groups;
}

// 기사 점수 계산 (기본 관련성 + 신문사 가중치)
function calculateScore(article, baseScore) {
  const media = extractMediaFromUrl(article.url);
  const weight = MEDIA_WEIGHTS[media] || MEDIA_WEIGHTS['default'];
  
  return Math.min(100, baseScore + weight);
}

// 기사 분석 (간단한 키워드 기반)
function analyzeArticle(article) {
  const title = article.title.toLowerCase();
  const content = article.content.toLowerCase();
  const text = title + ' ' + content;
  
  let score = 50; // 기본 점수
  
  // LNG 발전소 관련
  if (text.includes('lng 발전') || text.includes('가스 발전')) score += 25;
  if (text.includes('lng 발전소') || text.includes('가스 발전소')) score += 5;
  
  // 탄소중립/기후 관련
  if (text.includes('탄소중립') || text.includes('탄소 중립')) score += 15;
  if (text.includes('온실가스') || text.includes('기후위기')) score += 10;
  
  // 에너지 전환
  if (text.includes('에너지 전환') || text.includes('신재생')) score += 10;
  
  // 부정적 키워드 (관련성 낮음)
  if (text.includes('주식') && !text.includes('발전')) score -= 20;
  if (text.includes('코스피') || text.includes('상승')) score -= 15;
  
  const isRelevant = score >= 70;
  
  // 요약 생성
  let summary = '';
  if (text.includes('lng 발전소') && text.includes('탄소중립')) {
    summary = 'LNG 발전소와 탄소중립 목표 관련';
  } else if (text.includes('lng 발전')) {
    summary = 'LNG 발전 관련';
  } else if (text.includes('가스 발전')) {
    summary = '가스 발전 관련';
  } else if (text.includes('에너지 전환')) {
    summary = '에너지 전환 및 신재생에너지 관련';
  } else {
    summary = '에너지 산업 관련';
  }
  
  return { score, isRelevant, summary };
}

// 메인 처리
function main() {
  // 데이터 로드
  const dataPath = '/Users/ahbaik/.cursor/projects/Users-ahbaik-Documents-coding-gasout/agent-tools/4b15bc26-8887-4df5-ae43-ccdf31914296.txt';
  const rawData = fs.readFileSync(dataPath, 'utf8');
  
  // JSON 파싱
  const match = rawData.match(/\[.*\]/s);
  if (!match) {
    console.error('데이터 파싱 실패');
    return;
  }
  
  const articles = JSON.parse(match[0]);
  console.log(`총 ${articles.length}개 기사 로드됨\n`);
  
  // 그룹화
  console.log('중복 기사 그룹화 중...');
  const groups = groupSimilarArticles(articles);
  console.log(`${groups.length}개 그룹으로 분류됨\n`);
  
  // 각 그룹에서 최고 점수 기사 선택
  const selectedArticles = [];
  
  for (const group of groups) {
    const groupArticles = group.map(idx => {
      const article = articles[idx];
      const analysis = analyzeArticle(article);
      const media = extractMediaFromUrl(article.url);
      const finalScore = calculateScore(article, analysis.score);
      
      return {
        ...article,
        ...analysis,
        media,
        finalScore
      };
    });
    
    // 점수 순 정렬
    groupArticles.sort((a, b) => b.finalScore - a.finalScore);
    
    // 상위 1-2개 선택 (70점 이상만)
    const selected = groupArticles
      .filter(a => a.finalScore >= 70)
      .slice(0, 2);
    
    selectedArticles.push(...selected);
  }
  
  console.log(`${selectedArticles.length}개 기사 선택됨\n`);
  
  // 결과 저장
  const outputPath = path.join(__dirname, 'selected-articles.json');
  fs.writeFileSync(outputPath, JSON.stringify(selectedArticles, null, 2), 'utf8');
  
  // 통계 출력
  console.log('='.repeat(60));
  console.log('📊 선택된 기사 통계');
  console.log('='.repeat(60));
  console.log(`총 선택: ${selectedArticles.length}개`);
  console.log(`관련성 높음 (70점↑): ${selectedArticles.filter(a => a.finalScore >= 70).length}개`);
  console.log(`평균 점수: ${(selectedArticles.reduce((sum, a) => sum + a.finalScore, 0) / selectedArticles.length).toFixed(1)}점`);
  
  // 신문사별 통계
  const mediaStats = {};
  selectedArticles.forEach(a => {
    mediaStats[a.media] = (mediaStats[a.media] || 0) + 1;
  });
  
  console.log('\n신문사별 분포:');
  Object.entries(mediaStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([media, count]) => {
      console.log(`  ${media}: ${count}개`);
    });
  
  console.log(`\n결과 파일: ${outputPath}`);
}

main();
