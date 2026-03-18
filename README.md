# Micro Frontend Test

Webpack 5 Module Federation을 활용한 마이크로프론트엔드 아키텍처 학습 프로젝트.

## 구조

```
shell/    → Host 앱 (vanilla JS)       :3000
header/   → Vue 3 헤더 컴포넌트         :3001
banner/   → React 배너 컴포넌트         :3002
```

## 실행

```bash
# 의존성 설치
npm run install:all

# 3개 앱 동시 실행
npm start
```

- http://localhost:3000 — Shell (Vue 헤더 + React 배너 통합)
- http://localhost:3001 — Header 단독
- http://localhost:3002 — Banner 단독

## Multi-repo 전환

`shell/.env`에서 URL만 변경하면 외부 배포된 앱을 가져올 수 있음.

```env
HEADER_URL=https://cdn.example.com/header
BANNER_URL=https://cdn.example.com/banner
```
