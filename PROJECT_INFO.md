# SR-MaaS 통합정보시스템 프로젝트 정보

## 프로젝트 개요
- **프로젝트명**: SR-MaaS 통합정보시스템 오류 관리 시스템
- **버전**: v1.0.0 
- **빌드 날짜**: 2025년 8월 20일
- **라이선스**: MIT
- **개발팀**: SR-MaaS Development Team

## 기술 스택 요약
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Gemma-2-2B (Hugging Face) + Google Gemini (백업)
- **Authentication**: 이중 시스템 (Replit OpenID Connect / 로컬 인증)

## 주요 특징
1. **AI 기반 오류 관리**: 자동 제목 생성, 시스템 분류
2. **음성 인식**: 한국어 음성 입력 지원
3. **오프라인 지원**: 인터넷 연결 없이도 완전 동작
4. **이중 인증**: 온라인/오프라인 환경 자동 감지
5. **실시간 대시보드**: 통계 차트 및 오류 관리

## 코드 구조
```
├── client/          # React 프론트엔드 (40+ 컴포넌트)
├── server/          # Express 백엔드 (10+ 모듈)  
├── shared/          # 공통 타입 정의
├── docs/            # 프로젝트 문서
├── uploads/         # 파일 업로드 저장소
└── dist/            # 프로덕션 빌드 출력
```

## LLM 모델 구성 위치

### 주 AI 모델 (Gemma-2-2B)
- **파일**: `server/gemma.ts`
- **모델**: google/gemma-2-2b-it
- **기능**: 제목 생성, 시스템 분류, 이미지 분석

### 백업 AI 모델 (Google Gemini)  
- **파일**: `server/gemini.ts`
- **모델**: gemini-2.5-flash
- **기능**: 고급 분석 작업

### 로컬 폴백 시스템
- **파일**: `server/gemma.ts` 내 `analyzeSystemLocal` 함수
- **기능**: 키워드 기반 오프라인 분류

### API 엔드포인트에서의 모델 사용
- **파일**: `server/routes.ts`
- **라인 75-100**: AI 제목 생성 (`/api/errors/generate-title`)
- **라인 110-135**: 시스템 분류 (`/api/errors/analyze-system`)  
- **라인 270-295**: 이미지 분석 (`/api/errors/analyze-image`)

## 환경 설정

### 온라인 모드 (기본값)
```bash
OFFLINE_MODE=false
REPLIT_DOMAINS=your-domain.replit.dev
HUGGINGFACE_API_KEY=your_api_key
SESSION_SECRET=your_session_secret
```

### 오프라인 모드
```bash  
OFFLINE_MODE=true
SESSION_SECRET=your_session_secret
DATABASE_URL=postgresql://localhost:5432/srmaas
```

## 기본 계정 정보 (오프라인 모드)
- **사용자명**: admin
- **비밀번호**: admin123!
- **접속 URL**: /auth

## 빌드 명령어
```bash
npm install              # 의존성 설치
npm run build           # 프론트엔드 빌드
npm run db:push         # 데이터베이스 스키마 동기화
npm run dev             # 개발 서버 실행
npm start               # 프로덕션 서버 실행
```

## Git 저장소 준비 상태
✅ 소스 코드 완성 (300+ 파일)
✅ 문서 작성 완료
✅ .gitignore 설정
✅ 빌드 스크립트 준비
✅ 환경 설정 템플릿
✅ 배포 가이드 작성

## 브라우저 지원
- Chrome/Edge 88+
- Firefox 85+  
- Safari 14+

## API 엔드포인트
- 인증: `/api/auth/*`, `/auth`
- 오류 관리: `/api/errors/*`
- AI 기능: `/api/errors/generate-title`, `/api/errors/analyze-*`
- 통계: `/api/stats/*`

이 프로젝트는 Git 버전 관리 및 프로덕션 배포 준비가 완료된 상태입니다.