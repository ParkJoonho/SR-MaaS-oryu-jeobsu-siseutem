# SR-MaaS 통합정보시스템 오류 관리 시스템

AI 기반 시스템 오류 접수 및 관리 대시보드로, 첨부파일 업로드 및 상세 오류 조회 기능을 제공하는 통합 문제 관리 솔루션입니다.

## 주요 기능

### 🤖 AI 기반 자동화
- **자동 제목 생성**: Google Gemini API를 활용하여 오류 내용 기반 제목 자동 생성
- **지능형 시스템 분류**: 오류 내용 분석을 통한 자동 시스템 카테고리 분류 (역무지원, 안전관리, 시설물관리)
- **AI 이미지 분석**: 첨부된 스크린샷 자동 분석을 통한 오류 진단 및 해결 방안 제시

### 📝 스마트 오류 접수
- 직관적인 오류 신고 폼
- 다중 파일 첨부 지원 (PNG, JPEG, GIF, WebP)
- 우선순위 설정 (긴급, 높음, 보통, 낮음)
- 브라우저 및 OS 정보 자동 수집

### 📊 관리자 대시보드
- 실시간 오류 통계 및 현황 모니터링
- 시각적 차트를 통한 데이터 분석
- 오류 목록 관리 (검색, 필터링, 페이지네이션)
- 오류 상태 추적 및 업데이트

### ✏️ 오류 편집 시스템
- 3패널 레이아웃으로 효율적인 오류 정보 관리
- 다중 이미지 뷰어 및 슬라이딩 네비게이션
- 3가지 저장 옵션: 저장, 임시저장, 보류
- AI 기반 첨부 이미지 분석 결과 표시

## 기술 스택

### Frontend
- **React 18** with TypeScript
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트 라이브러리
- **TanStack React Query** - 서버 상태 관리
- **React Hook Form** - 폼 상태 관리
- **Wouter** - 클라이언트 사이드 라우팅

### Backend
- **Node.js** with TypeScript
- **Express.js** - 웹 프레임워크
- **PostgreSQL** - 데이터베이스
- **Drizzle ORM** - 타입 안전 ORM
- **Multer** - 파일 업로드 처리

### AI & Authentication
- **Google Gemini API** - AI 기반 분석 및 생성
- **Replit Auth** - OpenID Connect 인증
- **Session-based** 인증 시스템

## 프로젝트 구조

```
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── hooks/         # 커스텀 React 훅
│   │   ├── lib/           # 유틸리티 함수
│   │   └── pages/         # 페이지 컴포넌트
├── server/                # Express 백엔드
│   ├── routes.ts          # API 라우트
│   ├── storage.ts         # 데이터 접근 레이어
│   ├── db.ts             # 데이터베이스 연결
│   ├── gemini.ts         # AI 서비스
│   └── replitAuth.ts     # 인증 시스템
├── shared/                # 공유 타입 및 스키마
│   └── schema.ts          # Drizzle 스키마 정의
└── uploads/               # 첨부파일 저장소
```

## 설치 및 실행

### 환경 변수 설정
`.env` 파일을 생성하고 다음 값들을 설정하세요:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_session_secret
PGHOST=localhost
PGPORT=5432
PGDATABASE=your_database
PGUSER=your_username
PGPASSWORD=your_password
```

### 종속성 설치
```bash
npm install
```

### 데이터베이스 마이그레이션
```bash
npm run db:push
```

### 개발 서버 실행
```bash
npm run dev
```

애플리케이션이 `http://localhost:5000`에서 실행됩니다.

## API 엔드포인트

### 오류 관리
- `POST /api/errors` - 새 오류 생성
- `GET /api/errors` - 오류 목록 조회
- `GET /api/errors/:id` - 특정 오류 조회
- `PATCH /api/errors/:id` - 오류 상태 업데이트
- `DELETE /api/errors/:id` - 오류 삭제

### AI 서비스
- `POST /api/errors/generate-title` - AI 기반 제목 생성
- `POST /api/errors/analyze-system` - 시스템 분류 분석
- `POST /api/errors/analyze-image` - 이미지 분석

### 통계 및 인증
- `GET /api/stats/errors` - 오류 통계
- `GET /api/stats/categories` - 카테고리별 통계
- `GET /api/stats/weekly` - 주간 통계
- `GET /api/auth/user` - 사용자 정보

## 주요 특징

### 사용자 경험
- **한국어 최적화**: 완전한 한국어 인터페이스
- **반응형 디자인**: 모바일 및 데스크톱 지원
- **직관적 네비게이션**: 명확한 메뉴 구조
- **실시간 피드백**: 즉각적인 상태 업데이트

### 개발자 경험
- **타입 안전성**: TypeScript 전면 적용
- **모듈화**: 재사용 가능한 컴포넌트 구조
- **에러 핸들링**: 포괄적인 오류 처리 시스템
- **개발 도구**: Hot reload 및 개발자 도구 지원

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 연락처

- 개발자: Park Joonho
- 이메일: 108.joonho.park@gmail.com
- 프로젝트 링크: [https://github.com/ParkJoonho/SR-MaaS-Erroe-Report](https://github.com/ParkJoonho/SR-MaaS-Erroe-Report)