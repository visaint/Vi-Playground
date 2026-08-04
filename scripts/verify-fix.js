/* Verification: scrollbar-flash fix + 90vw tools grid.
 * Runs against the dev server on localhost:3000 (npm run dev).
 * Structure of the checks:
 *   1. #main computed overflow-y must be `visible` (root cause of the flash).
 *   2. #main computed overflow-x must be `clip`.
 *   3. No horizontal overflow at document level (html viewport).
 *   4. #main must NOT be scrollable (scrollTop mutation must not stick) —
 *      definitive "not a scroll container" test.
 *   5. The page itself must scroll via the viewport.
 * Plus width checks for the tools grid (90vw) and home services grid (unchanged).
 */
const { Builder, error } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const path = require('path');

const BASE = 'http://localhost:3000';
const GECKO = path.join(__dirname, '..', 'node_modules', '.bin', 'geckodriver');

const PAGES = ['index.html', 'work.html', 'services.html', 'about.html', 'contact.html'];
const WIDTHS = [
  { w: 1440, h: 900, label: 'desktop' },
  { w: 1024, h: 768, label: 'laptop' },
  { w: 768, h: 1024, label: 'tablet' },
  { w: 500, h: 900, label: 'mobile' },
];

const results = [];
let failures = 0;

function record(label, ok, detail) {
  results.push({ label, ok, detail });
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}  ${detail || ''}`);
}

async function newDriver() {
  return new Builder()
    .forBrowser('firefox')
    .setFirefoxService(new firefox.ServiceBuilder(GECKO))
    .build();
}

async function check(driver, label, fn) {
  try {
    const r = await fn();
    record(label, r.ok, r.detail);
  } catch (e) {
    record(label, false, 'exception: ' + e.message);
  }
}

async function withRetry(fn, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (e instanceof error.NoSuchWindowError) {
        console.log(`  ... window discarded, retrying (${i + 1}/${attempts})`);
      } else {
        throw e;
      }
    }
  }
  throw lastErr;
}

async function main() {
  let driver = await newDriver();
  try {
    for (const { w, h, label: wl } of WIDTHS) {
      await driver.manage().window().setRect({ width: w, height: h });
      await driver.sleep(150);

      for (const page of PAGES) {
        const ctx = `${wl} / ${page}`;
        try {
          await withRetry(async () => {
            await driver.get(`${BASE}/${page}`);
            await driver.sleep(1800);

            // 1) #main must not be a coerced scroll container.
            await check(driver, ctx + ' #main overflow-y visible', async () => {
              const oy = await driver.executeScript(
                `return getComputedStyle(document.getElementById('main')).overflowY`
              );
              return { ok: oy === 'visible', detail: `overflow-y=${oy}` };
            });

            // 2) #main overflow-x must be clip.
            await check(driver, ctx + ' #main overflow-x clip', async () => {
              const ox = await driver.executeScript(
                `return getComputedStyle(document.getElementById('main')).overflowX`
              );
              return { ok: ox === 'clip', detail: `overflow-x=${ox}` };
            });

            // 3) No horizontal overflow at document level.
            await check(driver, ctx + ' no horizontal doc overflow', async () => {
              const [sw, iw] = await driver.executeScript(
                `return [document.documentElement.scrollWidth, window.innerWidth]`
              );
              return { ok: sw <= iw, detail: `scrollWidth=${sw} innerWidth=${iw}` };
            });

            // 4) #main must not be scrollable (not a scroll container).
            await check(driver, ctx + ' #main not scrollable', async () => {
              const res = await driver.executeScript(
                `return (() => {
                   const m = document.getElementById('main');
                   m.scrollTop = 500;
                   m.scrollLeft = 500;
                   const st = m.scrollTop;
                   const sl = m.scrollLeft;
                   m.scrollTop = 0;
                   m.scrollLeft = 0;
                   return [st, sl];
                 })()`
              );
              return { ok: res[0] === 0 && res[1] === 0, detail: `scrollTop=${res[0]} scrollLeft=${res[1]}` };
            });

            // 5) Page actually scrolls via the viewport (html), not #main.
            await check(driver, ctx + ' viewport scrolling works', async () => {
              await driver.executeScript(`window.scrollTo(0, document.body.scrollHeight)`);
              await driver.sleep(300);
              const [sy, maxScroll] = await driver.executeScript(
                `return [window.scrollY, document.documentElement.scrollHeight - window.innerHeight]`
              );
              return { ok: sy > 50, detail: `scrollY=${sy} of ${maxScroll}` };
            });
          });
        } catch (e) {
          if (e instanceof error.NoSuchWindowError) {
            driver = await newDriver();
            record(ctx, false, 'window discarded after retries — session restarted');
          } else {
            throw e;
          }
        }
      }

      // Tools grid width on about.html.
      try {
        await withRetry(async () => {
          await driver.get(`${BASE}/about.html`);
          await driver.sleep(1500);
          await check(driver, `${wl} / about tools-section 90vw`, async () => {
            const [iw, secW] = await driver.executeScript(
              `return (() => {
                 const s = document.querySelector('.tools-section');
                 return [window.innerWidth, s.getBoundingClientRect().width];
               })()`
            );
            const target = iw * 0.9;
            const ok = Math.abs(secW - target) < 1.5;
            return { ok, detail: `width=${secW.toFixed(1)} target=${target.toFixed(1)} (90vw of ${iw})` };
          });
          await check(driver, `${wl} / about tools grid 90vw`, async () => {
            const [iw, gridW] = await driver.executeScript(
              `return (() => {
                 const g = document.querySelector('.tools-section .svc-grid');
                 return [window.innerWidth, g.getBoundingClientRect().width];
               })()`
            );
            const target = iw * 0.9;
            const ok = Math.abs(gridW - target) < 1.5;
            return { ok, detail: `grid width=${gridW.toFixed(1)} target=${target.toFixed(1)}` };
          });

          // 2 columns × 3 rows at every width, dividers only between items.
          await check(driver, `${wl} / about tools grid 2 columns`, async () => {
            const tracks = await driver.executeScript(
              `return getComputedStyle(document.querySelector('.tools-section .svc-grid')).gridTemplateColumns`
            );
            return { ok: tracks.split(' ').length === 2, detail: `tracks=${tracks}` };
          });

          await check(driver, `${wl} / about tools grid no outer frame`, async () => {
            const [bt, bb, bl, br] = await driver.executeScript(
              `return (() => {
                 const g = document.querySelector('.tools-section .svc-grid');
                 const s = getComputedStyle(g);
                 return [s.borderTopWidth, s.borderBottomWidth, s.borderLeftWidth, s.borderRightWidth];
               })()`
            );
            return { ok: bt === '0px' && bb === '0px' && bl === '0px' && br === '0px', detail: `t=${bt} b=${bb} l=${bl} r=${br}` };
          });

          await check(driver, `${wl} / about tools dividers only between items`, async () => {
            const borders = await driver.executeScript(
              `return (() => {
                 const cells = document.querySelectorAll('.tools-section .svc-cell');
                 return Array.from(cells).map((c) => {
                   const s = getComputedStyle(c);
                   return (s.borderRightWidth === '2px' && s.borderRightStyle === 'dashed' ? 'R' : '.') +
                          (s.borderBottomWidth === '2px' && s.borderBottomStyle === 'dashed' ? 'B' : '.');
                 });
               })()`
            );
            // Expected: 1 vertical rule on odd (left-column) cells;
            // 2 horizontal rules on the first four cells (row separators).
            const expected = ['RB', '.B', 'RB', '.B', 'R.', '..'];
            const ok = borders.every((b, i) => b === expected[i]);
            return { ok, detail: `borders=${JSON.stringify(borders)} expected=${JSON.stringify(expected)}` };
          });

          // Cards should be tight — no huge vertical slabs.
          await check(driver, `${wl} / about tools cards tight height`, async () => {
            const [maxH, minH] = await driver.executeScript(
              `return (() => {
                 const cells = document.querySelectorAll('.tools-section .svc-cell');
                 const hs = Array.from(cells).map((c) => c.getBoundingClientRect().height);
                 return [Math.max(...hs), Math.min(...hs)];
               })()`
            );
            const bound = w >= 601 ? 440 : 280;
            const ok = maxH < bound;
            return { ok, detail: `max card height=${maxH.toFixed(1)}px min=${minH.toFixed(1)}px (bound ${bound})` };
          });

          // All six cards must be the same size (equal height & width).
          await check(driver, `${wl} / about tools cards same size`, async () => {
            const [hs, ws] = await driver.executeScript(
              `return (() => {
                 const cells = document.querySelectorAll('.tools-section .svc-cell');
                 const hs = Array.from(cells).map((c) => c.getBoundingClientRect().height);
                 const ws = Array.from(cells).map((c) => c.getBoundingClientRect().width);
                 return [hs, ws];
               })()`
            );
            const hSpread = Math.max(...hs) - Math.min(...hs);
            const wSpread = Math.max(...ws) - Math.min(...ws);
            const ok = hSpread < 1.5 && wSpread < 1.5;
            return { ok, detail: `height spread=${hSpread.toFixed(2)}px width spread=${wSpread.toFixed(2)}px (heights ${hs.map((v) => v.toFixed(0)).join(',')})` };
          });

          // Design's long list is split into two side-by-side sections.
          await check(driver, `${wl} / about tools Design split into 2`, async () => {
            const info = await driver.executeScript(
              `return (() => {
                 const cell = document.querySelectorAll('.tools-section .svc-cell')[1];
                 const cols = cell.querySelector('.svc-items-cols');
                 if (!cols) return { ok: false, detail: 'no .svc-items-cols' };
                 const lists = cols.querySelectorAll('.svc-items');
                 if (lists.length !== 2) return { ok: false, detail: 'lists=' + lists.length };
                 const counts = Array.from(lists).map((l) => l.querySelectorAll('span').length);
                 const a = lists[0].getBoundingClientRect();
                 const b = lists[1].getBoundingClientRect();
                 const sideBySide = b.left >= a.right - 1 && Math.abs(a.top - b.top) < 2;
                 const fits = b.right <= cell.getBoundingClientRect().right + 1 &&
                              a.left >= cell.getBoundingClientRect().left - 1;
                 return { ok: sideBySide && fits && counts[0] === 4 && counts[1] === 4,
                          detail: 'counts=' + JSON.stringify(counts) + ' sideBySide=' + sideBySide + ' fits=' + fits };
               })()`
            );
            return { ok: info.ok, detail: info.detail };
          });

          // Bullet list centred as a block, lines left-aligned.
          await check(driver, `${wl} / about tools bullets centred-left`, async () => {
            const info = await driver.executeScript(
              `return (() => {
                 const card = document.querySelector('.tools-section .svc-front');
                 const block = card.querySelector('.svc-items-cols') || card.querySelector('.svc-items');
                 const firstItems = card.querySelector('.svc-items');
                 const cardR = card.getBoundingClientRect();
                 const blockR = block.getBoundingClientRect();
                 const align = getComputedStyle(firstItems);
                 const centerDiff = Math.abs((cardR.left + cardR.width / 2) - (blockR.left + blockR.width / 2));
                 return { centerDiff, alignItems: align.alignItems, textAlign: align.textAlign,
                          detail: 'centerDiff=' + centerDiff.toFixed(1) + ' alignItems=' + align.alignItems +
                                  ' textAlign=' + align.textAlign };
               })()`
            );
            const ok = info.centerDiff < 12 && info.alignItems === 'flex-start' && info.textAlign === 'left';
            return { ok, detail: info.detail };
          });

          // X/O marks: bottom-right corner of the card, a little way off it.
          await check(driver, `${wl} / about tools X/O bottom-right`, async () => {
            const pos = await driver.executeScript(
              `return (() => {
                 const c = document.querySelector('.tools-section .svc-cell');
                 const cs = getComputedStyle(c, '::before');
                 const b = parseFloat(cs.bottom);
                 const r = parseFloat(cs.right);
                 const off = !isNaN(b) && !isNaN(r) && b >= 8 && b <= 40 && r >= 8 && r <= 40;
                 return { off, top: cs.top,
                          detail: 'bottom=' + cs.bottom + ' right=' + cs.right + ' top=' + cs.top };
               })()`
            );
            const ok = pos.off && pos.top === 'auto';
            return { ok, detail: pos.detail };
          });

          // Back card: tapping it flips back to the front (and vice versa).
          await check(driver, `${wl} / about tools tap toggles slide`, async () => {
            const res = await driver.executeScript(
              `return (() => {
                 const cell = document.querySelectorAll('.tools-section .svc-cell')[0];
                 const toggle = cell.querySelector('.svc-toggle');
                 const slide = cell.querySelector('.svc-slide');
                 toggle.checked = true;
                 slide.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                 return { checked: toggle.checked };
               })()`
            );
            return { ok: res.checked === false, detail: `checked=${res.checked}` };
          });
        });
      } catch (e) {
        if (e instanceof error.NoSuchWindowError) driver = await newDriver();
        else throw e;
      }

      // Home services grid unchanged on index.html.
      try {
        await withRetry(async () => {
          await driver.get(`${BASE}/index.html`);
          await driver.sleep(1500);
          await check(driver, `${wl} / index services grid unchanged`, async () => {
            const [gridW, parentContent] = await driver.executeScript(
              `return (() => {
                 const g = document.getElementById('svc-grid');
                 const p = g.parentElement;
                 const ps = getComputedStyle(p);
                 const content =
                   p.getBoundingClientRect().width -
                   parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight);
                 return [g.getBoundingClientRect().width, content];
               })()`
            );
            const expected = Math.min(1080, parentContent);
            const ok = Math.abs(gridW - expected) < 1.5;
            return { ok, detail: `grid width=${gridW.toFixed(1)} expected=${expected.toFixed(1)} (min(1080px, wrapper))` };
          });
          if (w >= 601) {
            await check(driver, `${wl} / index services grid still 3 columns`, async () => {
              const tracks = await driver.executeScript(
                `return getComputedStyle(document.getElementById('svc-grid')).gridTemplateColumns`
              );
              return { ok: tracks.split(' ').length === 3, detail: `tracks=${tracks}` };
            });
            await check(driver, `${wl} / index services grid keeps frame`, async () => {
              const [bt, bb] = await driver.executeScript(
                `return (() => {
                   const g = document.getElementById('svc-grid');
                   const s = getComputedStyle(g);
                   return [s.borderTopStyle, s.borderBottomStyle];
                 })()`
              );
              return { ok: bt === 'dashed' && bb === 'dashed', detail: `top=${bt} bottom=${bb}` };
            });
          }
        });
      } catch (e) {
        if (e instanceof error.NoSuchWindowError) driver = await newDriver();
        else throw e;
      }
    }

    // Contact page: repeated scroll to form — check stability of scroll metrics.
    try {
      await withRetry(async () => {
        await driver.manage().window().setRect({ width: 1440, height: 900 });
        await driver.get(`${BASE}/contact.html`);
        await driver.sleep(1500);
        await check(driver, 'contact / scroll to form stable', async () => {
          const formTop = await driver.executeScript(
            `return document.getElementById('contact-form-section').getBoundingClientRect().top + window.scrollY`
          );
          const before = await driver.executeScript(
            `return (() => {
               const m = document.getElementById('main');
               return [m.clientHeight, m.scrollHeight, window.innerWidth,
                       document.documentElement.scrollWidth];
             })()`
          );
          for (let i = 0; i < 6; i++) {
            await driver.executeScript(`window.scrollTo(0, ${formTop + 40})`);
            await driver.sleep(120);
            await driver.executeScript(`window.scrollTo(0, 0)`);
            await driver.sleep(120);
          }
          const after = await driver.executeScript(
            `return (() => {
               const m = document.getElementById('main');
               return [m.clientHeight, m.scrollHeight, window.innerWidth,
                       document.documentElement.scrollWidth];
             })()`
          );
          const stable = before.every((v, i) => v === after[i]);
          const oy = await driver.executeScript(
            `return getComputedStyle(document.getElementById('main')).overflowY`
          );
          return {
            ok: stable && oy === 'visible',
            detail: `metrics stable=${stable} overflow-y=${oy} before=[${before}] after=[${after}]`,
          };
        });
      });
    } catch (e) {
      if (!(e instanceof error.NoSuchWindowError)) throw e;
    }
  } finally {
    await driver.quit();
  }

  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'} (${results.length} checks)`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('Script error:', e);
  process.exit(2);
});
