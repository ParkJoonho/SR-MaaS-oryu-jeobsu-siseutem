# 오프라인 환경 설정 가이드

SR-MaaS 통합정보시스템을 인터넷이 연결되지 않은 환경에서 사용하는 방법입니다.

## 1. 환경 변수 설정

### Replit Secrets 설정 (권장)
Replit 환경에서는 왼쪽 사이드바의 "Secrets" 탭에서 다음 변수를 설정하세요:

```
OFFLINE_MODE = true
SESSION_SECRET = your-secure-session-secret
```

### .env 파일 설정 (로컬 환경)
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
OFFLINE_MODE=true
SESSION_SECRET=your-secure-session-secret
DATABASE_URL=postgresql://localhost:5432/srmaas
```

## 2. 시스템 실행

```bash
# 의존성 설치
npm install

# 데이터베이스 스키마 동기화
npm run db:push

# 애플리케이션 시작
npm run dev
```

## 3. 로그인 방법

### 기본 관리자 계정
시스템이 처음 실행될 때 자동으로 생성되는 기본 계정:

- **URL**: `http://localhost:5000/auth`
- **사용자명**: `admin`
- **비밀번호**: `admin123!`

### 로그인 절차
1. 웹 브라우저에서 `/auth` 경로로 접속
2. 기본 계정 정보를 입력하여 로그인
3. 로그인 성공 시 자동으로 홈페이지로 이동
4. 모든 기능 (오류 신고, 관리자 대시보드 등) 이용 가능

## 4. 기능 제한사항

### 오프라인 모드에서 제한되는 기능
- **AI 기능**: Hugging Face API 연결이 필요한 AI 기능들
  - 자동 제목 생성
  - 시스템 분류 분석
  - 이미지 분석

### 정상 작동하는 기능
- **오류 신고**: 수동 입력을 통한 오류 신고
- **음성 인식**: 브라우저 기본 음성 인식 API 사용
- **파일 첨부**: 로컬 파일 업로드 및 저장
- **관리자 대시보드**: 통계 및 오류 관리
- **오류 편집**: 인라인 편집 기능
- **데이터베이스**: 모든 CRUD 작업

## 5. 보안 고려사항

### 비밀번호 변경
보안을 위해 기본 비밀번호를 변경하는 것을 권장합니다:

```sql
-- 데이터베이스에서 직접 비밀번호 해시 업데이트
UPDATE users SET password = 'new-hashed-password' WHERE username = 'admin';
```

### 세션 보안
- `SESSION_SECRET`을 강력한 랜덤 문자열로 설정
- HTTPS 사용 시 보안 쿠키 활성화

## 6. 추가 사용자 생성

현재는 기본 관리자 계정만 제공됩니다. 추가 사용자가 필요한 경우:

### 데이터베이스 직접 추가
```sql
INSERT INTO users (id, username, password, firstName, lastName, email) 
VALUES (
  'user-id-2',
  'newuser',
  'hashed-password',
  '사용자',
  '이름',
  'user@example.com'
);
```

### 향후 개선 계획
- 웹 인터페이스를 통한 사용자 관리 기능
- 역할 기반 접근 제어 (RBAC)
- 사용자 권한 관리

## 7. 문제 해결

### 로그인이 안되는 경우
1. 기본 계정 정보 확인 (`admin` / `admin123!`)
2. 데이터베이스 연결 상태 확인
3. 세션 스토어 테이블 생성 확인

### 데이터베이스 오류
```bash
# 스키마 강제 동기화
npm run db:push -- --force
```

### 컨솔 로그 확인
서버 시작 시 다음 메시지가 표시되어야 합니다:
```
오프라인 인증 모드로 실행합니다.
기본 관리자 계정이 생성되었습니다. (admin/admin123!)
```

## 8. 온라인 모드로 복원

오프라인 모드에서 온라인 모드로 전환하려면:

```bash
# 환경 변수 변경
OFFLINE_MODE=false
REPLIT_DOMAINS=your-repl-domain.replit.dev
```

시스템이 자동으로 Replit OpenID Connect 인증으로 전환됩니다.