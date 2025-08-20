# SR-MaaS 시스템 버전 히스토리

## v1.0.0 (2025-08-20) - 초기 릴리즈

### 🎯 주요 기능
- **이중 인증 시스템**: 온라인(Replit Auth) + 오프라인(로컬 Auth) 지원
- **AI 기반 오류 관리**: Gemma-2-2B 모델을 활용한 지능형 분석
- **음성 인식**: 한국어 음성 입력을 통한 오류 신고
- **관리자 대시보드**: 실시간 통계 및 오류 상태 관리
- **완전한 오프라인 지원**: 인터넷 연결 없이도 모든 핵심 기능 동작

### 🤖 AI 모델 구성
- **주 모델**: Gemma-2-2B (Hugging Face API)
  - 자동 제목 생성
  - 시스템 분류 분석
  - 이미지 분석 (OCR 포함)
- **백업 모델**: Google Gemini 2.5-flash
- **오프라인 폴백**: 키워드 기반 로컬 분석

### 🔐 인증 시스템
- **온라인 모드**: Replit OpenID Connect 통합
- **오프라인 모드**: 로컬 사용자명/비밀번호 인증
- **자동 감지**: 환경에 따른 인증 모드 자동 전환
- **기본 계정**: admin/admin123! (오프라인 모드)

### 📊 대시보드 기능
- 오류 접수/처리/완료 통계
- 주간별 추이 차트
- 시스템별 분포 차트
- 인라인 편집 지원

### 🎤 음성 인식
- 한국어(ko-KR) 음성 인식
- 브라우저 기본 Speech API 활용
- 음성 입력 후 자동 시스템 분류

### 📁 파일 관리
- 다중 이미지 업로드 (최대 10MB)
- AI 기반 이미지 분석
- 안전한 파일 저장

### 🏗️ 기술 스택
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **State Management**: TanStack React Query
- **UI Components**: shadcn/ui + Radix UI
- **Charts**: Chart.js + Recharts

### 📦 빌드 정보
- **프론트엔드 빌드**: Vite (dist/public/)
- **백엔드 번들**: esbuild (dist/)
- **총 파일 수**: 300+ TypeScript/JavaScript 파일
- **빌드 크기**: ~700KB (압축 후)

### 🌐 브라우저 지원
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- 모든 모던 브라우저에서 완전 동작

### 📋 API 엔드포인트
- **인증**: `/auth`, `/api/auth/*`, `/api/offline/*`
- **오류 관리**: `/api/errors/*`
- **AI 기능**: `/api/errors/generate-title`, `/api/errors/analyze-*`
- **통계**: `/api/stats/*`
- **파일**: `/api/upload`, `/uploads/*`

### 🔧 환경 설정
- 환경 변수 기반 설정
- .env.example 템플릿 제공
- 온라인/오프라인 모드 지원

### 📚 문서
- README.md: 프로젝트 개요 및 설치 가이드
- BUILD_NOTES.md: 빌드 정보 및 기술 세부사항
- LLM_MODEL_GUIDE.md: AI 모델 변경 가이드
- OFFLINE_SETUP.md: 오프라인 환경 설정
- DEPLOYMENT_GUIDE.md: 배포 가이드

### 🚀 배포 준비
- Git 버전 관리 준비 완료
- .gitignore 설정
- 프로덕션 빌드 검증
- Docker 배포 가이드 포함
- 클라우드 플랫폼 배포 지원

---

### 향후 계획
- [ ] 사용자 권한 관리 강화
- [ ] API 문서 자동 생성
- [ ] 성능 모니터링 대시보드
- [ ] 다국어 지원 확장
- [ ] 모바일 반응형 개선