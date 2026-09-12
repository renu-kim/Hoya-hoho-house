# 저장소 주소 반영 후 추가 검증 — 2026-09-12

이전 패키지 검증 대상: `renukim/Hoya-hoho-house`. 아래 브라우저 결과는 이전 주소를 사용한 검증 기록입니다.

- JavaScript 문법 검사: 통과 (`app.js`, `stay-data.js`).
- 데이터/파일 구조 검사: 통과. 두 숙소는 `ready: false` 초안 상태 유지.
- 오프라인 Chromium DOM 검사: **50개 통과 / 0개 실패**.
- 저장소 하위 경로와 두 숙소 공유 URL 검사를 추가했습니다.
- 3개 페이지의 canonical/OG URL과 정적 로컬 참조 18개 존재 여부 확인.
- 404 복귀 주소가 배포 예정 기본 주소를 가리키는지 확인.

## 검증 범위

브라우저 검사는 URL·저장소·클립보드·공유 API를 모사한 테스트 환경입니다. 실제 GitHub 배포, 네트워크를 통한 웹사이트 접속, 스마트폰의 지도·전화·문자·공유 앱 실행은 수행하지 않았습니다. 실운영 내용은 미입력이므로 운영 준비 완료를 뜻하지 않습니다.

이전 패키지 생성 당시 GitHub 연결에서 반환된 저장소 권한은 `pull: true`, `push: false`, `admin: false`였습니다. 당시 조회 시 저장소는 비어 있었으며 원격 파일 쓰기나 Pages 설정 변경은 수행하지 않았습니다.

세부 결과: `docs/BROWSER-RESULTS.json`

## 실제 배포 대상 정정 — 2026-09-12

사용자가 지정한 저장소는 `renu-kim/Hoya-hoho-house`입니다. 공유 URL, canonical/OG 메타데이터, 404 복귀 주소와 브라우저 테스트의 예상 주소를 `https://renu-kim.github.io/Hoya-hoho-house/`로 수정했습니다.

- 대상 저장소가 비어 있으며 연결 계정에 `push: true`, `admin: true` 권한이 있음을 확인했습니다.
- JavaScript 문법 검사 및 데이터/필수 파일 구조 검사: 통과.
- 두 숙소는 실제 운영정보 미입력으로 `ready: false`를 유지합니다.
- 이번 Windows 환경에는 Python Playwright가 설치되어 있지 않아 기존 브라우저 DOM 검사는 재실행하지 않았습니다.
- 배포 소스는 `main` 브랜치의 루트(`/`)입니다. 실시간 배포 상태는 저장소 Actions 및 Pages 설정에서 확인합니다.
