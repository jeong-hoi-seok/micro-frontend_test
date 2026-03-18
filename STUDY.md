# Micro Frontend 학습 가이드

## 1. 마이크로프론트엔드란?

백엔드의 MSA(Micro Service Architecture)를 프론트엔드에 적용한 개념이다.

```
[모놀리식 프론트엔드]
하나의 거대한 앱이 모든 페이지/기능을 담당
→ 빌드 느림, 배포 시 전체 영향, 팀 간 코드 충돌

[마이크로 프론트엔드]
독립적인 작은 앱 여러 개가 하나의 페이지를 구성
→ 독립 빌드/배포, 팀별 자율성, 기술 스택 자유
```

### 핵심 원칙

| 원칙 | 설명 |
|------|------|
| 독립 배포 | Header 팀이 배포해도 Banner 팀에 영향 없음 |
| 기술 스택 자유 | 앱마다 React, Vue, Svelte 등 자유롭게 선택 |
| 팀 자율성 | 각 팀이 자기 앱을 완전히 소유하고 관리 |
| 느슨한 결합 | 앱 간 직접 의존 없이 약속된 인터페이스로만 소통 |

---

## 2. 구현 방식 비교

마이크로프론트엔드를 구현하는 방법은 여러 가지가 있다.

### 2-1. iframe

```html
<iframe src="https://header-app.com"></iframe>
<iframe src="https://banner-app.com"></iframe>
```

- 가장 단순하지만 앱 간 통신이 어렵고, 스타일/레이아웃 제어가 힘듦
- 성능 오버헤드 큼 (각 iframe이 별도 브라우저 컨텍스트)

### 2-2. Web Components

```js
// header 앱이 커스텀 엘리먼트로 등록
class MfeHeader extends HTMLElement { ... }
customElements.define("mfe-header", MfeHeader);
```

```html
<!-- shell에서 사용 -->
<mfe-header></mfe-header>
```

- 브라우저 표준 기술, 프레임워크 무관
- Shadow DOM으로 스타일 격리 가능
- 복잡한 상태 관리가 어려움

### 2-3. Module Federation (이 프로젝트에서 사용)

```js
// banner 앱: "나의 Banner 컴포넌트를 외부에 공개할게"
exposes: { "./Banner": "./src/components/Banner.jsx" }

// shell 앱: "banner 앱에서 Banner 컴포넌트를 가져올게"
remotes: { banner: "banner@http://localhost:3002/remoteEntry.js" }
```

- Webpack 5 내장 기능, 별도 라이브러리 불필요
- 런타임에 JS를 가져오므로 독립 빌드/배포 가능
- 의존성 공유(shared)로 중복 로딩 방지

### 비교 요약

| | iframe | Web Components | Module Federation |
|---|---|---|---|
| 설정 난이도 | 쉬움 | 보통 | 보통 |
| 스타일 격리 | 완전 격리 | Shadow DOM | 없음 (별도 처리 필요) |
| 앱 간 통신 | 어려움 | CustomEvent | JS import로 자연스러움 |
| 의존성 공유 | 불가 | 불가 | 가능 (shared) |
| 성능 | 나쁨 | 좋음 | 좋음 |

---

## 3. Webpack Module Federation 깊이 파기

### 3-1. 핵심 개념 3가지

```
┌─────────────────────────────────────────────┐
│              Module Federation               │
│                                             │
│   1. Host (Consumer) - 가져다 쓰는 쪽       │
│   2. Remote (Provider) - 내보내는 쪽        │
│   3. Shared - 중복 방지를 위한 공유 모듈     │
└─────────────────────────────────────────────┘
```

**Host (Shell)**
```js
// "header"라는 이름으로 저 URL에서 컴포넌트를 가져온다
remotes: {
  header: "header@http://localhost:3001/remoteEntry.js"
}

// 사용할 때
const Header = await import("header/Header");
```

**Remote (Header)**
```js
// "header"라는 이름으로 이 컴포넌트를 외부에 공개한다
name: "header",
filename: "remoteEntry.js",
exposes: {
  "./Header": "./src/components/Header.vue"
}
```

**Shared**
```js
// "vue는 하나만 로드해" — 중복 방지
shared: {
  vue: { singleton: true }
}
```

### 3-2. remoteEntry.js는 뭔가?

Module Federation의 **매니페스트 파일**이다.

```
[빌드 시]
Header 앱 빌드 → remoteEntry.js 생성
  이 파일 안에는:
  - 어떤 모듈을 expose하는지 (./Header)
  - 어떤 shared 의존성이 필요한지 (vue)
  - 실제 코드 chunk의 위치

[런타임]
Shell이 remoteEntry.js를 fetch
→ "아, Header 컴포넌트는 src_components_Header_vue.js에 있구나"
→ 필요한 chunk만 추가 로딩
```

### 3-3. 비동기 경계 (Async Boundary)

이 프로젝트에서 모든 앱의 entry가 이렇게 생겼다:

```js
// index.js — 진짜 entry
import("./bootstrap");

// bootstrap.js — 실제 앱 로직
import { createApp } from "vue";
// ...
```

**왜 이렇게 하는가?**

Module Federation은 shared 모듈의 버전을 **런타임에 협상**한다.
이 협상이 끝나기 전에 `import vue`를 동기적으로 하면 에러가 난다.

```
[동기 import — 에러 발생]
index.js → import { createApp } from "vue"
              ↑ 아직 shared 협상 안 끝남! 에러!

[비동기 import — 정상 작동]
index.js → import("./bootstrap")  ← 여기서 협상 시간 확보
               ↓ 협상 완료 후
           bootstrap.js → import { createApp } from "vue"  ← 안전!
```

### 3-4. Shared 옵션 상세

```js
shared: {
  react: {
    singleton: true,      // 앱 전체에서 딱 하나만 로드
    eager: true,          // 즉시 로드 (lazy 대신)
    requiredVersion: "^18.3.1",  // 이 버전 범위만 허용
  }
}
```

| 옵션 | 설명 | 주의 |
|------|------|------|
| `singleton` | true면 버전이 달라도 하나만 로드 | React는 반드시 true (Hook 에러 방지) |
| `eager` | true면 remoteEntry.js에 바로 포함 | Remote에서는 true, Host에서는 false가 일반적 |
| `requiredVersion` | 허용할 버전 범위 | 범위 밖이면 경고 또는 별도 로드 |

---

## 4. 데이터 흐름과 앱 간 통신

마이크로프론트엔드 간 데이터를 주고받는 방법들:

### 4-1. Custom Event (추천)

```js
// Banner에서 이벤트 발생
window.dispatchEvent(new CustomEvent("banner:click", {
  detail: { id: 123 }
}));

// Header에서 이벤트 수신
window.addEventListener("banner:click", (e) => {
  console.log(e.detail.id); // 123
});
```

- 프레임워크에 무관하게 동작
- 느슨한 결합 유지

### 4-2. URL/라우터 기반

```
Shell이 URL을 관리하고, 각 Remote가 URL 변화를 감지하여 반응
/products → 상품 목록 Remote 활성화
/cart     → 장바구니 Remote 활성화
```

### 4-3. Shared State (주의 필요)

```js
// 전역 상태 객체
window.__MFE_STORE__ = { user: null, theme: "dark" };
```

- 간단하지만 결합도가 높아짐
- 꼭 필요한 최소한의 데이터만 공유할 것

---

## 5. 실무에서의 고려사항

### 5-1. 언제 마이크로프론트엔드를 쓰는가?

```
✅ 쓰면 좋은 경우
- 여러 팀이 하나의 웹앱을 개발할 때
- 레거시 앱을 점진적으로 마이그레이션할 때
- 페이지별로 기술 스택이 다를 때

❌ 쓰지 않는 게 나은 경우
- 소규모 팀 (1~3명)
- 단순한 앱
- 앱 간 상호작용이 매우 많은 경우
```

### 5-2. 성능

```
주의할 점:
- 각 Remote의 remoteEntry.js를 네트워크로 가져옴 → 초기 로딩 지연
- Shared 설정을 안 하면 React가 2번 로드될 수 있음 → 번들 크기 증가
- Remote 서버가 죽으면 해당 영역이 안 보임 → 에러 핸들링 필수

최적화:
- Shared로 공통 의존성 중복 제거
- 필요한 Remote만 lazy load
- CDN으로 remoteEntry.js 서빙
```

### 5-3. 배포 전략

```
[독립 배포 파이프라인]

Header 팀: push → CI/CD → CDN에 header/remoteEntry.js 배포
Banner 팀: push → CI/CD → CDN에 banner/remoteEntry.js 배포
Shell 팀: 아무것도 안 해도 됨 (런타임에 최신 remote를 가져오니까)
```

---

## 6. 이 프로젝트에서 배운 것 체크리스트

- [ ] Module Federation의 Host/Remote 관계를 이해했다
- [ ] remoteEntry.js가 무슨 역할인지 안다
- [ ] 비동기 경계(index.js → bootstrap.js)가 왜 필요한지 안다
- [ ] Shared singleton이 왜 중요한지 안다
- [ ] 서로 다른 프레임워크가 한 페이지에서 동작하는 원리를 안다
- [ ] 환경변수로 Mono-repo → Multi-repo 전환이 가능한 이유를 안다
- [ ] CORS 헤더가 왜 필요한지 안다
