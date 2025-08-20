# SR-MaaS 통합정보시스템 오류 관리 시스템

AI 기반 시스템 오류 관리 및 분석 플랫폼으로, Gemma AI 모델을 활용한 지능형 문제 해결 솔루션입니다.

## 주요 기능

### 🤖 AI 기반 기능
- **자동 제목 생성**: Gemma-2-2B 모델을 활용한 오류 제목 자동 생성
- **시스템 분류**: 오류 내용 분석을 통한 자동 시스템 카테고리 분류
- **음성 인식**: 한국어 음성 입력을 통한 오류 신고 (ko-KR)
- **이미지 분석**: AI 기반 첨부 이미지 분석

### 📊 관리 대시보드
- **실시간 통계**: 오류 접수, 처리, 완료 현황 모니터링
- **차트 시각화**: 주간별 추이 및 카테고리별 분포 차트
- **오류 관리**: 인라인 편집을 통한 오류 상태 관리

### 🔐 이중 인증 시스템
- **온라인 모드**: Replit OpenID Connect 인증
- **오프라인 모드**: 로컬 사용자명/비밀번호 인증

## 설치 및 실행

### 1. 환경 설정

```bash
# 환경 변수 설정
cp .env.example .env
```

### 2. 환경 변수 구성

#### 온라인 모드 (인터넷 연결 시)
```bash
OFFLINE_MODE=false
REPLIT_DOMAINS=your-repl-domain.replit.dev
HUGGINGFACE_API_KEY=your_huggingface_api_key
SESSION_SECRET=your_session_secret
```

#### 오프라인 모드 (인터넷 미연결 시)
```bash
OFFLINE_MODE=true
SESSION_SECRET=your_session_secret
DATABASE_URL=postgresql://localhost:5432/srmaas
```

### 3. 데이터베이스 설정

```bash
# 스키마 동기화
npm run db:push
```

### 4. 애플리케이션 실행

```bash
# 개발 서버 시작
npm run dev
```

## 오프라인 인증 사용법

### 기본 관리자 계정
오프라인 모드에서는 시스템이 자동으로 기본 관리자 계정을 생성합니다:

- **사용자명**: `admin`
- **비밀번호**: `admin123!`

### 로그인 방법
1. 브라우저에서 `/auth` 경로로 접속
2. 기본 계정 정보로 로그인
3. 로그인 후 모든 기능 이용 가능

### 추가 사용자 생성
현재는 기본 관리자 계정만 제공됩니다. 추가 사용자가 필요한 경우 데이터베이스에서 직접 생성하거나 관리자 기능을 통해 추가할 수 있습니다.

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS + shadcn/ui
- TanStack React Query (상태 관리)
- Wouter (라우팅)

### Backend
- Node.js + Express
- TypeScript
- Drizzle ORM + PostgreSQL
- 이중 인증 시스템 (Replit Auth / 로컬 Auth)

### AI & 분석
- Gemma-2-2B (Hugging Face)
- 로컬 키워드 분석
- Google Web Speech API (음성 인식)

## API 엔드포인트

### 인증
- `GET /auth` - 로그인 페이지 (오프라인 모드)
- `POST /api/offline/login` - 로그인 처리 (오프라인 모드)
- `POST /api/offline/logout` - 로그아웃 (오프라인 모드)
- `GET /api/auth/user` - 현재 사용자 정보

### 오류 관리
- `POST /api/errors` - 오류 신고
- `GET /api/errors` - 오류 목록 조회
- `GET /api/errors/:id` - 특정 오류 조회
- `PATCH /api/errors/:id` - 오류 정보 수정
- `DELETE /api/errors/:id` - 오류 삭제

### AI 기능
- `POST /api/errors/generate-title` - AI 제목 생성
- `POST /api/errors/analyze-system` - 시스템 분류 분석
- `POST /api/errors/analyze-image` - 이미지 분석

### 통계
- `GET /api/stats/errors` - 오류 통계
- `GET /api/stats/weekly` - 주간별 통계
- `GET /api/stats/categories` - 카테고리별 통계

## 브라우저 지원

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## 라이센스

이 프로젝트는 내부 사용을 위한 시스템입니다.