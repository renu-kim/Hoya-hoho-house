# 호야네 · 호호네 숙소 안내 사이트 — GitHub 배포용

하나의 정적 웹사이트에서 숙소별 진입 링크를 제공합니다. HTML / CSS / JavaScript만 사용하며, 별도 서버·DB·패키지 설치·빌드가 필요 없습니다.

**현재 상태: 기능 구현 초안. 실제 주소, 업무용 연락처, 입퇴실 시간, 숙소 사진과 관광지 정보는 미입력입니다.**

## 확정 범위

이 프로젝트는 **숙박객 안내 전용**입니다. 예약 시스템, 예약 조회, 예약 달력, 결제, 회원가입, 예약 플랫폼 연동은 개발 범위에 포함하지 않습니다. FAQ에서 예약 플랫폼으로 문의하도록 안내하는 문구는 예약 처리 기능이 아닙니다.

대상 저장소: `renu-kim/Hoya-hoho-house`

GitHub Pages 기본 주소: `https://renu-kim.github.io/Hoya-hoho-house/`

위 주소에 맞춘 공유 URL, canonical/OG 메타데이터와 404 복귀 주소를 반영했습니다. 게시 소스는 `main` 브랜치의 루트(`/`)입니다. 배포 상태는 저장소의 Actions 및 Settings → Pages에서 확인하고, 설정 절차는 `START-HERE.md`를 참고하세요.

## 1. 바로 열어 보기

압축을 해제한 뒤 `index.html`을 Chrome 또는 Edge에서 열면 숙소 선택 화면이 나옵니다.

- `hoya/index.html`: 호야네 안내
- `hoho/index.html`: 호호네 안내

파일을 직접 여는 방식에서도 외부 라이브러리나 네트워크 요청 없이 기본 화면이 작동하도록 구성했습니다. 운영 링크 공유와 자동 클립보드 기능은 HTTPS 배포 후 브라우저 지원에 따라 작동하며, 자동 복사 실패 시 수동 복사 창을 제공합니다.

별도로 제공한 `hoya-hoho-preview.html`은 디자인과 기능을 빠르게 확인하는 한 파일 미리보기입니다. **이 미리보기 파일을 운영용 index.html 대신 업로드하지 마세요.** 운영 배포에는 이 폴더의 파일들을 사용합니다.

## 2. 운영정보 수정

수정할 기본 파일은 **`assets/js/stay-data.js`** 입니다. `stays.hoya`, `stays.hoho`를 각각 수정합니다. 양쪽 데이터는 분리되어 있어 한 숙소의 연락처나 주차정보가 다른 숙소에 자동 복사되지 않습니다.

빈 문자열 `""`은 미확인 상태입니다. 임의 주소·전화번호·입퇴실 시간이나 관광지를 넣지 않았습니다. 전화번호와 지도 링크가 비어 있으면 해당 실행 버튼은 비활성화됩니다.

주요 필드:

| 필드 | 입력 내용 |
|---|---|
| `address.road`, `address.detail` | 실제 도로명주소와 상세 위치 |
| `address.naverUrl`, `address.kakaoUrl` | 지도 서비스에서 확인한 HTTPS 공유 링크 |
| `address.directions` | 진입로, 간판, 마지막 갈림길 등 실측한 안내 |
| `contact.phone`, `contact.hours` | 공개에 동의한 업무용 연락처와 문의 가능 시간 |
| `checkIn`, `checkOut` | 실제 입퇴실 시간·방법·퇴실 정리사항 |
| `parking` | 지정 주차대수·위치·사진·확인된 대체 주차장 |
| `spaces`, `facilities`, `rules` | 실제 제공 시설과 승인된 이용수칙 |
| `wifi.ssid` | 공개해도 되는 Wi-Fi 이름만 입력, 비밀번호는 금지 |
| `heroImage`, `gallery` | 사용권이 있는 실제 숙소 사진의 로컬 경로 |
| `nearby` | 위치를 검증한 관광지·맛집·카페·편의시설 |
| `emergency` | 소화기·대피 경로·구급함 위치 |
| `updatedAt` | 실제 내용을 최종 확인한 날짜 `YYYY-MM-DD` |
| `ready` | 내용을 검수한 후 `true`로 변경, 기본값은 `false` |

`notice`에는 실제로 전달할 공지를 작성하거나 빈 문자열을 넣으세요. 초안용 문장을 남긴 채 `ready`만 바꾸지 마세요. 미제공 시설은 해당 항목을 삭제하거나 `body`에 “제공하지 않습니다”라고 명확히 적습니다.

두 숙소의 주소가 확인되기 전에는 동일 이름의 숙소를 검색해 사진·주소를 가져오지 마세요. 주변 장소의 이동시간·영업시간도 임의로 쓰지 않습니다.

세부 입력표: `docs/CONTENT-CHECKLIST.md`

## 3. 사진 등록

사진을 각 폴더에 저장하고 설정 파일에 경로를 입력합니다.

```text
assets/images/hoya/hero.webp
assets/images/hoya/room.webp
assets/images/hoya/parking.webp
assets/images/hoho/hero.webp
assets/images/hoho/room.webp
```

```javascript
heroImage: "assets/images/hoya/hero.webp",
heroAlt: "호야네 실제 숙소 전경",
gallery: [
  {
    src: "assets/images/hoya/room.webp",
    alt: "호야네 거실 전체 모습",
    caption: "거실"
  }
],
```

권장 제작 기준: 대표 사진 가로 1,600~2,000픽셀, WebP/JPEG, 사진당 약 500KB 이하를 목표로 압축합니다. 파일명은 영문 소문자·숫자·하이픈을 권합니다. 원본 사진의 불필요한 EXIF 위치정보, 얼굴·차량번호, 출입 비밀번호가 촬영되지 않았는지 확인하세요.

기본 `cover.svg`와 `og.png`는 이 초안을 위해 만든 브랜드 일러스트입니다. **실제 숙소 사진이 아님을 화면에 표시**합니다. 지도 영역의 격자 배경도 실제 지도나 경로가 아닙니다.

## 4. 숙소별 링크 규칙

기본 도메인을 사용할 때의 배포 예정 주소:

```text
https://renu-kim.github.io/Hoya-hoho-house/          # 숙소 선택
https://renu-kim.github.io/Hoya-hoho-house/hoya/     # 호야네
https://renu-kim.github.io/Hoya-hoho-house/hoho/     # 호호네
```

커스텀 도메인에서도 같은 파일을 사용합니다. 리포지터리 이름을 코드에 하드코딩하지 않았습니다.

- 직접 링크 `/hoya/`나 `/hoho/`가 항상 최우선입니다.
- 다른 숙소를 최근에 보았더라도 직접 진입한 숙소를 바꾸지 않습니다.
- 기본 화면은 자동 이동하지 않고 “최근에 본 숙소” 표시만 합니다.
- 루트 `?stay=hoya`, `?stay=hoho`는 숙소별 정규 경로로 연결합니다.
- 알 수 없는 숙소 쿼리는 임의의 숙소 대신 선택 화면과 오류 안내를 보여줍니다.
- `hoya/#parking`처럼 특정 안내 영역으로 직접 연결할 수 있습니다.
- 로컬 `file://` 미리보기에서는 `/hoya/index.html` 형태의 링크를 사용합니다.

## 5. GitHub Pages 게시

### 먼저: 호스팅 정책과 공개 범위

GitHub Pages 공식 정책은 온라인 사업·전자상거래 또는 상거래를 주목적으로 하는 무료 호스팅 이용 등을 제한합니다. 이 버전은 예약·결제·고객정보 입력 없이 숙소 이용 안내만 제공하지만, **안내 전용이라는 이유만으로 영업용 사용이 반드시 허용된다고 단정할 수 없습니다. 실운영 전 정책 적합성을 확인하세요.** 소스는 다른 정적 호스팅으로도 옮길 수 있습니다.

공식 정책: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

GitHub Free의 Pages는 공개 저장소에서 사용할 수 있으며, 비공개 저장소 이용 조건은 요금제에 따라 다릅니다. Pages 사이트와 게시 폴더 내 파일은 공개될 수 있습니다. 비공개 저장소나 검색 제외 설정을 방문자 인증으로 생각하면 안 됩니다.

### 게시 순서

1. GitHub에서 사용할 저장소를 생성하거나 기존 저장소를 지정합니다. 이 패키지의 대상은 `renu-kim/Hoya-hoho-house`입니다. 이 프로젝트를 기존 앱 저장소에 무작정 덮어쓰지 마세요.
2. **압축을 해제한 배포 폴더 안의 파일과 폴더를 저장소 루트에 업로드**합니다. 최상단에 `index.html`, `hoya/`, `hoho/`, `assets/`, `.nojekyll`이 있어야 합니다.
3. `Settings → Pages → Build and deployment`에서 Source를 **Deploy from a branch**로 설정합니다.
4. Branch는 파일을 올린 `main`, 폴더는 **/(root)** 를 선택하고 저장합니다. 브랜치 이름이 다르면 실제 브랜치를 선택합니다.
5. 배포가 끝나면 Pages의 **Visit site**를 열고 양쪽 숙소 경로·새로고침·스마트폰 동작을 확인합니다. GitHub 안내상 변경 반영에 최대 약 10분이 걸릴 수 있습니다.
6. 초안 문구와 미입력 항목을 모두 검수하기 전에는 숙박객에게 링크를 발송하지 마세요.

운영정보 변경은 `stay-data.js` 수정 후 저장소에 커밋합니다. 브랜치 기반 게시에서는 게시 소스의 변경이 사이트에 반영됩니다. 이 프로젝트에는 별도 사용자 정의 GitHub Actions 워크플로를 요구하지 않습니다.

공식 설정 가이드: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

공식 생성 가이드: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

### git을 사용하는 경우

새로 만든 로컬 폴더와 비어 있는 대상 저장소라는 전제의 예시입니다. 기존 저장소에서는 먼저 원격 이력을 확인하고 정상적인 브랜치 작업을 하세요. 강제 푸시는 하지 않습니다.

```bash
git init
git add .
git commit -m "Add Hoya and Hoho guest guide"
git branch -M main
git remote add origin https://github.com/renu-kim/Hoya-hoho-house.git
git push -u origin main
```

## 6. 공유 제목·이미지

각 숙소의 `index.html`에 숙소별 `title`·설명·Open Graph 제목을 넣었습니다. 이 패키지는 배포 예정 주소를 정적 HTML에 반영했습니다. **실제 배포 주소가 달라지면 설정과 정적 HTML을 함께 갱신**해야 합니다. 클라이언트 JavaScript만으로 바꾸는 방식에 의존하지 않습니다.

설정 파일 `site.publicBaseUrl`에 실제 URL을 넣고 아래 선택 도구를 실행합니다. Node.js가 설치된 개발환경에서만 필요하며 웹서버에서 Node.js를 실행하는 것이 아닙니다.

```bash
node tools/prepare-meta.cjs --url https://renu-kim.github.io/Hoya-hoho-house/
```

이 명령은 각 페이지의 canonical/OG URL·공유 이미지 URL 및 404의 홈 링크를 갱신합니다. 기본 공유 이미지는 `assets/images/hoya/og.png`, `assets/images/hoho/og.png`입니다. 실제 공유 결과는 카카오톡 등 서비스의 캐시 때문에 다를 수 있어 배포 후 확인해야 합니다.

`noindex, nofollow`는 기본 유지합니다. 숙박객 안내서라는 목적상 검색 노출을 적극 유도하지 않는 설계입니다. **noindex는 접근 제어나 비밀번호가 아닙니다.** 완성 후 검색 공개가 필요하면 해당 메타태그를 별도로 바꾸세요.

## 7. 검수 도구

선택 사항이며 운영에는 필요하지 않습니다.

```bash
node tools/validate.cjs
node tools/validate.cjs --production
```

첫 번째는 파일·설정 구조를 검사합니다. 두 번째는 연락처·주소·운영정보·사진·주변 장소 등 실운영 필수 입력도 검사하므로 **현재의 빈 초안에서는 실패하는 것이 정상**입니다. 이 도구가 내용의 사실관계나 사진 권리까지 검증하지는 않습니다.

`docs/TEST-REPORT.md`에 실제 수행한 테스트와 미검증 범위를 기록했습니다. 브라우저 테스트 소스는 `tools/test_browser.py`입니다. Python 및 Playwright가 있는 개발환경에서 실행할 수 있습니다. 사이트 사용·배포에는 테스트 도구 설치가 필요하지 않습니다.

## 8. 구현 기능과 범위

- 숙소별 직접 진입, 숙소 전환, 최근 숙소 표시
- 320픽셀부터 데스크톱까지 반응형 화면, 하단 실행 버튼
- 목차 이동·현재 영역 강조, 전체 안내 검색
- 조건부 지도 링크, 주소 복사, 전화·문자 링크, 네이티브 공유 및 복사 대체
- 시설·FAQ 펼치기, FAQ 검색, 주변 장소 분류 필터
- 실제 사진 등록 시 확대 갤러리, 키보드 좌우·Escape·포커스 복귀
- 숙소별 퇴실 체크, 현재 탭의 세션 저장, 초기화
- 인쇄 시 접힌 안내 펼치기, 인쇄 후 이전 상태 복원
- 기본 정보 미입력 시 명시적 안내와 실행 버튼 비활성화
- 추적용 외부 라이브러리, 웹폰트, 지도 SDK, API 키, 서버, 서비스워커 없음

예약관리·예약 조회·결제·숙박객 인증·도어락 번호 조회·실시간 관광정보·지도 임베드는 구현하지 않았습니다. 지도는 **입력한 공식 공유 링크를 외부 서비스에서 여는 방식**입니다. 주변 정보와 운영 공지는 운영자가 갱신합니다.

## 9. 보안·개인정보

이 저장소와 정적 파일에는 도어락/키박스/Wi-Fi 비밀번호, 예약자 이름·전화번호·일정, 관리자 계정, API 토큰, NAS 내부 주소를 넣지 마세요. 감춘 HTML, JavaScript 난독화, 길고 복잡한 URL도 보안 장치가 아닙니다.

마지막 숙소는 localStorage, 퇴실 체크는 숙소별 sessionStorage에만 저장하며 앱 코드에서 서버로 전송하지 않습니다. 브라우저 저장이 차단되면 저장 없이 기본 기능을 사용합니다. 인앱 브라우저에서 자동 복사·공유·전화 실행이 제한될 수 있어 실제 Android/iOS에서 검수해야 합니다. 호스팅 제공자의 접속 로그 처리는 앱 코드의 개인정보 미수집과 별개입니다.

Web Share 참고: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share

## 파일 구조

```text
Hoya-hoho-house/
├── index.html
├── hoya/index.html
├── hoho/index.html
├── 404.html
├── .nojekyll
├── .gitignore
├── assets/
│   ├── css/style.css
│   ├── js/app.js
│   ├── js/stay-data.js       # 운영정보 수정
│   └── images/
│       ├── favicon.svg
│       ├── hoya/cover.svg, og.png
│       └── hoho/cover.svg, og.png
├── tools/validate.cjs
├── tools/prepare-meta.cjs
├── tools/test_browser.py
├── docs/CONTENT-CHECKLIST.md
├── docs/TEST-REPORT.md
└── README.md
```
