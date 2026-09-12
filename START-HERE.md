# Hoya-hoho-house 게시 순서

## 범위와 상태

호야네·호호네 **숙박객 안내 전용 정적 사이트**입니다. 예약 접수·조회·변경, 결제, 회원가입, 예약 플랫폼 연동은 없습니다.

저장소: https://github.com/renu-kim/Hoya-hoho-house

`main` 브랜치의 루트(`/`)를 GitHub Pages 게시 소스로 사용합니다. 배포 상태는 저장소의 Actions 및 Settings → Pages에서 확인할 수 있습니다. 두 숙소의 실제 운영정보는 미입력입니다.

## 1. 파일 업로드

PC 브라우저에서 본인 GitHub 계정으로 진행합니다.

1. `Hoya-hoho-house-deploy.zip`을 해제합니다. ZIP 파일 자체를 올리면 웹사이트가 되지 않습니다.
2. 저장소를 엽니다. 빈 저장소의 `uploading an existing file` 링크 또는 `Add file → Upload files`를 이용합니다.
3. 압축을 푼 폴더 **안의 파일과 하위 폴더**를 모두 드래그합니다. 바깥 폴더를 통째로 한 단계 더 넣지 마세요.
4. `main` 브랜치에 저장(Commit changes)합니다. 최상단에서 `index.html`, `hoya/`, `hoho/`, `assets/`가 보여야 합니다. 숨김 파일 `.nojekyll`도 포함합니다.

```text
Hoya-hoho-house (저장소 루트)
├── index.html
├── hoya/index.html
├── hoho/index.html
├── assets/
├── .nojekyll
├── 404.html
├── README.md
├── START-HERE.md
├── docs/
└── tools/
```

## 2. Pages 활성화

파일을 먼저 올린 뒤 저장소 설정을 엽니다.

```text
Settings → Pages → Build and deployment
Source: Deploy from a branch
Branch: main
Folder: /(root)
Save
```

기본 Pages 도메인을 사용할 때의 주소:

```text
숙소 선택: https://renu-kim.github.io/Hoya-hoho-house/
호야네:    https://renu-kim.github.io/Hoya-hoho-house/hoya/
호호네:    https://renu-kim.github.io/Hoya-hoho-house/hoho/
```

위 주소는 배포 예정 설정값입니다. 실제 활성화 후 Pages 설정의 Visit site에서 확인하세요. `/docs`를 게시 폴더로 선택하지 마세요. 이 저장소의 `docs`에는 운영 문서만 있습니다.

## 3. 운영정보 채우기

`assets/js/stay-data.js`의 `stays.hoya`와 `stays.hoho`를 각각 수정합니다. 주소, 공개용 관리자 연락처, 입·퇴실 시간, 주차 안내, 실제 사진과 주변 정보는 임의로 만들지 않고 빈 값으로 두었습니다.

`docs/CONTENT-CHECKLIST.md`를 따라 검수하고 각 숙소의 `ready: false`를 `true`로 바꾸세요. 빈 값을 둔 채 `ready`만 바꾸면 안 됩니다. 출입 비밀번호와 예약자 정보는 공개 파일에 넣지 않습니다.

## 4. 게시 후 확인

두 숙소의 링크를 각각 새 창에서 열고, 모바일에서 지도·전화·문자·공유 버튼을 실제로 눌러 확인합니다. 새로고침, 뒤로 가기와 호야네↔호호네 전환도 확인합니다. 실제 정보 검수 전에는 고객에게 발송하지 마세요.

## 호스팅 정책

이 사이트는 안내만 제공하지만, 예약·결제 기능이 없다는 사실만으로 호스팅 정책상 사용 허용을 보장할 수는 없습니다. GitHub Pages의 상거래 관련 제한은 운영자가 확인해야 합니다.

공식 문서 (2026-09-12 확인):
- 파일 업로드: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Pages 설정: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Pages 주소: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- 사용 제한: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
