import { HfInference } from '@huggingface/inference';

// Hugging Face Inference API 클라이언트 초기화
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// 오류 처리를 위한 기본값
const DEFAULT_TITLE = '시스템 오류';
const DEFAULT_CATEGORY = '시설물관리';

export async function generateTitle(content: string): Promise<string> {
  try {
    // 로컬 CPU 기반 키워드 추출 및 제목 생성
    const keywords = extractKeywords(content);
    const generatedTitle = generateTitleFromKeywords(keywords, content);
    
    if (generatedTitle && generatedTitle !== DEFAULT_TITLE) {
      return generatedTitle;
    }

    // Fallback: Hugging Face API 사용
    const prompt = `Create a concise Korean error title (max 30 characters) based on the content below. Only respond with the title.

Content: ${content.substring(0, 200)}

Title:`;

    const response = await hf.textGeneration({
      model: 'google/gemma-2-2b',
      inputs: prompt,
      parameters: {
        max_new_tokens: 30,
        temperature: 0.5,
        do_sample: true,
        return_full_text: false
      }
    });

    let title = response.generated_text?.trim() || DEFAULT_TITLE;
    
    // 텍스트 정리
    title = title.replace(/^(제목|Title):\s*/i, '');
    title = title.replace(/^\d+\.\s*/, '');
    title = title.split('\n')[0];
    title = title.trim();
    
    // 길이 제한
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    return title || DEFAULT_TITLE;
  } catch (error) {
    console.error('Error generating title:', error);
    // 키워드 기반 로컬 생성 시도
    return generateTitleFromKeywords(extractKeywords(content), content);
  }
}

export async function analyzeSystemCategory(content: string): Promise<string> {
  try {
    // 로컬 키워드 기반 분류 (우선)
    const localCategory = classifyByKeywords(content);
    if (localCategory !== DEFAULT_CATEGORY) {
      return localCategory;
    }

    // Fallback: Hugging Face API 사용
    const prompt = `Classify this Korean error content into one of three categories. Respond only with the exact category name:

Categories:
- 역무지원 (for tickets, reservations, customer service)
- 안전관리 (for security, safety, risk management)
- 시설물관리 (for buildings, facilities, infrastructure)

Content: ${content.substring(0, 150)}

Category:`;

    const response = await hf.textGeneration({
      model: 'google/gemma-2-2b',
      inputs: prompt,
      parameters: {
        max_new_tokens: 10,
        temperature: 0.2,
        do_sample: true,
        return_full_text: false
      }
    });

    let category = response.generated_text?.trim() || '';
    
    // 응답 정리
    category = category.replace(/^(Category|카테고리):\s*/i, '');
    category = category.split('\n')[0].trim();
    
    // 정확한 카테고리 매칭
    if (category.includes('역무지원')) return '역무지원';
    if (category.includes('안전관리')) return '안전관리';
    if (category.includes('시설물관리')) return '시설물관리';
    
    // Fallback to keyword classification
    return classifyByKeywords(content);
  } catch (error) {
    console.error('Error analyzing system category:', error);
    return classifyByKeywords(content);
  }
}

export async function analyzeImage(base64Image: string): Promise<string> {
  try {
    // Gemma는 텍스트 전용 모델이므로 이미지 분석 불가
    // 대신 일반적인 이미지 분석 가이드 제공
    return `
이미지 분석 결과:

📋 분석 방법:
• 이미지의 텍스트나 오류 메시지를 확인해 주세요
• 화면 캡처의 경우 오류 코드나 메시지를 텍스트로 입력해 주세요
• 시설물 사진의 경우 문제 상황을 구체적으로 설명해 주세요

💡 권장 사항:
• 오류 메시지가 있다면 정확히 복사해서 내용란에 추가 입력
• 시설물 손상 등은 위치, 손상 정도, 안전성 여부를 텍스트로 기술
• 시스템 화면 오류는 어떤 기능에서 발생했는지 명시

⚠️ 참고: 현재 텍스트 기반 AI 모델을 사용하여 이미지 직접 분석은 제한됩니다.
    `.trim();
  } catch (error) {
    console.error('Error analyzing image:', error);
    return '이미지 분석 중 오류가 발생했습니다. 이미지 내용을 텍스트로 설명해 주세요.';
  }
}

// 키워드 추출 함수
function extractKeywords(content: string): string[] {
  const keywords = [];
  const lowerContent = content.toLowerCase();
  
  // 시스템 관련 키워드
  if (lowerContent.includes('로그인') || lowerContent.includes('인증')) keywords.push('로그인');
  if (lowerContent.includes('결제') || lowerContent.includes('카드')) keywords.push('결제');
  if (lowerContent.includes('예약') || lowerContent.includes('승차권')) keywords.push('예약');
  if (lowerContent.includes('화면') || lowerContent.includes('페이지')) keywords.push('화면');
  if (lowerContent.includes('오류') || lowerContent.includes('에러')) keywords.push('오류');
  if (lowerContent.includes('접속') || lowerContent.includes('연결')) keywords.push('접속');
  if (lowerContent.includes('시설') || lowerContent.includes('건물')) keywords.push('시설');
  if (lowerContent.includes('안전') || lowerContent.includes('보안')) keywords.push('안전');
  
  return keywords;
}

// 키워드로부터 제목 생성
function generateTitleFromKeywords(keywords: string[], content: string): string {
  if (keywords.length === 0) {
    return '시스템 오류 신고';
  }
  
  const primaryKeyword = keywords[0];
  const secondaryKeyword = keywords[1];
  
  let title = primaryKeyword;
  if (secondaryKeyword) {
    title += ` ${secondaryKeyword}`;
  }
  title += ' 문제';
  
  // 특정 패턴 매칭
  if (content.includes('작동하지 않') || content.includes('안 됨')) {
    title += ' (동작 불가)';
  } else if (content.includes('느림') || content.includes('지연')) {
    title += ' (응답 지연)';
  } else if (content.includes('오류') || content.includes('에러')) {
    title += ' 발생';
  }
  
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
}

// 키워드 기반 시스템 분류
function classifyByKeywords(content: string): string {
  const lowerContent = content.toLowerCase();
  
  // 역무지원 키워드
  const ticketKeywords = ['승차권', '예약', '결제', '고객', '티켓', '발권', '환불', '변경'];
  if (ticketKeywords.some(keyword => lowerContent.includes(keyword))) {
    return '역무지원';
  }
  
  // 안전관리 키워드  
  const safetyKeywords = ['안전', '보안', '위험', '사고', '응급', '화재', '대피', '경보'];
  if (safetyKeywords.some(keyword => lowerContent.includes(keyword))) {
    return '안전관리';
  }
  
  // 시설물관리 키워드
  const facilityKeywords = ['시설', '건물', '설비', '엘리베이터', '에스컬레이터', '화장실', '조명', '공조', '전기'];
  if (facilityKeywords.some(keyword => lowerContent.includes(keyword))) {
    return '시설물관리';
  }
  
  // 기본값
  return DEFAULT_CATEGORY;
}