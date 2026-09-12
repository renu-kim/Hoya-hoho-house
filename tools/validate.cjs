#!/usr/bin/env node
/** No dependencies. Run: node tools/validate.cjs [--production] */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..');
const production = process.argv.includes('--production');
const issues = [], warnings = [];
const must = (condition, message) => { if (!condition) issues.push(message); };
let cfg;
try {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'assets/js/stay-data.js'), 'utf8'), context, {timeout:1000});
  cfg = context.window.STAY_GUIDE;
  if (!cfg || cfg.schemaVersion !== 1 || !cfg.site || !cfg.stays) throw new Error('기본 스키마가 올바르지 않습니다.');
} catch (e) { console.error(`설정 파일 오류: ${e.message}`); process.exit(1); }
const hasText = v => typeof v === 'string' && v.trim().length > 0;
const https = v => { try { const u=new URL(v); return u.protocol==='https:' && !u.username && !u.password; } catch { return false; } };
const isPhone = v => typeof v === 'string' && /^[+\d\s().-]+$/.test(v) && /^\+?\d{8,15}$/.test(v.replace(/[\s().-]/g,''));
const localImage = (p, where) => {
  if (!p) return;
  must(typeof p==='string' && /^assets\/images\/[a-zA-Z0-9_\-/.]+\.(webp|png|jpe?g|svg|avif)$/i.test(p) && !p.includes('..'),`${where}: 허용되지 않는 이미지 경로`);
  if (typeof p==='string') must(fs.existsSync(path.join(ROOT,p)),`${where}: 이미지 파일 없음 (${p})`);
};
const date = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v;
function walk(obj, prefix='config') {
  if (!obj || typeof obj!=='object') return;
  for (const [k,v] of Object.entries(obj)) {
    if (/^(password|passcode|doorCode|lockCode|apiKey|secret|token|wifiPassword)$/i.test(k)) issues.push(`${prefix}.${k}: 공개 파일에 비밀정보 필드를 두지 마세요.`);
    if (v && typeof v==='object') walk(v,`${prefix}.${k}`);
  }
}
walk(cfg);
if (cfg.site.publicBaseUrl) must(https(cfg.site.publicBaseUrl) && cfg.site.publicBaseUrl.endsWith('/'),'publicBaseUrl: https 주소와 마지막 / 가 필요합니다.');
for (const id of ['hoya','hoho']) {
  const issueCount = issues.length;
  const s = cfg.stays[id];
  if (!s) {issues.push(`${id}: 설정 없음`);continue;}
  must(s.id===id,`${id}: id 불일치`);
  must(hasText(s.name) && hasText(s.englishName) && hasText(s.tagline) && hasText(s.intro),`${id}: 이름/영문명/표어/소개 필수`);
  must(['forest','clay'].includes(s.theme),`${id}: theme은 forest 또는 clay`);
  must(typeof s.ready==='boolean',`${id}: ready는 true/false`);
  for (const k of ['address','contact','checkIn','checkOut','parking','wifi','emergency']) must(s[k] && typeof s[k]==='object',`${id}.${k}: 객체 필수`);
  for (const k of ['spaces','facilities','rules','gallery','nearby','faqs']) must(Array.isArray(s[k]),`${id}.${k}: 배열 필수`);
  if (issues.length > issueCount) continue;
  must(Array.isArray(s.checkOut.checklist),`${id}.checkOut.checklist: 배열 필수`);
  for (const [field,value] of [['checkIn.time',s.checkIn.time],['checkOut.time',s.checkOut.time]]) if (value) must(/^([01]\d|2[0-3]):[0-5]\d$/.test(value),`${id}.${field}: HH:MM 형식`);
  if (s.contact.phone) must(isPhone(s.contact.phone),`${id}.contact.phone: 올바른 전화번호 형식`);
  if (s.updatedAt) must(date(s.updatedAt),`${id}.updatedAt: 실제 YYYY-MM-DD 날짜`);
  for (const [field,url] of [['address.naverUrl',s.address.naverUrl],['address.kakaoUrl',s.address.kakaoUrl],['contact.channelUrl',s.contact.channelUrl]]) if (url) must(https(url),`${id}.${field}: https 공유 링크만 허용`);
  must(s.parking.capacity===null || Number.isInteger(s.parking.capacity) && s.parking.capacity>=0,`${id}.parking.capacity: null 또는 0 이상 정수`);
  localImage(s.heroImage,`${id}.heroImage`); localImage(s.parking.image,`${id}.parking.image`);
  s.gallery.forEach((p,i)=>{must(hasText(p.src) && hasText(p.alt),`${id}.gallery[${i}]: src/alt 필수`);localImage(p.src,`${id}.gallery[${i}].src`);});
  s.facilities.forEach((p,i)=>localImage(p.image,`${id}.facilities[${i}].image`));
  s.nearby.forEach((p,i)=>{
    must(hasText(p.name) && ['관광','맛집','카페','편의시설'].includes(p.category),`${id}.nearby[${i}]: 이름과 지정된 분류 필요`);
    must(https(p.mapUrl),`${id}.nearby[${i}]: https 지도 링크 필수`);
    if(p.checkedAt) must(date(p.checkedAt),`${id}.nearby[${i}]: 잘못된 확인일`);
    localImage(p.image,`${id}.nearby[${i}].image`);
  });
  if (!s.ready) warnings.push(`${id}: 초안입니다. 미확인 정보를 채우고 검수한 뒤 ready=true로 설정하세요.`);
  if (production || s.ready) {
    const required = {
      'address.road':s.address.road, 'contact.phone':s.contact.phone,
      'checkIn.time':s.checkIn.time, 'checkOut.time':s.checkOut.time,
      'checkIn.method':s.checkIn.method, 'checkOut.instructions':s.checkOut.instructions,
      'parking.description':s.parking.description, 'emergency.extinguisher':s.emergency.extinguisher,
      'emergency.exit':s.emergency.exit, 'updatedAt':s.updatedAt
    };
    for(const [field,value] of Object.entries(required)) must(hasText(value),`${id}.${field}: 실운영 필수 입력`);
    must(Boolean(s.address.naverUrl || s.address.kakaoUrl),`${id}: 최소 1개 지도 링크 필요`);
    must(s.ready===true,`${id}: 실운영 검수 완료 후 ready=true 필요`);
    for(const k of ['spaces','facilities','rules']) s[k].forEach((v,i)=>must(hasText(v.body),`${id}.${k}[${i}].body: 실제 안내 입력 (미제공 시설은 삭제하거나 미제공 명시)`));
    must(s.gallery.length>0 || Boolean(s.heroImage),`${id}: 최소 1장 실제 숙소 사진 필요`);
    must(s.nearby.length>0,`${id}: 최소 1개 확인된 주변 장소 필요`);
  }
}
for(const file of ['index.html','hoya/index.html','hoho/index.html','assets/css/style.css','assets/js/app.js','.nojekyll','404.html']) must(fs.existsSync(path.join(ROOT,file)),`필수 파일 없음: ${file}`);
for(const warning of warnings) console.warn(`주의: ${warning}`);
if(issues.length) { console.error(`\n${issues.length}개 확인 필요:\n`+issues.map(v=>'  - '+v).join('\n')); process.exit(1); }
console.log(production ? '실운영 필수 입력 검사 통과. 내용 정확성, 사진 권리와 외부 앱 실기기 테스트는 별도입니다.' : '구조 검사 통과. 초안은 게시 완료/운영 준비 완료를 뜻하지 않습니다.');
