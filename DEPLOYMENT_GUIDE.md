# SR-MaaS 시스템 배포 가이드

## Git 버전 관리 준비

### 1. 필수 파일 체크리스트

✅ **소스 코드**
- `client/` - React 프론트엔드
- `server/` - Express 백엔드  
- `shared/` - 공통 타입 정의
- `docs/` - 문서 디렉토리

✅ **설정 파일**
- `package.json` - 의존성 및 스크립트
- `tsconfig.json` - TypeScript 설정
- `vite.config.ts` - Vite 빌드 설정
- `tailwind.config.ts` - Tailwind CSS 설정
- `drizzle.config.ts` - 데이터베이스 설정

✅ **환경 설정**
- `.env.example` - 환경 변수 템플릿
- `.gitignore` - Git 제외 파일 목록

✅ **문서**
- `README.md` - 프로젝트 개요 및 설치 가이드
- `BUILD_NOTES.md` - 빌드 정보 및 기술 세부사항
- `docs/LLM_MODEL_GUIDE.md` - LLM 모델 변경 가이드
- `docs/OFFLINE_SETUP.md` - 오프라인 환경 설정
- `package-scripts.md` - NPM 스크립트 설명

### 2. Git 초기화 및 커밋

```bash
# Git 저장소 초기화 (아직 안된 경우)
git init

# 모든 파일 추가
git add .

# 초기 커밋
git commit -m "feat: SR-MaaS 통합정보시스템 v1.0.0 완성

- 이중 인증 시스템 (온라인/오프라인)
- AI 기반 오류 관리 (Gemma-2-2B)
- 음성 인식 지원 (한국어)
- 관리자 대시보드
- 파일 업로드 및 이미지 분석
- 완전한 오프라인 모드 지원"

# 태그 생성
git tag -a v1.0.0 -m "SR-MaaS System v1.0.0 Release"
```

### 3. 원격 저장소 연결

```bash
# GitHub/GitLab 저장소 연결
git remote add origin https://github.com/username/sr-maas-system.git

# 푸시
git push -u origin main
git push origin v1.0.0
```

## 빌드 및 배포

### 1. 로컬 빌드 테스트

```bash
# 의존성 설치
npm install

# 프론트엔드 빌드
npm run build

# 데이터베이스 스키마 동기화  
npm run db:push

# 프로덕션 모드 테스트
NODE_ENV=production npm start
```

### 2. 프로덕션 환경 변수

```bash
# 필수 환경 변수
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=strong-random-session-secret

# AI 기능 (선택적)
HUGGINGFACE_API_KEY=your_huggingface_key
GEMINI_API_KEY=your_gemini_key

# 인증 모드
OFFLINE_MODE=false  # 온라인 모드
REPLIT_DOMAINS=your-domain.replit.dev

# 또는
OFFLINE_MODE=true   # 오프라인 모드
```

### 3. Docker 배포 (선택적)

**Dockerfile 예시:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# 포트 노출
EXPOSE 5000

# 애플리케이션 실행
CMD ["npm", "start"]
```

**Docker Compose 예시:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/srmaas
      - SESSION_SECRET=your-session-secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=srmaas
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 클라우드 플랫폼 배포

### 1. Replit 배포
```bash
# Replit에서 자동 배포
# Deploy 탭에서 "Deploy" 버튼 클릭
# 환경 변수를 Secrets에서 설정
```

### 2. Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
```

### 3. Heroku 배포
```bash
# Heroku CLI 로그인
heroku login

# 앱 생성
heroku create sr-maas-system

# PostgreSQL 추가
heroku addons:create heroku-postgresql:essential-0

# 환경 변수 설정
heroku config:set SESSION_SECRET=your-secret
heroku config:set HUGGINGFACE_API_KEY=your-key

# 배포
git push heroku main
```

## 성능 모니터링

### 1. 헬스 체크 설정
```bash
# 애플리케이션 상태 확인
curl http://your-domain.com/health

# 예상 응답
{
  "status": "healthy",
  "timestamp": "2025-08-20T12:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. 로그 모니터링
```bash
# 프로덕션 로그 확인
pm2 logs sr-maas

# 또는 Docker 로그
docker logs sr-maas-container
```

## 보안 체크리스트

### 1. 환경 변수 보안
- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] 프로덕션에서 강력한 `SESSION_SECRET` 사용
- [ ] API 키가 환경 변수로 관리됨

### 2. 네트워크 보안
- [ ] HTTPS 설정 (프로덕션 환경)
- [ ] CORS 정책 설정
- [ ] SQL 인젝션 방지 (Drizzle ORM 사용)

### 3. 파일 업로드 보안
- [ ] 파일 타입 제한 (이미지만)
- [ ] 파일 크기 제한 (10MB)
- [ ] 업로드 경로 제한

## 백업 및 복구

### 1. 데이터베이스 백업
```bash
# PostgreSQL 백업
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 복구
psql $DATABASE_URL < backup_20250820.sql
```

### 2. 파일 백업
```bash
# 업로드된 파일 백업
tar -czf uploads_backup.tar.gz uploads/
```

## 업데이트 및 유지보수

### 1. 의존성 업데이트
```bash
# 보안 업데이트 확인
npm audit

# 의존성 업데이트
npm update

# 취약점 수정
npm audit fix
```

### 2. 데이터베이스 마이그레이션
```bash
# 스키마 변경 후
npm run db:push

# 프로덕션에서는 백업 후 진행
```

---

**배포 체크리스트 완료 시 시스템이 프로덕션 환경에서 안정적으로 동작합니다.**