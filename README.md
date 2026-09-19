# Reddit Clone Source

Next.js (Pages Router), Express, PostgreSQL, TypeORM으로 구성한 학습용 커뮤니티 서비스입니다.

> 인프런 레딧 클론 강의를 완강한 뒤, 학습한 기능 흐름을 바탕으로 별도로 작성한 예제 소스입니다. 강의 제공 원본 코드는 포함하지 않습니다.

## 실행 순서

```bash
# 1. PostgreSQL 실행
docker compose up -d

# 2. API 서버 실행
cd server
copy .env.example .env
npm install
npm run dev

# 3. 웹 서버 실행 (새 터미널)
cd client
copy .env.local.example .env.local
npm install
npm run dev
```

- 웹: http://localhost:3000
- API: http://localhost:4000

## 포함 기능

- 회원가입, 로그인, 로그아웃, 쿠키 기반 JWT 인증
- 커뮤니티 생성 및 조회
- 게시글 작성, 목록·상세 조회
- 댓글 작성
- 게시글·댓글 추천/비추천/투표 취소
- 페이지 기반 게시글 목록 조회

## 폴더 구조

```text
client/  Next.js 화면
server/  Express API와 TypeORM Entity
```
