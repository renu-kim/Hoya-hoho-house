#!/usr/bin/env python3
"""Offline Chromium DOM tests. No real GitHub, map, telephone or messaging calls.
Run: python tools/test_browser.py [--output /path/to/test-results.json]
Requires playwright and Chromium in the development environment, not for hosting.
The harness supplies a simulated page URL/storage/browser capabilities so it also
works in an isolated renderer where file/HTTP page navigation is unavailable.
"""
from pathlib import Path
import argparse, base64, json, os, shutil, sys
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / 'assets/css/style.css').read_text(encoding='utf-8')
APP = (ROOT / 'assets/js/app.js').read_text(encoding='utf-8')
DATA = (ROOT / 'assets/js/stay-data.js').read_text(encoding='utf-8')
ASSETS = {p.relative_to(ROOT).as_posix(): 'data:image/svg+xml;base64,' + base64.b64encode(p.read_bytes()).decode()
          for p in (ROOT / 'assets/images').rglob('*.svg')}
RESULTS = []
ALL_ERRORS = []

def check(name, assertion, detail=''):
    try:
        assert assertion, detail or name
        RESULTS.append({'test': name, 'status': 'PASS', 'detail': detail})
    except AssertionError as error:
        RESULTS.append({'test': name, 'status': 'FAIL', 'detail': str(error)})

def render(browser, slug='hoya', base='https://guide.example.invalid/stay-guide/',
           query='', fragment='', preview=False, ls=None, ss=None, mutation='',
           clipboard='success', share='none', secure=True):
    page = browser.new_page(viewport={'width':1440,'height':1080})
    page.set_default_timeout(6000)
    errors=[]
    page.on('pageerror', lambda error: (errors.append(str(error)), ALL_ERRORS.append(str(error))))
    url=base + (slug+'/' if slug else '') + query + fragment
    u=urlsplit(url)
    loc={'href':url, 'protocol':u.scheme+':', 'pathname':u.path, 'search':query, 'hash':fragment}
    setup = f'''
window.STAY_PREVIEW={str(preview).lower()};
window.STAY_PREVIEW_ASSETS={json.dumps(ASSETS)};
{DATA}
{mutation}
window.__redirect = null; window.__clipboard = []; window.__history = []; window.__share = [];
window.__lsValues={json.dumps(ls or {})}; window.__ssValues={json.dumps(ss or {})};
const store = values => ({{getItem:key=>values[key] ?? null,setItem:(key,val)=>values[key]=String(val),removeItem:key=>delete values[key]}});
const loc={json.dumps(loc)}; loc.replace=url=>window.__redirect=url;
const hist={{replaceState:(_a,_b,url)=>window.__history.push(url)}};
const nav={{}};
const clipboardMode={json.dumps(clipboard)};
if(clipboardMode!=='none') nav.clipboard={{writeText:async value=>{{if(clipboardMode==='deny')throw new DOMException('Denied','NotAllowedError');window.__clipboard.push(value);}}}};
const shareMode={json.dumps(share)};
if(shareMode!=='none') nav.share=async data=>{{window.__share.push(data);if(shareMode==='abort')throw new DOMException('Cancelled','AbortError');}};
const doc = new Proxy(document,{{get(target,key){{if(key==='currentScript')return {{src:{json.dumps(base+'assets/js/app.js')}}};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}},set(target,key,value){{return Reflect.set(target,key,value,target);}}}});
const win = new Proxy(window,{{get(target,key){{if(key==='isSecureContext')return {str(secure).lower()};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}},set(target,key,value){{return Reflect.set(target,key,value,target);}}}});
(function(location,history,localStorage,sessionStorage,navigator,document,window){{
{APP}
}})(loc,hist,store(window.__lsValues),store(window.__ssValues),nav,doc,win);
'''
    html=f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>{CSS}</style></head><body data-stay="{slug or "home"}"><div id="app"></div><script>{setup}</script></body></html>'
    page.set_content(html,wait_until='load')
    page.wait_for_timeout(30)
    return page, errors

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output', type=Path)
    args=parser.parse_args()
    with sync_playwright() as p:
        executable=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('chromium-browser')
        kwargs={'headless':True}
        if executable: kwargs['executable_path']=executable
        browser=p.chromium.launch(**kwargs)
        prefix='stay-guide:/stay-guide/:'
        for slug,name in [('hoya','호야네'),('hoho','호호네')]:
            page,_=render(browser,slug,ls={prefix+'recent':'hoho' if slug=='hoya' else 'hoya'})
            check(f'{name} 직접 진입: 최근 선택보다 경로 우선',page.locator('.switcher [aria-current="page"]').inner_text().strip()==name and name in page.title())
            page.close()
        page,_=render(browser,'hoya',query='?stay=hoho')
        check('숙소 경로가 상충하는 쿼리보다 우선',page.locator('.switcher [aria-current="page"]').inner_text().strip()=='호야네')
        page.close()
        page,_=render(browser,'',query='?stay=hoho',fragment='#parking')
        check('루트 쿼리 링크 정규화 및 앵커 유지',page.evaluate('window.__redirect')=='https://guide.example.invalid/stay-guide/hoho/#parking')
        page.close()
        page,_=render(browser,'',query='?stay=unknown')
        check('알 수 없는 숙소: 임의 숙소 대신 선택 화면',page.locator('.stay-card').count()==2 and page.get_by_text('알 수 없는 숙소 링크예요.',exact=False).count()==1)
        page.close()
        for base in ['https://guide.example.invalid/','https://guide.example.invalid/nested/guest/']:
            page,_=render(browser,'hoya',base=base)
            check('베이스 경로 보존: '+urlsplit(base).path,page.locator('.switcher [data-route="hoho"]').get_attribute('href')==base+'hoho/')
            page.close()
        page,_=render(browser,'hoya',base='file:///local/stay-guide/')
        check('로컬 파일용 index.html 링크 생성',page.locator('.switcher [data-route="hoho"]').get_attribute('href')=='file:///local/stay-guide/hoho/index.html')
        page.close()
        page,_=render(browser,'hoya',preview=True)
        check('미입력 주소·전화·지도 버튼 안전 비활성화',page.locator('[data-action="copy-address"]').is_disabled() and page.locator('a[href^="tel:"]').count()==2 and page.locator('.map-actions button:disabled').count()==2)
        check('초안·실제 사진 아님 표시',page.locator('.draft-strip').is_visible() and '실제 숙소 사진이 아닙니다' in page.locator('.art-credit').inner_text())
        page.locator('#facility-0 summary').click()
        check('시설 사용법 펼치기',page.locator('#facility-0').evaluate('(e)=>e.open'))
        page.locator('[data-action="search"]').click()
        page.locator('#global-search').fill('바비큐')
        check('전체 안내 검색',page.locator('#search-results [data-search-target="facility-3"]').count()==1)
        page.locator('#search-results [data-search-target="facility-3"]').click()
        check('검색 결과: 해당 안내 열기·포커스',page.locator('#facility-3').evaluate('(e)=>e.open') and page.locator('#facility-3 summary').evaluate('(e)=>e===document.activeElement'))
        page.locator('#faq-search').fill('존재하지않는질문123')
        check('FAQ 검색: 결과 없음 상태',page.locator('#faq-empty').is_visible() and page.locator('#faq-list').is_hidden())
        page.locator('#faq-search').fill('입실')
        check('FAQ 검색: 일치 질문 표시',page.locator('#faq-list details:not([hidden])').count()>0)
        page.locator('#faq-search').fill('')
        page.locator('[data-category="카페"]').click()
        check('주변 카테고리 선택·빈 상태',page.locator('[data-category][aria-pressed="true"]').count()==1 and '카페 정보를 준비' in page.locator('#nearby-results').inner_text())
        page.locator('[data-checkout="0"]').check()
        check('퇴실 체크: 진행률·세션 저장',page.locator('#check-status').inner_text().startswith('1 / 3') and json.loads(page.evaluate('window.__ssValues')[prefix+'checkout:hoya'])[0])
        page.locator('.switcher [data-route="hoho"]').click()
        check('미리보기 숙소 전환 및 체크 분리',page.locator('[data-checkout="0"]').is_checked()==False and page.locator('.switcher [aria-current="page"]').inner_text().strip()=='호호네')
        page.locator('.switcher [data-route="hoya"]').click()
        check('숙소별 퇴실 체크 복원',page.locator('[data-checkout="0"]').is_checked())
        page.locator('[data-action="reset-checks"]').click()
        check('퇴실 체크 초기화',not page.locator('[data-checkout="0"]').is_checked())
        page.locator('.brand[data-route="home"]').click()
        check('기본 화면: 최근 숙소 표시·자동 전환 없음',page.locator('.stay-card').count()==2 and page.locator('.recent-label').count()==1 and page.evaluate('window.__redirect') is None)
        page.locator('.stay-card[data-route="hoya"]').click()
        for width in [320,360,390,600,768,1024,1440]:
            page.set_viewport_size({'width':width,'height':900})
            check(f'반응형 {width}px: 문서 가로 넘침 없음',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        page.emulate_media(reduced_motion='reduce')
        check('동작 줄이기 설정 반영',page.evaluate('getComputedStyle(document.documentElement).scrollBehavior')=='auto')
        page.set_viewport_size({'width':1440,'height':1080})
        states=page.locator('details').evaluate_all('(els)=>els.map(e=>e.open)')
        page.evaluate('window.dispatchEvent(new Event("beforeprint"))')
        check('인쇄 시 접힌 안내 전체 펼치기',all(page.locator('details').evaluate_all('(els)=>els.map(e=>e.open)')))
        page.evaluate('window.dispatchEvent(new Event("afterprint"))')
        check('인쇄 후 펼침 상태 복원',states==page.locator('details').evaluate_all('(els)=>els.map(e=>e.open)'))
        page.locator('[data-action="privacy"]').click()
        page.keyboard.press('Escape')
        check('모달 Escape 닫기·포커스 복귀',not page.locator('#privacy-dialog').evaluate('(e)=>e.open') and page.locator('[data-action="privacy"]').evaluate('(e)=>e===document.activeElement'))
        page.close()
        mutation='''
const s=window.STAY_GUIDE.stays.hoya;
s.address.road='테스트 전용 주소 (실제 숙소 아님)';
s.address.detail='테스트 상세';s.address.naverUrl='https://example.invalid/naver';s.address.kakaoUrl='javascript:alert(1)';
s.contact.phone='010-0000-0000';s.wifi.ssid='TEST-ONLY-WIFI';
s.gallery=[{src:'assets/images/hoya/cover.svg',alt:'테스트 사진 1',caption:'테스트 1'},{src:'assets/images/hoho/cover.svg',alt:'테스트 사진 2',caption:'테스트 2'}];
s.nearby=[{name:'검증용 관광 데이터',category:'관광',mapUrl:'https://example.invalid/tour'},{name:'검증용 카페 데이터',category:'카페',mapUrl:'https://example.invalid/cafe'}];
s.intro='<img src=x onerror="window.__xss=true">';
'''
        page,_=render(browser,mutation=mutation)
        check('텍스트 HTML 이스케이프·실행 차단',page.locator('img[src="x"]').count()==0 and page.evaluate('window.__xss===undefined'))
        check('전화·문자 번호 정규화',page.locator('a[href="tel:01000000000"]').count()>0 and page.locator('a[href="sms:01000000000"]').count()==1)
        check('외부 지도 링크 보안 속성·javascript URL 차단',page.locator('.map-actions a').count()==1 and page.locator('.map-actions a').get_attribute('rel')=='noopener noreferrer' and page.locator('.map-actions button').is_disabled())
        page.locator('[data-action="copy-address"]').click()
        page.wait_for_timeout(20)
        check('등록 주소 자동 복사',page.evaluate('window.__clipboard')[-1]=='테스트 전용 주소 (실제 숙소 아님) 테스트 상세')
        page.locator('[data-action="copy-wifi"]').click()
        page.wait_for_timeout(20)
        check('Wi-Fi 이름 복사 (비밀번호 없음)',page.evaluate('window.__clipboard')[-1]=='TEST-ONLY-WIFI')
        page.locator('[data-action="share"]').first.click()
        page.wait_for_timeout(20)
        check('네이티브 공유 미지원 시 설정된 호야네 URL 복사',page.evaluate('window.__clipboard')[-1]=='https://renu-kim.github.io/Hoya-hoho-house/hoya/')
        page.locator('[data-gallery="0"]').click()
        check('등록 사진 확대 모달',page.locator('#gallery-dialog').evaluate('(e)=>e.open') and page.locator('#gallery-count').inner_text()=='1 / 2')
        page.keyboard.press('ArrowRight')
        check('갤러리 키보드 다음 사진',page.locator('#gallery-count').inner_text()=='2 / 2')
        page.keyboard.press('Escape')
        check('갤러리 닫기·포커스 복귀',page.locator('[data-gallery="0"]').evaluate('(e)=>e===document.activeElement'))
        page.locator('[data-category="카페"]').click()
        check('등록된 주변 장소 카테고리 필터',page.locator('.place-card').count()==1 and '카페 데이터' in page.locator('.place-card').inner_text())
        page.close()
        page,_=render(browser,mutation=mutation,clipboard='deny')
        page.locator('[data-action="copy-address"]').click();page.wait_for_timeout(20)
        check('클립보드 거부 시 수동 복사·거짓 성공 없음',page.locator('#copy-dialog').evaluate('(e)=>e.open') and '테스트 전용 주소' in page.locator('#copy-value').input_value() and page.evaluate('window.__clipboard')==[])
        page.close()
        page,_=render(browser,share='abort')
        page.locator('[data-action="share"]').first.click();page.wait_for_timeout(20)
        check('사용자 공유 취소 시 강제 복사 안 함',page.evaluate('window.__clipboard')==[] and len(page.evaluate('window.__share'))==1)
        page.close()
        page,errors=render(browser,fragment='#%E0%A4%A')
        check('잘못 인코딩된 앵커가 앱을 중단하지 않음',not errors and page.locator('.guide-section').count()==9)
        page.close()
        project_base='https://renu-kim.github.io/Hoya-hoho-house/'
        for slug,name,other in [('hoya','호야네','hoho'),('hoho','호호네','hoya')]:
            page,_=render(browser,slug,base=project_base)
            check(f'{name} 실제 저장소 하위 경로 보존',page.locator(f'.switcher [data-route="{other}"]').get_attribute('href')==project_base+other+'/')
            page.locator('[data-action="share"]').first.click();page.wait_for_timeout(20)
            check(f'{name} 실제 배포 예정 주소 공유',page.evaluate('window.__clipboard')[-1]==project_base+slug+'/')
            page.close()
        browser.close()
    check('테스트 중 JavaScript 런타임 오류 없음',not ALL_ERRORS, '; '.join(ALL_ERRORS))
    report={'environment':'Offline Chromium DOM with simulated URLs, storage and clipboard/share; no live network navigation or native app launch',
            'passed':sum(r['status']=='PASS' for r in RESULTS),'failed':sum(r['status']=='FAIL' for r in RESULTS),'checks':RESULTS}
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 1 if report['failed'] else 0

if __name__=='__main__':
    sys.exit(main())
