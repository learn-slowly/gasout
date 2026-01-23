const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// 환경 변수 로드
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// 분석할 기사 데이터 로드
const articles = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'articles-data.json'), 'utf8')
);

// Gemini AI 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 여러 모델 시도
const CANDIDATE_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro'
];

async function analyzeArticle(article) {
  const prompt = `다음 뉴스 기사를 분석하여 한국의 "LNG 발전소", "기후 위기", "탄소 중립"과의 관련성을 평가해주세요.

제목: ${article.title}
내용: ${article.content}

다음 형식으로 JSON 응답해주세요:
{
  "is_relevant": true/false,
  "score": 0-100 (관련성 점수),
  "summary": "한 문장 요약"
}

평가 기준:
- LNG 발전소, 가스 발전, 천연가스 관련: 높은 관련성
- 기후 위기, 탄소 중립, 온실가스, 신재생 에너지: 높은 관련성
- 에너지 전환, 전력 수급: 중간 관련성
- 기타 일반 뉴스: 낮은 관련성`;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`  시도: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSON 파싱
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          ...analysis,
          model: modelName
        };
      }
      
      throw new Error('JSON 응답을 찾을 수 없습니다');
    } catch (error) {
      console.log(`  ❌ ${modelName} 실패: ${error.message}`);
      if (CANDIDATE_MODELS.indexOf(modelName) === CANDIDATE_MODELS.length - 1) {
        throw error;
      }
    }
  }
}

async function main() {
  console.log('🤖 로컬 AI 분석 시작...\n');
  console.log(`📊 분석할 기사: ${articles.length}개\n`);
  
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`[${i + 1}/${articles.length}] 분석 중: ${article.title.substring(0, 50)}...`);
    
    try {
      const analysis = await analyzeArticle(article);
      results.push({
        id: article.id,
        ...analysis
      });
      successCount++;
      console.log(`  ✅ 성공 - 점수: ${analysis.score}, 관련성: ${analysis.is_relevant ? '관련' : '무관'}`);
      console.log(`  📝 ${analysis.summary}\n`);
      
      // API 할당량 고려 딜레이
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      failCount++;
      console.log(`  ❌ 실패: ${error.message}\n`);
      results.push({
        id: article.id,
        error: error.message
      });
    }
  }

  // 결과 저장
  const outputPath = path.join(__dirname, 'analysis-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 분석 완료!');
  console.log('='.repeat(60));
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log(`📁 결과 파일: ${outputPath}`);
  console.log('\n다음 단계: 결과를 Supabase에 업로드하세요.');
}

main().catch(console.error);
