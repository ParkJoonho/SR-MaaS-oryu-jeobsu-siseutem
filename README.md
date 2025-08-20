# SR-MaaS 통합정보시스템 오류 관리 시스템

AI 기반 시스템 오류 접수 및 관리 대시보드로, 스마트 오류 추적 및 관리자 인터페이스에 최적화된 통합 문제 해결 솔루션입니다.

## 주요 기능

### 🎤 음성 인식 오류 접수
- Google Web Speech API를 활용한 한국어 음성 인식
- 음성을 텍스트로 자동 변환하여 오류 내용 입력
- 실시간 음성 인식 및 마이크 권한 관리

### 🤖 AI 기반 자동 분석
- **Gemma-2-2B 모델** (CPU 기반) 연동으로 오류 제목 자동 생성
- 로컬 키워드 분석 + AI 결합을 통한 **시스템 자동 분류** (역무지원, 안전관리, 시설물관리)
- 키워드 기반 빠른 분석 및 Hugging Face API fallback 지원
- 텍스트 기반 오류 진단 및 분석 가이드 제공

### 📊 관리자 대시보드
- 실시간 오류 통계 및 현황 모니터링
- Chart.js 기반 시각적 데이터 분석
- 오류 상태별 관리 (신규/진행중/완료)
- 주간/월간 오류 발생 추세 분석

### 🔐 통합 인증 시스템
- Replit OpenID Connect 기반 사용자 인증
- 세션 기반 로그인 상태 관리
- 관리자 권한 기반 접근 제어

### 📱 반응형 UI/UX
- shadcn/ui 컴포넌트 기반 현대적 인터페이스
- Tailwind CSS를 활용한 반응형 디자인
- SRT 브랜딩 일관성 유지

## 기술 스택

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **shadcn/ui** + **Radix UI** (컴포넌트)
- **Tailwind CSS** (스타일링)
- **TanStack React Query** (상태 관리)
- **React Hook Form** + **Zod** (폼 관리)
- **Wouter** (라우팅)
- **Chart.js** (데이터 시각화)

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** + **Drizzle ORM** (데이터베이스)
- **Gemma-2-2B** via **Hugging Face API** (CPU 기반 AI 분석)
- **Replit OpenID Connect** (인증)
- **Multer** (파일 업로드)

### Infrastructure
- **Neon Database** (서버리스 PostgreSQL)
- **Replit Deployment** (호스팅)

## 설치 및 실행

### 환경 변수 설정
```bash
# .env 파일 생성
HUGGINGFACE_API_KEY=your_huggingface_api_key
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret

# Optional: Replit에서 자동 설정
REPL_ID=auto_configured
REPLIT_DOMAINS=auto_configured
```

### 의존성 설치
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

### 프로덕션 빌드
```bash
npm run build
```

## 프로젝트 구조

```
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── hooks/          # React 훅
│   │   └── lib/            # 유틸리티 및 설정
├── server/                 # Express 백엔드
│   ├── routes.ts           # API 라우트
│   ├── db.ts              # 데이터베이스 연결
│   ├── gemma.ts           # CPU 기반 AI 분석 로직
│   ├── storage.ts         # 데이터 저장 로직
│   └── replitAuth.ts      # 인증 미들웨어
├── shared/                 # 공유 타입 및 스키마
│   └── schema.ts          # Drizzle 스키마
└── attached_assets/        # 정적 자산
```

## 주요 페이지

- **홈 (/)**: 메인 대시보드 및 통계
- **오류 접수 (/error-submit)**: 음성 인식 기반 오류 신고
- **관리자 대시보드 (/admin-dashboard)**: 오류 관리 및 통계
- **오류 상세/편집**: 개별 오류 관리

## API 엔드포인트

### 인증
- `GET /api/auth/user` - 사용자 정보 조회
- `GET /api/login` - 로그인 시작
- `GET /api/logout` - 로그아웃

### 오류 관리
- `GET /api/errors` - 오류 목록 조회
- `POST /api/errors` - 새 오류 등록
- `PUT /api/errors/:id` - 오류 수정
- `DELETE /api/errors/:id` - 오류 삭제

### AI 분석
- `POST /api/errors/generate-title` - AI 제목 생성
- `POST /api/errors/analyze-system` - 시스템 분류 분석
- `POST /api/errors/analyze-image` - 이미지 분석

### 통계
- `GET /api/stats/errors` - 오류 통계
- `GET /api/stats/categories` - 카테고리별 통계
- `GET /api/stats/weekly` - 주간 통계

## 배포

### Replit 배포
1. Replit에서 프로젝트 열기
2. 환경 변수 설정 (Secrets 탭)
3. Deploy 버튼 클릭

### 사용자 가이드

#### 오류 접수 방법
1. "오류 접수" 버튼 클릭
2. 마이크 버튼을 눌러 음성으로 오류 내용 설명
3. 필요시 이미지 첨부
4. AI가 자동으로 제목 생성 및 시스템 분류
5. 제출 버튼으로 오류 등록 완료

#### 관리자 기능
1. 관리자 대시보드에서 전체 오류 현황 확인
2. 오류 상태 변경 (신규 → 진행중 → 완료)
3. 오류 내용 편집 및 응답 추가
4. 통계 차트로 트렌드 분석

## 라이선스

MIT License

## 개발팀

SR-MaaS 통합정보시스템 개발팀

---

**최종 업데이트**: 2025년 8월 20일
**버전**: 1.0.0