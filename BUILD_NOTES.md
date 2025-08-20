# SR-MaaS 시스템 빌드 노트

**빌드 날짜**: 2025년 8월 20일  
**버전**: v1.0.0  
**빌드 타입**: Production Ready

## 빌드 구성

### 프론트엔드 (Vite + React)
```bash
npm run build
# 출력: dist/ 디렉토리에 최적화된 정적 파일 생성
```

### 백엔드 (Express + TypeScript)
- TypeScript 컴파일: `tsx` 런타임 사용
- 프로덕션 환경에서 `NODE_ENV=production` 설정 필요

## 주요 기능

### ✅ 완료된 기능
1. **이중 인증 시스템**
   - 온라인: Replit OpenID Connect
   - 오프라인: 로컬 사용자명/비밀번호 (admin/admin123!)

2. **AI 기반 오류 관리**
   - Gemma-2-2B 모델을 통한 자동 제목 생성
   - 시스템 분류 자동화
   - 오프라인 키워드 기반 분석 폴백

3. **음성 인식 지원**
   - 한국어(ko-KR) 음성 입력
   - 웹 브라우저 기본 Speech API 사용

4. **관리자 대시보드**
   - 실시간 통계 차트
   - 오류 상태 관리
   - 인라인 편집 기능

5. **파일 업로드 및 이미지 분석**
   - 다중 파일 업로드 지원
   - AI 이미지 분석 (OCR 포함)

### 🔧 LLM 모델 구성

**주 모델**: Gemma-2-2B (Hugging Face)
- 위치: `server/gemma.ts`
- API: Hugging Face Inference API
- 기능: 제목 생성, 시스템 분류, 이미지 분석

**백업 모델**: Google Gemini (선택적)
- 위치: `server/gemini.ts`
- API: Google AI Studio
- 사용: 고급 분석 작업 시

**오프라인 폴백**: 키워드 기반 분석
- 위치: `server/gemma.ts` 내 `analyzeSystemLocal` 함수
- 인터넷 연결 없이도 기본 분류 가능

## 환경 변수 구성

### 필수 환경 변수
```bash
DATABASE_URL=postgresql://...           # PostgreSQL 연결
SESSION_SECRET=your-session-secret      # 세션 암호화

# AI API 키 (선택적)
HUGGINGFACE_API_KEY=your-hf-key        # Gemma 모델용
GEMINI_API_KEY=your-gemini-key         # Gemini 백업용
```

### 인증 모드 선택
```bash
# 온라인 모드 (기본값)
OFFLINE_MODE=false
REPLIT_DOMAINS=your-domain.replit.dev

# 오프라인 모드
OFFLINE_MODE=true
```

## 데이터베이스 스키마

### 주요 테이블
```sql
-- 사용자 관리 (이중 인증 지원)
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  username VARCHAR UNIQUE,     -- 오프라인 모드용
  password VARCHAR,           -- 오프라인 모드용  
  email VARCHAR UNIQUE,
  firstName VARCHAR,
  lastName VARCHAR,
  profileImageUrl VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- 세션 저장소
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- 오류 관리
CREATE TABLE errors (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  system VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  reporter VARCHAR(255),
  assignee VARCHAR(255),
  attachments TEXT[],
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## 프로덕션 배포 가이드

### 1. 환경 준비
```bash
# Node.js 20+ 설치
# PostgreSQL 데이터베이스 준비
# 필요한 환경 변수 설정
```

### 2. 애플리케이션 빌드
```bash
npm install
npm run build
npm run db:push
```

### 3. 프로덕션 실행
```bash
NODE_ENV=production npm start
```

### 4. 오프라인 환경 설정 (선택적)
```bash
OFFLINE_MODE=true npm start
# 기본 관리자 계정: admin/admin123!
```

## 브라우저 호환성

### 지원 브라우저
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

### 주요 기능별 요구사항
- **음성 인식**: Chrome/Edge 권장 (Web Speech API)
- **파일 업로드**: 모든 모던 브라우저
- **차트 시각화**: Canvas 지원 브라우저

## 성능 최적화

### 프론트엔드
- Vite 번들링을 통한 코드 분할
- 이미지 최적화 및 지연 로딩
- React Query를 통한 효율적인 데이터 캐싱

### 백엔드
- Express 미들웨어 최적화
- 데이터베이스 인덱싱
- AI API 호출 최적화 및 캐싱

## 보안 고려사항

### 인증 보안
- 세션 기반 인증 with secure cookies
- CSRF 보호 (프로덕션 환경)
- 비밀번호 해싱 (bcrypt 등가)

### 파일 업로드 보안
- 파일 타입 검증
- 파일 크기 제한 (10MB)
- 업로드 경로 제한

### API 보안
- 입력 검증 및 새니타이징
- SQL 인젝션 방지 (Drizzle ORM)
- API 키 환경 변수 관리

## 모니터링 및 로깅

### 로그 레벨
- 개발: 상세 디버그 로그
- 프로덕션: 에러 및 중요 이벤트만

### 헬스 체크 엔드포인트
```bash
GET /health
# 응답: {"status": "healthy", "timestamp": "2025-08-20T..."}
```

## 문제 해결

### 일반적인 문제
1. **데이터베이스 연결 실패**: DATABASE_URL 확인
2. **AI API 오류**: API 키 및 할당량 확인  
3. **세션 오류**: SESSION_SECRET 설정 확인
4. **파일 업로드 실패**: uploads/ 디렉토리 권한 확인

### 로그 위치
- 애플리케이션 로그: 콘솔 출력
- 오류 로그: 표준 에러 출력
- AI API 로그: `server/gemma.ts` 디버그 모드

---

**빌드 담당자**: Replit AI Assistant  
**검토 완료**: 2025년 8월 20일  
**다음 검토 예정**: 기능 추가 시