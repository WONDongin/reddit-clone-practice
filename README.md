# Reddit Clone Practice

> 인프런 **「따라하며 배우는 노드, 리액트 시리즈 - 레딧 사이트 만들기」**를 완강하며, 주요 기능을 직접 구현하고 로컬 환경에서 검증하는 풀스택 실습 프로젝트입니다.

<BR>

## 1. 프로젝트 소개

레딧(Reddit)을 참고해 만든 커뮤니티 웹 애플리케이션입니다. Next.js 프론트엔드, Express 백엔드, PostgreSQL 데이터베이스를 분리하여 구성했습니다.

사용자 인증부터 커뮤니티·게시글·댓글·투표·무한 스크롤까지의 요청 흐름을 직접 구현하며, **클라이언트 요청이 API·인증 미들웨어·ORM·데이터베이스를 거쳐 화면에 반영되는 과정**을 학습했습니다.

> 학습 목적의 클론 코딩 프로젝트입니다. 강의 원본 자료의 라이선스와 정책은 인프런 강의 정책을 따릅니다.

<BR>

## 2. 주요 기능

| 기능 | 구현 내용 |
| --- | --- |
| 회원가입·로그인 | 입력값 검증, 비밀번호 해싱, httpOnly 쿠키 기반 JWT 인증 |
| 인증·권한 | 인증 미들웨어와 커뮤니티 생성자 권한 검증 |
| 커뮤니티 | 생성, 소개 조회, 프로필·배너 이미지 업로드 |
| 게시글·댓글 | 게시글 작성·상세 조회, 댓글 작성 및 목록 갱신 |
| 투표 | 게시글·댓글 추천·비추천·동일 투표 취소 |
| 무한 스크롤 | SWR Infinite와 Intersection Observer 기반 추가 목록 로딩 |
| 사용자 페이지 | 사용자가 작성한 게시글과 댓글 조회 |
| 안정성 | 인증 요청 제한, 보안 헤더, CORS 허용 출처 제한, 빌드 CI |

<BR>

## 3. 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | Next.js (Pages Router), React, TypeScript, SWR, Axios |
| Styling | 전역 CSS, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, TypeORM |
| Database | PostgreSQL, pgAdmin |
| 개발 환경 | Docker, GitHub Actions |
| 배포 학습 | AWS EC2, PM2, Nginx |

<BR>

## 4. 시스템 구조

```text
Browser
  ↓
Next.js / React
  ↓ HTTP Request (Cookie 포함)
Express API
  ↓
TypeORM
  ↓
PostgreSQL
```

<BR>

## 5. 데이터 모델

```text
User 1 ─ N Sub
User 1 ─ N Post
User 1 ─ N Comment
User 1 ─ N Vote

Sub 1 ─ N Post
Post 1 ─ N Comment
Post 1 ─ N Vote
Comment 1 ─ N Vote
```

<BR>

## 6. 로컬 실행 방법

### 1) PostgreSQL 실행

```bash
docker compose up -d
```

### 2) API 서버 실행

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

### 3) 프론트엔드 실행

```bash
cd client
copy .env.local.example .env.local
npm install
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

<BR>

## 7. 테스트

구현 기능은 `docs/TEST_CHECKLIST.md`를 기준으로 로컬에서 확인합니다.

- 회원가입·로그인·로그아웃
- 비로그인 보호 API 차단
- 커뮤니티 생성과 소유자 이미지 수정 권한
- 게시글·댓글 작성
- 게시글·댓글 추천·비추천·투표 취소
- 무한 스크롤의 다음 페이지 로딩·종료 처리

또한 GitHub Actions에서 `server`, `client`의 빌드를 자동 검증합니다.

<BR>

## 8. 화면 캡처

> 로컬 테스트를 완료한 뒤 아래 항목을 캡처해 추가합니다.

- 메인 게시글 목록 및 무한 스크롤
- 회원가입·로그인
- 커뮤니티 생성·이미지 업로드
- 게시글 상세·댓글·투표
- 사용자 활동 페이지

<BR>

## 9. 배포 학습

Docker 기반 PostgreSQL 실행과 AWS EC2·PM2·Nginx 배포 흐름을 **강의로 학습**했습니다.

실제 개인 AWS 계정 배포는 비용과 보안 관리 이슈를 고려해 진행하지 않았으며, `deploy/`에는 학습한 Nginx·PM2 설정 예시만 포함했습니다.

<BR>

## 10. 보완 계획

- Refresh Token 기반 인증 개선
- 게시글·댓글 수정 및 삭제
- 대댓글·커뮤니티 구독·검색
- 로컬 업로드 파일을 AWS S3로 이전
- API 통합 테스트 추가

<BR>

## 11. 참고

- [인프런 - 따라하며 배우는 노드, 리액트 시리즈: 레딧 사이트 만들기](https://www.inflearn.com/course/%EB%94%B0%EB%9D%BC%ED%95%98%EB%8A%94-%EB%A0%88%EB%94%A7)
