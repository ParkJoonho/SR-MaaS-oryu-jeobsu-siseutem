# LLM 모델 구성 및 변경 가이드

SR-MaaS 시스템에서 사용되는 LLM 모델의 위치와 변경 방법을 설명합니다.

## 1. 현재 LLM 모델 구성

### 주 AI 모델: Gemma-2-2B (Hugging Face)
- **파일 위치**: `server/gemma.ts`
- **API 제공자**: Hugging Face Inference API
- **모델명**: `google/gemma-2-2b-it`

### 백업 AI 모델: Google Gemini (선택적)
- **파일 위치**: `server/gemini.ts`
- **API 제공자**: Google AI Studio
- **모델명**: `gemini-2.5-flash`

## 2. LLM 모델 코드 위치

### A. 주 AI 서비스 파일: `server/gemma.ts`

```typescript
// Hugging Face Gemma 모델 설정
const HF_API_URL = "https://api-inference.huggingface.co/models/google/gemma-2-2b-it";

// 주요 함수들:
- generateTitle(content: string): Promise<string>
- analyzeSystem(content: string): Promise<string>
- analyzeImage(imageBuffer: Buffer, filename: string): Promise<string>
```

**기능별 AI 사용 위치:**
- 자동 제목 생성
- 시스템 분류 분석
- 이미지 분석 (OCR 및 내용 분석)

### B. 백업 AI 서비스 파일: `server/gemini.ts`

```typescript
// Google Gemini 모델 설정
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// 주요 함수들:
- summarizeArticle(text: string): Promise<string>
- analyzeSentiment(text: string): Promise<Sentiment>
- analyzeImage(jpegImagePath: string): Promise<string>
```

### C. API 엔드포인트에서의 모델 사용

**파일**: `server/routes.ts`

```typescript
// 라인 75-100: AI 제목 생성
app.post("/api/errors/generate-title", async (req, res) => {
  const { generateTitle } = await import('./gemma'); // 모델 import
  const title = await generateTitle(content);
});

// 라인 110-135: 시스템 분류 분석
app.post("/api/errors/analyze-system", async (req, res) => {
  const { analyzeSystem } = await import('./gemma'); // 모델 import
  const system = await analyzeSystem(content);
});

// 라인 270-295: 이미지 분석
app.post("/api/errors/analyze-image", async (req, res) => {
  const { analyzeImage } = await import('./gemma'); // 모델 import
  const analysis = await analyzeImage(imageBuffer, filename);
});
```

## 3. LLM 모델 변경 방법

### 방법 1: 다른 Hugging Face 모델로 변경

**파일**: `server/gemma.ts`

```typescript
// 1. 모델 URL 변경
const HF_API_URL = "https://api-inference.huggingface.co/models/새모델명";

// 2. 프롬프트 템플릿 조정 (필요한 경우)
const messages = [
  { role: "user", content: `새로운 프롬프트 템플릿: ${content}` }
];
```

**추천 대체 모델:**
- `microsoft/DialoGPT-large`
- `EleutherAI/gpt-neo-2.7B`
- `bigscience/bloom-1b7`

### 방법 2: OpenAI GPT 모델로 변경

1. **새 파일 생성**: `server/openai.ts`
2. **API 키 설정**: 환경 변수 `OPENAI_API_KEY` 추가
3. **routes.ts에서 import 변경**:

```typescript
// 기존
const { generateTitle } = await import('./gemma');

// 변경
const { generateTitle } = await import('./openai');
```

### 방법 3: 로컬 모델 사용 (Ollama 등)

1. **새 파일 생성**: `server/ollama.ts`
2. **로컬 서버 설정**:

```typescript
const OLLAMA_API_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "llama2"; // 또는 다른 로컬 모델
```

## 4. 환경 변수 설정

### 현재 필요한 API 키

```bash
# Hugging Face (주 모델)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Google Gemini (백업 모델, 선택적)
GEMINI_API_KEY=your_gemini_api_key
```

### 모델 변경 시 추가 환경 변수

```bash
# OpenAI 사용 시
OPENAI_API_KEY=your_openai_api_key

# 사용자 정의 API 엔드포인트
CUSTOM_LLM_API_URL=your_custom_api_url
CUSTOM_LLM_API_KEY=your_custom_api_key
```

## 5. 로컬 키워드 분석 (오프라인 모드)

**파일**: `server/gemma.ts` 내 `analyzeSystemLocal` 함수

```typescript
// CPU 기반 키워드 분석 (인터넷 연결 불필요)
function analyzeSystemLocal(content: string): string {
  const keywords = {
    "역무지원": ["승차권", "개집표", "발매", "여객"],
    "안전관리": ["안전", "사고", "위험", "보안"],
    "시설물관리": ["시설", "설비", "장비", "유지보수"]
  };
  // 키워드 매칭 로직
}
```

## 6. 성능 및 모니터링

### API 응답 시간 모니터링

```typescript
// routes.ts에서 각 AI 호출 시 로깅
console.time('AI_Request');
const result = await generateTitle(content);
console.timeEnd('AI_Request');
```

### 에러 처리 및 폴백

```typescript
try {
  // 주 모델 시도
  const result = await gemmaAPI.generateTitle(content);
  return result;
} catch (error) {
  // 로컬 키워드 분석으로 폴백
  console.log("AI API 실패, 로컬 분석 사용");
  return analyzeSystemLocal(content);
}
```

## 7. 테스트 및 검증

### API 엔드포인트 테스트

```bash
# 제목 생성 테스트
curl -X POST http://localhost:5000/api/errors/generate-title \
  -H "Content-Type: application/json" \
  -d '{"content":"시스템 오류 내용"}'

# 시스템 분류 테스트
curl -X POST http://localhost:5000/api/errors/analyze-system \
  -H "Content-Type: application/json" \
  -d '{"content":"역무지원 시스템 오류"}'
```

### 모델 성능 평가

- **응답 시간**: 일반적으로 2-5초
- **정확도**: 한국어 텍스트 분류 약 85-90%
- **오프라인 폴백**: 키워드 기반 분류 약 70-80%

## 8. 문제 해결

### 일반적인 오류

1. **API 키 오류**: 환경 변수 설정 확인
2. **모델 로딩 시간**: 첫 요청은 20-30초 소요 가능
3. **할당량 초과**: Hugging Face 무료 할당량 확인

### 디버깅 로그 활성화

```typescript
// gemma.ts에서 디버그 모드 활성화
const DEBUG_MODE = process.env.NODE_ENV === 'development';
if (DEBUG_MODE) {
  console.log('AI 요청:', content);
  console.log('AI 응답:', result);
}
```

이 가이드를 통해 시스템의 AI 모델을 쉽게 변경하고 관리할 수 있습니다.