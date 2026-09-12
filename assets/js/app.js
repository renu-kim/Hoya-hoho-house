/* 호야네 · 호호네 guest guide. Plain browser JavaScript, no build or dependencies. */
(() => {
  "use strict";
  const script = document.currentScript;
  const IS_PREVIEW = Boolean(window.STAY_PREVIEW);
  const BASE = (() => {
    try { return script && script.src ? new URL("../../", script.src) : new URL("./", location.href); }
    catch { return new URL("https://stay-guide.invalid/"); } // Supports isolated HTML preview frames.
  })();
  const FILE_MODE = location.protocol === "file:";
  const config = window.STAY_GUIDE;
  const root = document.getElementById("app");
  if (!root || !config || config.schemaVersion !== 1 || !config.stays) {
    if (root) root.innerHTML = '<main class="error-page"><h1>안내를 불러오지 못했어요.</h1><p>assets/js/stay-data.js 파일을 확인해 주세요. 이용 정보는 예약 메시지에서 확인하실 수 있습니다.</p></main>';
    return;
  }
  const STAY_IDS = ["hoya", "hoho"];
  const STORAGE_PREFIX = `stay-guide:${BASE.pathname}:`;
  let currentStay = null;
  let observer = null;
  let toastTimer;
  let galleryItems = [];
  let galleryIndex = 0;
  let beforePrintStates = [];
  let lastDialogTrigger = null;
  const pending = "상세 안내를 준비하고 있어요. 예약 메시지를 확인해 주세요.";
  const ICONS = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    chevron: '<path d="m7 10 5 5 5-5"/>',
    right: '<path d="m9 5 7 7-7 7"/>',
    left: '<path d="m15 5-7 7 7 7"/>',
    pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    parking: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
    key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-4-4 3-3m-6 0 3-3"/>',
    wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r=".5"/>',
    book: '<path d="M12 5C8 2 3 4 3 4v16s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1Zm0 0v16"/>',
    phone: '<path d="m7 3 3 5-3 2a15 15 0 0 0 7 7l2-3 5 3-1 4C10 23 1 14 3 4Z"/>',
    search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
    share: '<path d="M12 16V3m-5 5 5-5 5 5M5 13v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    logout: '<path d="M9 3H4v18h5m4-5 5-4-5-4m-5 4h13"/>',
    home: '<path d="m3 10 9-7 9 7v11H3ZM9 21v-8h6v8"/>',
    bed: '<path d="M3 18V8m18 10V8M3 14h18M3 18v3m18-3v3M6 14V7h12v7M9 7V4h6v3"/>',
    kitchen: '<path d="M5 3v7a3 3 0 0 0 6 0V3M8 3v18M19 3c-4 3-4 9 0 9V3Zm0 9v9"/>',
    bath: '<path d="M3 12h18v4a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-4ZM5 12V5a3 3 0 0 1 6 0M4 21v1m16-1v1"/>',
    thermometer: '<path d="M9 15V5a3 3 0 0 1 6 0v10a5 5 0 1 1-6 0Z"/><path d="M12 10v9m6-12h3m-3 4h2"/>',
    tv: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m8 2 4 4 4-4M8 22h8"/>',
    flame: '<path d="M12 2c1 5 6 6 6 10l3-2c2 7-2 12-9 12C5 22 1 16 4 10c0 3 2 4 3 4-1-5 1-8 5-12Z"/>',
    recycle: '<path d="m8 5 3-3 4 6m-6 0h6V2M20 10l2 5-8 4m1-6-1 6 6 1M9 21H4l-1-9m-3 4 3-4 5 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 16 6-5 4 4 3-3 5 5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
    message: '<path d="M21 12a9 9 0 0 1-13 8l-6 2 2-6A9 9 0 1 1 21 12Z"/><path d="M7 10h10m-10 4h7"/>',
    shield: '<path d="M12 2 3 6v5c0 5 9 11 9 11s9-6 9-11V6Z"/><path d="M12 7v6m0 4v.1"/>',
    up: '<path d="m6 12 6-6 6 6m-6-6v15"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    leaf: '<path d="M20 3C8 1 2 8 5 16s17 4 15-13Z"/><path d="M3 22 16 8"/>',
    print: '<path d="M6 9V3h12v6M6 18H3V9h18v9h-3M6 14h12v7H6Z"/>'
  };
  const icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;
  const mark = () => '<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true"><path fill="currentColor" d="M24 23C6 19 6 4 15 4c6 0 8 8 9 19Zm1 1C29 6 44 6 44 15c0 6-8 8-19 9Zm-1 1c18 4 18 19 9 19-6 0-8-8-9-19Zm-1-1C19 42 4 42 4 33c0-6 8-8 19-9Z"/><circle cx="24" cy="24" r="3" fill="currentColor"/></svg>';
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const arr = value => Array.isArray(value) ? value : [];
  const text = (value, fallback = pending) => esc(typeof value === "string" && value.trim() ? value : fallback);
  const httpUrl = value => {
    if (typeof value !== "string" || !value.trim()) return "";
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.href : ""; }
    catch { return ""; }
  };
  const imageUrl = path => {
    if (typeof path !== "string" || !path.trim()) return "";
    if (window.STAY_PREVIEW_ASSETS && window.STAY_PREVIEW_ASSETS[path]) return window.STAY_PREVIEW_ASSETS[path];
    // Images remain local: no tracking pixels, arbitrary schemes, or parent traversal.
    if (!/^assets\/images\/[a-zA-Z0-9_\-/.]+\.(webp|png|jpe?g|svg|avif)$/i.test(path) || path.includes("..")) return "";
    return new URL(path, BASE).href;
  };
  const phoneNumber = value => {
    if (typeof value !== "string" || !/^[+\d\s().-]+$/.test(value)) return "";
    const normalized = value.replace(/[\s().-]/g, "");
    return /^\+?\d{8,15}$/.test(normalized) ? normalized : "";
  };
  const route = id => {
    if (IS_PREVIEW) return id ? `#${id}` : "#home";
    return new URL(id ? `${id}/${FILE_MODE ? "index.html" : ""}` : (FILE_MODE ? "index.html" : "./"), BASE).href;
  };
  const routeAttr = id => `href="${esc(route(id))}" data-route="${id || "home"}"`;
  const externalLink = (url, label, className = "button", iconName = "arrow") => {
    const safe = httpUrl(url);
    return safe
      ? `<a class="${className}" href="${esc(safe)}" target="_blank" rel="noopener noreferrer">${label}${icon(iconName)}<span class="sr-only"> (새 창)</span></a>`
      : `<button type="button" class="${className}" disabled title="관리자가 정보를 등록하면 사용할 수 있어요.">${label}${icon(iconName)}</button>`;
  };
  const phoneLink = (stay, sms = false, className = "button primary") => {
    const phone = phoneNumber(stay.contact.phone);
    const label = sms ? "문자 남기기" : "전화하기";
    return phone
      ? `<a class="${className}" href="${sms ? "sms" : "tel"}:${esc(phone)}">${icon(sms ? "message" : "phone")}${label}</a>`
      : `<button class="${className}" type="button" disabled title="관리자 연락처 등록 전입니다.">${icon(sms ? "message" : "phone")}${label}</button>`;
  };
  const readStorage = (key, session = false) => {
    try { return (session ? sessionStorage : localStorage).getItem(STORAGE_PREFIX + key); }
    catch { return null; }
  };
  const writeStorage = (key, value, session = false) => {
    try { (session ? sessionStorage : localStorage).setItem(STORAGE_PREFIX + key, value); return true; }
    catch { return false; }
  };
  function toast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    clearTimeout(toastTimer);
    el.textContent = message;
    el.classList.add("visible");
    toastTimer = setTimeout(() => el.classList.remove("visible"), 3600);
  }
  function draftBanner(stay) {
    const ready = stay ? stay.ready : STAY_IDS.every(id => config.stays[id]?.ready);
    return ready ? "" : `<div class="draft-strip"><div class="wrap"><strong>초안</strong><span>실제 주소 · 연락처 · 운영정보 입력 전입니다. 예약 메시지를 우선 확인해 주세요.</span></div></div>`;
  }
  function header(stay) {
    return `<header class="site-header ${stay ? "" : "header-home"}"><div class="wrap header-inner">
      <a class="brand" ${routeAttr(null)} aria-label="호야네 · 호호네 숙소 선택">${mark()}<div><div class="brand-name">호야네 · 호호네</div><div class="brand-sub">A LITTLE GUIDE TO YOUR STAY</div></div></a>
      ${stay ? `<nav class="switcher" aria-label="숙소 선택">${STAY_IDS.map(id => `<a ${routeAttr(id)} ${id === stay.id ? 'aria-current="page"' : ""}><span class="dot"></span>${esc(config.stays[id].name)}</a>`).join("")}</nav>` : '<nav class="header-nav" aria-label="페이지 안내"><a href="#choose">숙소 선택</a><a href="#about-guide">안내서 소개</a></nav>'}
      <div class="header-actions">${stay ? `<button class="icon-button" data-action="search" aria-label="숙소 안내 검색">${icon("search")}</button>` : ""}<button class="icon-button share-header" data-action="share" aria-label="안내 링크 공유">${icon("share")}</button></div>
    </div></header>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="wrap footer-inner"><div><div class="footer-brand">호야네 · 호호네</div><p class="footer-note">머무는 시간을 위한 작은 안내서 · Guest guide</p><p class="footer-note">예약 · 결제를 처리하지 않는 숙소 이용 안내 페이지입니다.</p></div><div class="footer-actions"><a ${routeAttr(null)}>숙소 선택</a><button data-action="privacy">이용 안내</button><button data-action="print">인쇄하기</button></div></div></footer>`;
  }
  function dialogs() {
    return `<div class="toast" id="toast" role="status" aria-live="polite" aria-atomic="true"></div>
      <dialog id="search-dialog" aria-labelledby="search-title"><div class="dialog-header"><h2 id="search-title">어떤 안내가 필요하세요?</h2><button class="icon-button" data-close-dialog aria-label="검색 닫기">${icon("close")}</button></div><div class="dialog-body"><div class="search-field">${icon("search")}<label class="sr-only" for="global-search">숙소 안내 검색</label><input id="global-search" type="search" placeholder="주차, 입실, 바비큐…" autocomplete="off"></div><p id="search-status" class="faq-count" role="status"></p><ul class="search-results" id="search-results"></ul></div></dialog>
      <dialog id="copy-dialog" aria-labelledby="copy-title"><div class="dialog-header"><h2 id="copy-title">직접 복사해 주세요</h2><button class="icon-button" data-close-dialog aria-label="복사 창 닫기">${icon("close")}</button></div><div class="dialog-body"><p>브라우저에서 자동 복사를 허용하지 않았어요. 아래 내용을 선택해 복사해 주세요.</p><label for="copy-value" class="sr-only">복사할 내용</label><textarea id="copy-value" readonly></textarea><button type="button" class="button subtle" data-action="select-copy">전체 선택</button></div></dialog>
      <dialog id="privacy-dialog" aria-labelledby="privacy-title"><div class="dialog-header"><h2 id="privacy-title">안내 페이지 이용 안내</h2><button class="icon-button" data-close-dialog aria-label="이용 안내 닫기">${icon("close")}</button></div><div class="dialog-body"><p>이 페이지는 공개된 숙소 안내서입니다. 예약 정보나 출입 비밀번호를 입력하지 마세요. 이용 조건은 예약하신 플랫폼과 관리자의 안내를 우선 확인해 주세요.</p><p>앱 코드에는 광고·방문 분석 도구나 예약 정보 수집 기능이 없습니다. 마지막으로 본 숙소는 이 브라우저의 로컬 저장소에, 퇴실 체크는 현재 탭의 세션 저장소에만 기록합니다. 이 기록을 앱에서 서버로 전송하지 않습니다.</p><p>호스팅 제공자의 접속 로그 처리는 별개입니다. 외부 지도·문의 링크를 열면 해당 서비스의 정책이 적용됩니다. 전화·문자·공유 기능은 기기와 브라우저 지원에 따라 달라집니다.</p><button class="button" data-action="clear-local">이 브라우저의 안내 기록 지우기</button></div></dialog>
      <dialog id="gallery-dialog" class="gallery-dialog" aria-labelledby="gallery-title"><div class="dialog-header"><h2 id="gallery-title">숙소 사진</h2><button class="icon-button" data-close-dialog aria-label="사진 닫기">${icon("close")}</button></div><div class="gallery-stage"><img id="gallery-image" alt=""></div><div class="gallery-controls"><p><span id="gallery-caption"></span><small id="gallery-count" aria-live="polite"></small></p><button class="icon-button" data-action="gallery-prev" aria-label="이전 사진">${icon("left")}</button><button class="icon-button" data-action="gallery-next" aria-label="다음 사진">${icon("right")}</button></div></dialog>`;
  }
  function cover(stay, className = "hero-media") {
    const actualImage = imageUrl(stay.heroImage);
    const src = actualImage || imageUrl(`assets/images/${stay.id}/cover.svg`);
    return `<div class="${className}"><img src="${esc(src)}" alt="${actualImage ? text(stay.heroAlt, stay.name + " 숙소 전경") : esc(stay.name + " 브랜드 일러스트. 실제 숙소 사진이 아닙니다.")}" width="800" height="560" fetchpriority="high">${actualImage ? "" : '<span class="art-credit">브랜드 일러스트 · 실제 숙소 사진이 아닙니다</span>'}</div>`;
  }
  function renderHome(invalid = false) {
    cleanup();
    currentStay = null;
    document.body.dataset.theme = "forest";
    document.body.className = "home-body";
    document.title = "호야네 · 호호네 | 숙소 안내";
    const recent = readStorage("recent");
    root.innerHTML = `${header(null)}${draftBanner(null)}<main id="main" tabindex="-1" class="wrap">
      <section class="home-hero"><p class="eyebrow">WELCOME TO OUR LITTLE PLACES</p><h1>편안한 하루의 시작,<br><em>어느 곳에 머무시나요?</em></h1><p>예약하신 숙소를 선택하면, 필요한 안내가 한눈에 펼쳐져요.</p><span class="home-tag">${icon("book")} 도착부터 퇴실까지, 이 안내서 하나로</span></section>
      ${invalid ? '<p class="empty-note" role="status">알 수 없는 숙소 링크예요. 예약하신 숙소를 직접 선택해 주세요.</p>' : ""}
      <section id="choose" class="stay-picker" aria-label="숙소 선택">${STAY_IDS.map(id => { const stay = config.stays[id]; return `<a class="stay-card" ${routeAttr(id)} aria-label="${esc(stay.name)} 안내 보기" style="${id === "hoho" ? "--accent:#8c523a;--soft:#f4eae1;--hero:#f0e1d3" : ""}">${cover(stay, "stay-card-art").replace('</div>', `${recent === id ? '<span class="recent-label">최근에 본 숙소</span>' : ""}</div>`)}<div class="stay-card-content"><div><p class="eyebrow">${esc(stay.englishName)} · STAY GUIDE</p><h2>${esc(stay.name)}</h2><p>${esc(stay.tagline.replace(/\n/g, " "))}</p></div><span class="round-arrow">${icon("arrow")}</span></div></a>`; }).join("")}</section>
      <div class="home-help" id="about-guide"><span>${icon("pin")} 오시는 길 · 주차</span><span>${icon("key")} 입실 · 퇴실 안내</span><span>${icon("book")} 시설 사용법</span><span>${icon("compass")} 주변 둘러보기</span></div>
      </main>${footer()}${dialogs()}`;
    bindDialogs();
  }
  const sectionHeading = (no, eyebrow, title, description) => `<div class="section-heading"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2><p class="section-description">${description}</p></div><span class="section-number" aria-hidden="true">${no}</span></div>`;
  const infoRow = (label, value, fallback = "예약 안내 확인") => `<div class="info-row"><dt>${label}</dt><dd class="pre-line">${text(value, fallback)}</dd></div>`;
  const paragraphs = value => `<p class="pre-line">${text(value)}</p>`;
  const navItems = [["arrival","입실 안내"],["directions","오시는 길"],["parking","주차"],["space","숙소 소개"],["facilities","이용 안내"],["nearby","주변 정보"],["checkout","퇴실"],["faq","FAQ"],["contact","문의"]];
  function arrivalSection(s) {
    return `<section class="guide-section" id="arrival">${sectionHeading("01", "YOUR ARRIVAL", "반가워요, 곧 만나요", "도착 전, 입실 안내를 먼저 확인해 주세요.")}
      <div class="split-cards"><div class="time-card"><div class="time-card-label">${icon("key")} 체크인</div><span class="tag">입실</span><strong class="time-value ${s.checkIn.time ? "" : "pending"}">${text(s.checkIn.time,"예약 안내 확인")}</strong></div><div class="time-card"><div class="time-card-label">${icon("logout")} 체크아웃</div><span class="tag">퇴실</span><strong class="time-value ${s.checkOut.time ? "" : "pending"}">${text(s.checkOut.time,"예약 안내 확인")}</strong></div></div>
      <div class="content-block"><dl class="info-list">${infoRow("입실 방법",s.checkIn.method)}${infoRow("일찍 도착할 때",s.checkIn.earlyArrival,"가능 여부를 도착 전에 관리자에게 확인해 주세요.")}${infoRow("늦게 도착할 때",s.checkIn.lateArrival,"도착 예정 시간을 관리자에게 미리 알려 주세요.")}</dl></div><div class="empty-note">${icon("shield")}<span>출입 비밀번호는 이 페이지에 표시하지 않아요. 예약 메시지를 확인해 주세요.</span></div></section>`;
  }
  function directionsSection(s) {
    const address = [s.address.road,s.address.detail].filter(Boolean).join(" ");
    return `<section class="guide-section" id="directions">${sectionHeading("02","FIND YOUR WAY","오시는 길","출발 전, 예약하신 숙소 이름을 꼭 확인해 주세요.")}
      <div class="card"><div class="address-card"><div class="icon-box">${icon("pin")}</div><div><h3>${esc(s.name)}</h3><p>${text(address,"정확한 주소는 예약 메시지를 확인해 주세요.")}</p></div></div><button class="button" data-action="copy-address" ${s.address.road ? "" : 'disabled title="주소 등록 전입니다."'}>${icon("copy")} 주소 복사</button>
      <div class="map-placeholder"><div class="icon-box">${icon("pin")}</div><strong>${s.address.road ? "지도 앱에서 위치를 확인해 주세요" : "정확한 위치 정보를 준비하고 있어요"}</strong><p>배경은 장식용 패턴이며 실제 지도가 아닙니다.</p></div>
      <div class="map-actions">${externalLink(s.address.naverUrl,"네이버 지도","button","arrow")}${externalLink(s.address.kakaoUrl,"카카오맵","button","arrow")}</div>
      <div class="content-block"><h3>마지막 길 안내</h3>${paragraphs(s.address.directions)}</div></div></section>`;
  }
  function parkingSection(s) {
    const capacity = Number.isInteger(s.parking.capacity) && s.parking.capacity >= 0 ? (s.parking.capacity === 0 ? "숙소 전용 주차 없음" : `지정 주차 ${s.parking.capacity}대`) : "주차 위치를 확인해 주세요";
    const photo = imageUrl(s.parking.image);
    return `<section class="guide-section" id="parking">${sectionHeading("03","PARK & RELAX","주차부터 편안하게","지정된 주차 위치와 도착 시 안내를 확인해 주세요.")}<div class="card"><div class="parking-card"><div class="parking-letter" aria-hidden="true">P</div><div><h3>${capacity}</h3>${paragraphs(s.parking.description)}</div></div>${photo ? `<img class="parking-photo" src="${esc(photo)}" alt="${text(s.parking.imageAlt,"지정 주차 위치")}" loading="lazy">` : ""}<dl class="info-list content-block">${infoRow("주차 시 참고",s.parking.arrivalTip,"예약 메시지에 안내된 위치를 확인해 주세요.")}${infoRow("만차일 때",s.parking.alternative,"임의로 주차하지 말고 관리자에게 문의해 주세요.")}</dl></div></section>`;
  }
  function spaceSection(s) {
    const photos = arr(s.gallery).filter(p => imageUrl(p.src));
    galleryItems = photos;
    return `<section class="guide-section" id="space">${sectionHeading("04","MAKE YOURSELF AT HOME","우리의 작은 공간","머무는 동안 필요한 공간과 비품을 알아보세요.")}<p class="lead-text">${esc(s.intro)}</p><div class="small-grid">${arr(s.spaces).map(item => `<article class="space-card">${icon(item.icon)}<h3>${esc(item.title)}</h3><p class="pre-line">${text(item.body,"구성과 비품 안내 준비 중")}</p></article>`).join("")}</div>
      ${photos.length ? `<div class="gallery-grid">${photos.slice(0,3).map((p,i) => `<button class="gallery-button" data-gallery="${i}" aria-label="${text(p.alt,p.caption || "숙소 사진")} 크게 보기"><img src="${esc(imageUrl(p.src))}" alt="${text(p.alt,p.caption || "숙소 사진")}" loading="lazy"><span>${i === 2 && photos.length > 3 ? `사진 ${photos.length}장 모두 보기` : text(p.caption,"크게 보기")}</span></button>`).join("")}</div>` : `<div class="gallery-empty">${icon("image")}<div><strong>숙소 사진을 준비하고 있어요</strong><span>실제 사진이 등록되면 크게 확대해서 볼 수 있어요.</span></div></div>`}</section>`;
  }
  function facilitiesSection(s) {
    return `<section class="guide-section" id="facilities">${sectionHeading("05","LITTLE THINGS TO KNOW","이렇게 이용해 주세요","필요한 안내를 누르면 자세한 내용이 펼쳐져요.")}<div class="wifi-card" id="wifi">${icon("wifi")}<div><h3>Wi-Fi ${s.wifi.ssid ? `<span class="serif">${esc(s.wifi.ssid)}</span>` : "연결 안내"}</h3><p>${text(s.wifi.help,"객실 내 안내를 확인해 주세요.")}</p></div><button class="button" data-action="copy-wifi" ${s.wifi.ssid ? "" : "disabled"}>${icon("copy")} Wi-Fi 이름 복사</button></div>
      <div class="accordion-list">${arr(s.facilities).map((item,i) => `<details class="accordion" id="facility-${i}"><summary>${icon(item.icon)}${esc(item.title)}${icon("chevron","chevron")}</summary><div class="accordion-body">${paragraphs(item.body)}${imageUrl(item.image) ? `<img src="${esc(imageUrl(item.image))}" alt="${esc(item.title)} 사용 안내" loading="lazy">` : ""}</div></details>`).join("")}</div>
      <div class="content-block"><h3>서로를 위한 작은 약속</h3><div class="rules-list">${arr(s.rules).map(item => `<div class="rule-item">${icon("circleCheck")}<div><h3>${esc(item.title)}</h3><p class="pre-line">${text(item.body,"숙소별 예약 조건을 확인해 주세요.")}</p></div></div>`).join("")}</div></section>`;
  }
  function nearbySection(s) {
    return `<section class="guide-section" id="nearby">${sectionHeading("06","AROUND THE NEIGHBORHOOD","주변도 천천히 둘러봐요","관광지부터 가까운 편의시설까지 한곳에서.")}<div class="filter-row" role="group" aria-label="주변 장소 분류">${["전체","관광","맛집","카페","편의시설"].map((cat,i) => `<button type="button" class="filter-chip" data-category="${cat}" aria-pressed="${i === 0}">${cat}</button>`).join("")}</div><div id="nearby-results" aria-live="polite"></div></section>`;
  }
  function renderNearby(category = "전체") {
    if (!currentStay) return;
    const target = document.getElementById("nearby-results");
    if (!target) return;
    const list = arr(currentStay.nearby).filter(p => category === "전체" || p.category === category);
    target.innerHTML = !list.length ? `<div class="nearby-empty">${icon("compass")}<strong>${category === "전체" ? "가까운 좋은 곳들을 모으고 있어요" : `${esc(category)} 정보를 준비하고 있어요`}</strong><p>실제 위치와 정보를 확인한 장소만 소개할게요. 현재 등록된 ${category === "전체" ? "주변 장소" : esc(category)} 정보가 없습니다.</p></div>` : `<div class="nearby-grid">${list.map(p => `<article class="place-card">${imageUrl(p.image) ? `<img src="${esc(imageUrl(p.image))}" alt="${esc(p.name)}" loading="lazy">` : ""}<div class="place-body"><span class="tag">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description || "")}</p>${p.distance ? `<p class="distance">${esc(p.distance)}</p>` : ""}${externalLink(p.mapUrl,"지도에서 보기","text-link","arrow")}${p.checkedAt ? `<p class="muted"><small>정보 확인 ${esc(p.checkedAt)}</small></p>` : ""}</div></article>`).join("")}</div>`;
  }
  function checkoutSection(s) {
    return `<section class="guide-section" id="checkout">${sectionHeading("07","UNTIL NEXT TIME","떠나는 순간까지 가볍게","마지막으로 한 번 더 확인하고, 편안하게 돌아가세요.")}<div class="card"><div class="time-card-label">${icon("logout")} 체크아웃 ${text(s.checkOut.time,"시간은 예약 안내 확인")}</div><div class="content-block">${paragraphs(s.checkOut.instructions)}</div><p class="muted"><small>아래는 개인 확인용 메모입니다. 숙소별 퇴실 규칙은 예약 안내를 우선해 주세요.</small></p><ul class="checklist">${arr(s.checkOut.checklist).map((item,i) => `<li><label><input type="checkbox" data-checkout="${i}"><span>${esc(item)}</span></label></li>`).join("")}</ul><div class="checklist-progress" aria-hidden="true"><span id="check-progress" style="width:0%"></span></div><div class="checklist-meta"><span id="check-status" role="status" aria-live="polite"></span><button data-action="reset-checks" type="button">체크 초기화</button></div></div></section>`;
  }
  function faqSection(s) {
    return `<section class="guide-section" id="faq">${sectionHeading("08","GOOD QUESTIONS","자주 묻는 질문","궁금한 내용을 검색하거나 질문을 눌러 보세요.")}<div class="search-field">${icon("search")}<label class="sr-only" for="faq-search">자주 묻는 질문 검색</label><input id="faq-search" type="search" placeholder="예: 입실, 도착, 비품, 예약 변경" autocomplete="off"></div><p class="faq-count" id="faq-count" role="status">전체 ${arr(s.faqs).length}개 질문</p><div class="accordion-list" id="faq-list">${arr(s.faqs).map((item,i) => `<details class="accordion" id="faq-${i}" data-faq="${i}"><summary><span class="faq-question-number">Q.</span>${esc(item.question)}${icon("chevron","chevron")}</summary><div class="accordion-body">${paragraphs(item.answer)}</div></details>`).join("")}</div><p class="empty-note" id="faq-empty" hidden>찾는 질문이 없어요. 다른 검색어를 입력하거나 관리자에게 문의해 주세요.</p></section>`;
  }
  function contactSection(s) {
    const emergency = s.emergency;
    return `<section class="guide-section" id="contact">${sectionHeading("09","WE ARE HERE FOR YOU","도움이 필요하신가요?","확인되지 않는 안내나 불편한 점은 편하게 문의해 주세요.")}<div class="contact-panel"><p class="eyebrow">YOUR HOST · ${esc(s.englishName)}</p><h3>${esc(s.contact.label || s.name + " 관리자")}</h3><p>문의하실 때 예약하신 숙소 이름을 함께 알려 주세요.</p><div class="contact-number ${phoneNumber(s.contact.phone) ? "" : "pending"}">${text(s.contact.phone,"연락처는 예약 메시지에서 확인해 주세요.")}</div><div class="button-row">${phoneLink(s,false,"button")}${phoneLink(s,true,"button ghost")}${s.contact.channelUrl ? externalLink(s.contact.channelUrl,text(s.contact.channelLabel,"공식 문의 채널"),"button ghost","message") : ""}</div><div class="contact-hours">${s.contact.hours ? `문의 가능 시간 · ${esc(s.contact.hours)}` : (phoneNumber(s.contact.phone) ? "문의 가능 시간은 예약 안내를 확인해 주세요." : "전화·문자 버튼은 관리자 연락처 등록 후 활성화됩니다.")}</div></div>
      <div class="emergency-card"><h3>${icon("shield")} 긴급할 때 확인해 주세요</h3><p class="muted"><small>긴급상황은 신고가 우선입니다. 신고 시 현재 숙소의 정확한 주소를 전달해 주세요.</small></p><div class="emergency-actions"><a class="button" href="tel:119">${icon("phone")} 119 화재 · 응급</a><a class="button" href="tel:112">${icon("phone")} 112 경찰</a></div><dl class="info-list">${infoRow("소화기 위치",emergency.extinguisher,"숙소 내 안전 안내를 확인해 주세요.")}${infoRow("대피 경로",emergency.exit,"숙소 내 안전 안내를 확인해 주세요.")}${infoRow("구급함",emergency.firstAid,"관리자에게 문의해 주세요.")}${emergency.hospital ? infoRow("가까운 병원",emergency.hospital) : ""}</dl></div></section>`;
  }
  function sidePanel(s) {
    return `<aside class="side-panel" aria-label="숙소 핵심 정보"><div class="side-card"><p class="side-eyebrow">YOUR STAY AT A GLANCE</p><div class="side-title">${mark()}<strong>${esc(s.name)}</strong></div><dl class="info-list">${infoRow("체크인",s.checkIn.time)}${infoRow("체크아웃",s.checkOut.time)}${infoRow("주소",s.address.road,"예약 메시지 확인")}</dl><a class="button primary" href="#directions">${icon("pin")} 오시는 길</a>${phoneLink(s,false,"button")}<button class="button subtle" data-action="share">${icon("share")} 안내 링크 공유</button></div><p class="side-note">${s.ready && s.updatedAt ? `최근 안내 확인 ${esc(s.updatedAt)}` : "운영정보를 준비 중입니다."}<br>예약 안내와 함께 확인해 주세요.</p><span class="side-line"></span><p class="side-bottom">Stay a little, rest a lot.</p></aside>`;
  }
  function dock(s) {
    return `<nav class="mobile-dock" aria-label="빠른 실행"><a href="#directions">${icon("pin")}길찾기</a><a href="#parking">${icon("parking")}주차</a><button data-action="share">${icon("share")}공유</button>${phoneLink(s,false,"dock-primary")}<a href="#top" aria-label="페이지 맨 위로">${icon("up")}맨 위</a></nav>`;
  }
  function cleanup() {
    if (observer) observer.disconnect();
    document.body.classList.remove("modal-open");
    clearTimeout(toastTimer);
  }
  function renderStay(id) {
    if (!STAY_IDS.includes(id) || !config.stays[id]) return renderHome(true);
    cleanup();
    currentStay = config.stays[id];
    const s = currentStay;
    document.body.dataset.theme = s.theme === "clay" ? "clay" : "forest";
    document.body.className = "stay-body";
    document.title = `${s.name} | 오시는 길 · 숙소 이용 안내`;
    if (config.site.rememberLastStay) writeStorage("recent", id);
    root.innerHTML = `${header(s)}${draftBanner(s)}<main id="main" tabindex="-1"><div class="wrap hero" id="top"><div class="hero-kicker"><div class="breadcrumb"><a ${routeAttr(null)}>숙소 선택</a>${icon("right")}<span>${esc(s.name)} 안내서</span></div><span class="muted">예약하신 숙소가 ${esc(s.name)}인지 확인해 주세요.</span></div><section class="hero-grid" aria-labelledby="stay-title"><div class="hero-copy"><p class="eyebrow">${esc(s.englishName)} · YOUR STAY GUIDE</p><h1 id="stay-title" class="pre-line">${esc(s.tagline)}</h1><p class="hero-intro">${esc(s.intro)}</p><div class="hero-bottom"><a href="#arrival" class="button primary">입실 안내 보기 ${icon("arrow")}</a><span class="hero-greeting">${icon("sun")}반가워요, ${esc(s.name)}입니다</span></div></div>${cover(s)}</section><nav class="quick-section" aria-label="자주 찾는 안내">${[["directions","pin","오시는 길","안전하게 찾아오기"],["parking","parking","주차 안내","도착 전 확인"],["arrival","key","입실 안내","여행의 시작"],["wifi","wifi","Wi-Fi","연결 정보 확인"],["facilities","book","시설 사용법","편안하게 이용하기"],["contact","phone","관리자 문의","도움이 필요할 때"]].map(([href,ic,title,sub]) => `<a class="quick-item" href="#${href}">${icon(ic)}<div><strong>${title}</strong><span>${sub}</span></div></a>`).join("")}</nav></div>
      <nav class="section-nav" aria-label="안내 목차"><div class="wrap">${navItems.map(([id,label],i) => `<a href="#${id}" ${i===0 ? 'class="active" aria-current="location"' : ""}>${label}</a>`).join("")}</div></nav>
      <div class="wrap content-layout"><div class="guide-content">${s.notice && s.ready ? `<p class="empty-note">${icon("info")}<span>${esc(s.notice)}</span></p>` : ""}${arrivalSection(s)}${directionsSection(s)}${parkingSection(s)}${spaceSection(s)}${facilitiesSection(s)}${nearbySection(s)}${checkoutSection(s)}${faqSection(s)}${contactSection(s)}</div>${sidePanel(s)}</div></main>${footer()}${dock(s)}${dialogs()}`;
    restoreChecks();
    renderNearby();
    bindDialogs();
    observeSections();
    // Broken local photos degrade to an explicit, non-misleading fallback.
    root.querySelectorAll("img").forEach(img => img.addEventListener("error", () => {
      if (img.id === "gallery-image") return;
      const notice = document.createElement("span");
      notice.className = "empty-note";
      notice.textContent = "사진을 불러오지 못했어요. 등록된 이미지 경로를 확인해 주세요.";
      img.replaceWith(notice);
    }, { once:true }));
  }
  function observeSections() {
    if (!("IntersectionObserver" in window)) return;
    observer = new IntersectionObserver(entries => {
      const candidate = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if (!candidate) return;
      document.querySelectorAll(".section-nav a").forEach(link => {
        const active = link.getAttribute("href") === "#" + candidate.target.id;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current","location"); else link.removeAttribute("aria-current");
      });
    }, { rootMargin:"-65px 0px -65% 0px", threshold:0 });
    document.querySelectorAll(".guide-section").forEach(section => observer.observe(section));
  }
  function restoreChecks() {
    let saved = [];
    try { saved = JSON.parse(readStorage(`checkout:${currentStay.id}`,true) || "[]"); } catch { /* Ignore corrupted storage. */ }
    if (!Array.isArray(saved)) saved = [];
    document.querySelectorAll("[data-checkout]").forEach((input,i) => { input.checked = saved[i] === true; });
    updateChecks(false);
  }
  function updateChecks(save = true) {
    if (!currentStay) return;
    const values = Array.from(document.querySelectorAll("[data-checkout]")).map(input => input.checked);
    const total = values.length, checked = values.filter(Boolean).length;
    const status = document.getElementById("check-status");
    const progress = document.getElementById("check-progress");
    if (status) status.textContent = `${checked} / ${total} 확인 · 현재 탭에만 저장`;
    if (progress) progress.style.width = `${total ? checked / total * 100 : 0}%`;
    if (save && !writeStorage(`checkout:${currentStay.id}`,JSON.stringify(values),true) && status) status.textContent = `${checked} / ${total} 확인 · 브라우저 저장 불가`;
  }
  function bindDialogs() {
    root.querySelectorAll("dialog").forEach(dialog => {
      dialog.addEventListener("click", event => {
        if (event.target === dialog) {
          const r = dialog.getBoundingClientRect();
          if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
        }
      });
      dialog.addEventListener("close", () => {
        document.body.classList.remove("modal-open");
        if (lastDialogTrigger?.isConnected) lastDialogTrigger.focus();
      });
    });
  }
  function showDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog || typeof dialog.showModal !== "function") { toast("이 기능은 최신 브라우저에서 이용해 주세요."); return null; }
    lastDialogTrigger = document.activeElement;
    dialog.showModal();
    document.body.classList.add("modal-open");
    return dialog;
  }
  async function copy(value, label) {
    if (!value) { toast("아직 등록된 정보가 없어요."); return; }
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(value); toast(`${label} 복사했어요.`); return; }
      catch { /* Fall back to manual selection, never claim a failed copy succeeded. */ }
    }
    const dialog = showDialog("copy-dialog");
    if (dialog) { const area = document.getElementById("copy-value"); area.value = value; area.focus(); area.select(); }
  }
  async function share() {
    let url;
    const publicBase = httpUrl(config.site.publicBaseUrl);
    if (publicBase) url = new URL(currentStay ? currentStay.id + "/" : "./", publicBase.endsWith("/") ? publicBase : publicBase + "/").href;
    else if (IS_PREVIEW || FILE_MODE) { toast("실제 배포 후 안내 링크를 공유할 수 있어요."); return; }
    else url = route(currentStay?.id || null);
    const data = { title: currentStay ? `${currentStay.name} 숙소 안내` : "호야네 · 호호네 숙소 안내", url };
    if (navigator.share && window.isSecureContext) {
      try { await navigator.share(data); return; }
      catch (error) { if (error.name === "AbortError") return; }
    }
    await copy(url,"안내 링크를");
  }
  function searchEntries() {
    if (!currentStay) return [];
    return [
      ...navItems.map(([target,title]) => ({target,title,group:"안내 목차",words:title})),
      { target:"wifi", title:"Wi-Fi 연결 안내", group:"시설 안내", words:"와이파이 인터넷 연결 네트워크 wifi wi-fi" },
      ...arr(currentStay.facilities).map((item,i) => ({target:`facility-${i}`,title:item.title,group:"시설 사용법",words:`${item.title} ${item.keywords} ${item.body}`})),
      ...arr(currentStay.faqs).map((item,i) => ({target:`faq-${i}`,title:item.question,group:"자주 묻는 질문",words:`${item.question} ${item.keywords} ${item.answer}`}))
    ];
  }
  function renderSearch(query="") {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const entries = searchEntries().filter(item => words.every(w => item.words.toLowerCase().includes(w)));
    document.getElementById("search-status").textContent = words.length ? `${entries.length}개의 안내를 찾았어요.` : "자주 찾는 안내를 바로 열어 보세요.";
    const result = document.getElementById("search-results");
    result.innerHTML = entries.map(item => `<li><a href="#${esc(item.target)}" data-search-target="${esc(item.target)}"><div><small>${esc(item.group)}</small>${esc(item.title)}</div>${icon("arrow")}</a></li>`).join("");
  }
  function filterFaq(query) {
    if (!currentStay) return;
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    document.querySelectorAll("[data-faq]").forEach(el => {
      const item = currentStay.faqs[Number(el.dataset.faq)];
      const corpus = `${item.question} ${item.answer} ${item.keywords || ""}`.toLowerCase();
      const show = words.every(word => corpus.includes(word));
      el.hidden = !show;
      if (show) count++;
    });
    document.getElementById("faq-count").textContent = words.length ? `${count}개의 질문을 찾았어요.` : `전체 ${count}개 질문`;
    document.getElementById("faq-empty").hidden = count > 0;
    document.getElementById("faq-list").hidden = count === 0;
  }
  function setGallery(index) {
    if (!galleryItems.length) return;
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[galleryIndex];
    const img = document.getElementById("gallery-image");
    img.src = imageUrl(item.src);
    img.alt = item.alt || item.caption || "숙소 사진";
    document.getElementById("gallery-caption").textContent = item.caption || item.alt || "숙소 사진";
    document.getElementById("gallery-count").textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
    document.querySelectorAll('[data-action^="gallery-"]').forEach(button => { button.disabled = galleryItems.length < 2; });
  }
  document.addEventListener("click", async event => {
    const routeLink = event.target.closest("[data-route]");
    if (routeLink && IS_PREVIEW) {
      event.preventDefault();
      const id = routeLink.dataset.route;
      if (id === "home") renderHome(); else renderStay(id);
      window.scrollTo({top:0,behavior:"instant"});
      return;
    }
    const close = event.target.closest("[data-close-dialog]");
    if (close) { close.closest("dialog")?.close(); return; }
    const searchLink = event.target.closest("[data-search-target]");
    if (searchLink) {
      event.preventDefault();
      const target = document.getElementById(searchLink.dataset.searchTarget);
      document.getElementById("search-dialog").close();
      if (target) {
        if (target.id.startsWith("faq-")) { document.getElementById("faq-search").value=""; filterFaq(""); }
        if (target.tagName === "DETAILS") target.open = true;
        target.scrollIntoView({ behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",block:"start" });
        const focusTarget = target.querySelector("summary") || target;
        if (!focusTarget.hasAttribute("tabindex") && focusTarget.tagName !== "SUMMARY") focusTarget.setAttribute("tabindex","-1");
        focusTarget.focus({preventScroll:true});
        if (!IS_PREVIEW) history.replaceState(null,"",`#${target.id}`);
      }
      return;
    }
    const chip = event.target.closest("[data-category]");
    if (chip) {
      document.querySelectorAll("[data-category]").forEach(el => el.setAttribute("aria-pressed",String(el === chip)));
      renderNearby(chip.dataset.category);
      return;
    }
    const gallery = event.target.closest("[data-gallery]");
    if (gallery) { setGallery(Number(gallery.dataset.gallery)); showDialog("gallery-dialog"); return; }
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    if (action === "share") await share();
    else if (action === "search") { showDialog("search-dialog"); renderSearch(); const input = document.getElementById("global-search"); input.value=""; input.focus(); }
    else if (action === "copy-address" && currentStay) await copy([currentStay.address.road,currentStay.address.detail].filter(Boolean).join(" "),"주소를");
    else if (action === "copy-wifi" && currentStay) await copy(currentStay.wifi.ssid,"Wi-Fi 이름을");
    else if (action === "select-copy") { const input = document.getElementById("copy-value"); input.focus(); input.select(); }
    else if (action === "privacy") showDialog("privacy-dialog");
    else if (action === "print") window.print();
    else if (action === "reset-checks") { document.querySelectorAll("[data-checkout]").forEach(input => { input.checked=false; }); updateChecks(); toast("퇴실 체크를 초기화했어요."); }
    else if (action === "gallery-prev") setGallery(galleryIndex - 1);
    else if (action === "gallery-next") setGallery(galleryIndex + 1);
    else if (action === "clear-local") {
      try { localStorage.removeItem(STORAGE_PREFIX + "recent"); STAY_IDS.forEach(id => sessionStorage.removeItem(STORAGE_PREFIX + `checkout:${id}`)); }
      catch { /* Storage may be disabled. */ }
      document.querySelectorAll("[data-checkout]").forEach(input => { input.checked=false; });
      updateChecks(false);
      document.querySelectorAll(".recent-label").forEach(el => el.remove());
      toast("이 브라우저의 안내 기록을 지웠어요.");
    }
  });
  document.addEventListener("input", event => {
    if (event.target.id === "faq-search") filterFaq(event.target.value);
    else if (event.target.id === "global-search") renderSearch(event.target.value);
  });
  document.addEventListener("change", event => {
    if (event.target.matches("[data-checkout]")) updateChecks();
  });
  document.addEventListener("keydown", event => {
    const dialog = document.getElementById("gallery-dialog");
    if (!dialog?.open) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); setGallery(galleryIndex-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); setGallery(galleryIndex+1); }
  });
  window.addEventListener("beforeprint", () => {
    beforePrintStates = Array.from(document.querySelectorAll("details")).map(el => [el,el.open]);
    beforePrintStates.forEach(([el]) => { el.open = true; });
  });
  window.addEventListener("afterprint", () => { beforePrintStates.forEach(([el,open]) => { if(el.isConnected) el.open=open; }); });
  // The HTML entry route wins. A remembered stay or query must never override it.
  const entryStay = document.body.dataset.stay;
  if (STAY_IDS.includes(entryStay)) renderStay(entryStay);
  else {
    const params = new URLSearchParams(location.search);
    const queryStay = params.get("stay");
    if (queryStay && STAY_IDS.includes(queryStay) && !IS_PREVIEW) location.replace(route(queryStay) + location.hash);
    else if (IS_PREVIEW && STAY_IDS.includes(queryStay)) renderStay(queryStay);
    else renderHome(Boolean(queryStay));
  }
  // Restore a directly linked section after inserting its static-page contents.
  if (currentStay && location.hash && !IS_PREVIEW) requestAnimationFrame(() => {
    let sectionId = location.hash.slice(1);
    try { sectionId = decodeURIComponent(sectionId); } catch { /* Keep a malformed fragment inert. */ }
    const target = document.getElementById(sectionId);
    if (target) { if (target.tagName === "DETAILS") target.open=true; target.scrollIntoView(); }
  });
})();
