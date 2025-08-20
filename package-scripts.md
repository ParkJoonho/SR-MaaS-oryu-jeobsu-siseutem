# Package Scripts 설명

## 개발 및 빌드 스크립트

### `npm run dev`
- **목적**: 개발 서버 실행
- **동작**: Express 서버와 Vite 개발 서버를 동시에 실행
- **포트**: 5000 (프론트엔드 + 백엔드 통합)
- **환경**: NODE_ENV=development

### `npm run build`
- **목적**: 프로덕션 빌드 생성
- **동작**: 
  1. Vite를 통한 프론트엔드 빌드 (dist/public/)
  2. esbuild를 통한 백엔드 번들링 (dist/)
- **출력**: dist/ 디렉토리에 최적화된 파일 생성

### `npm run db:push`
- **목적**: 데이터베이스 스키마 동기화
- **동작**: Drizzle Kit을 통한 PostgreSQL 스키마 업데이트
- **옵션**: `--force` 플래그로 강제 동기화 가능

### `npm start`
- **목적**: 프로덕션 환경에서 애플리케이션 실행
- **전제조건**: `npm run build` 선행 필요
- **환경**: NODE_ENV=production 권장

## 데이터베이스 관리

### `npm run db:push`
```bash
# 일반 스키마 동기화
npm run db:push

# 강제 동기화 (데이터 손실 주의)
npm run db:push -- --force
```

### `npm run db:studio` (선택적)
- Drizzle Studio를 통한 데이터베이스 시각적 관리
- 브라우저에서 데이터베이스 내용 확인 및 편집

## 환경별 실행 방법

### 개발 환경
```bash
npm install
npm run db:push
npm run dev
```

### 프로덕션 환경
```bash
npm install --production
npm run build
npm run db:push
NODE_ENV=production npm start
```

### 오프라인 환경
```bash
# 환경 변수 설정
export OFFLINE_MODE=true
export SESSION_SECRET=your-secure-secret

# 애플리케이션 실행
npm run dev
# 또는
npm start
```

## 문제 해결

### 빌드 실패 시
1. Node.js 버전 확인 (20+ 권장)
2. 의존성 재설치: `rm -rf node_modules package-lock.json && npm install`
3. TypeScript 컴파일 오류 확인

### 데이터베이스 연결 실패 시
1. DATABASE_URL 환경 변수 확인
2. PostgreSQL 서버 상태 확인
3. 네트워크 연결 상태 확인

### 포트 충돌 시
- 기본 포트 5000이 사용 중인 경우 다른 포트로 변경
- `PORT` 환경 변수로 포트 지정 가능