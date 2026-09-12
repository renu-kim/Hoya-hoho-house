#!/usr/bin/env node
/** Optional: write real canonical/OG URLs to static HTML for non-JS crawlers. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(ROOT,'assets/js/stay-data.js'),'utf8'),ctx,{timeout:1000});
const config=ctx.window.STAY_GUIDE;
const urlIndex=process.argv.indexOf('--url');
const value=urlIndex>=0 ? process.argv[urlIndex+1] : config.site.publicBaseUrl;
let base;
try {base=new URL(value);if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw new Error();if(!base.pathname.endsWith('/'))base.pathname+='/';}
catch {console.error('실제 HTTPS 배포 URL이 필요합니다. 예: node tools/prepare-meta.cjs --url https://YOUR-ID.github.io/stay-guide/');process.exit(1);}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages=[['','호야네 · 호호네'],['hoya',config.stays.hoya.name],['hoho',config.stays.hoho.name]];
for (const [slug,name] of pages) {
  const file=path.join(ROOT,slug,'index.html'),url=new URL(slug ? slug+'/' : './',base).href;
  const og=new URL(`assets/images/${slug==='hoho'?'hoho':'hoya'}/og.png`,base).href;
  const description=`${name}의 오시는 길, 주차, 입실·퇴실, 시설 이용 안내를 확인하세요.`;
  let html=fs.readFileSync(file,'utf8');
  html=html.replace(/<title>.*?<\/title>/,`<title>${escape(name)} | 숙소 안내</title>`)
    .replace(/<meta property="og:title"[^>]*>/,`<meta property="og:title" content="${escape(name)} | 숙소 안내">`)
    .replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(description)}">`)
    .replace(/<meta property="og:description"[^>]*>/,`<meta property="og:description" content="${escape(description)}">`)
    .replace(/<!-- PUBLIC_META_START -->[\s\S]*?<!-- PUBLIC_META_END -->/,`<!-- PUBLIC_META_START -->\n  <link rel="canonical" href="${escape(url)}">\n  <meta property="og:url" content="${escape(url)}">\n  <meta property="og:image" content="${escape(og)}">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:image:alt" content="${escape(name)} 숙소 안내 — 브랜드 일러스트">\n  <!-- PUBLIC_META_END -->`);
  // Keep noindex by default: unlisted guest guide. noindex is NOT access control.
  fs.writeFileSync(file,html);
}
const errorPath=path.join(ROOT,'404.html');
fs.writeFileSync(errorPath,fs.readFileSync(errorPath,'utf8').replace(/const PUBLIC_BASE = .*?;/,`const PUBLIC_BASE = ${JSON.stringify(base.href)};`));
console.log(`메타데이터 갱신 완료: ${base.href}\nnoindex는 유지됩니다. 소스/페이지 접근을 제한하지 않습니다.\n공유 이미지 캐시와 카카오톡 미리보기는 실제 배포 후 별도로 확인하세요.`);
