/* Temp diagnostic: tools grid at mobile widths (Firefox floor is 500px). */
const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const path = require('path');

const BASE = 'http://localhost:3000';
const GECKO = path.join(__dirname, '..', 'node_modules', '.bin', 'geckodriver');

async function main() {
  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxService(new firefox.ServiceBuilder(GECKO))
    .build();
  try {
    for (const w of [500, 600, 768]) {
      await driver.manage().window().setRect({ width: w, height: 900 });
      await driver.get(`${BASE}/about.html`);
      await driver.sleep(1800);
      const info = await driver.executeScript(
        `return (() => {
           const grid = document.querySelector('.tools-section .svc-grid');
           const cells = Array.from(grid.querySelectorAll('.svc-cell'));
           const hs = cells.map((c) => c.getBoundingClientRect().height);
           const design = cells[1];
           const cols = design.querySelectorAll('.svc-items');
           const a = cols[0].getBoundingClientRect();
           const b = cols[1].getBoundingClientRect();
           const sideBySide = b.left >= a.right - 1 && Math.abs(a.top - b.top) < 2;
           const wrapped = b.top >= a.bottom - 1;
           // longest single-line check: any item wider than its cell content?
           const overflow = [];
           cells.forEach((c) => {
             c.querySelectorAll('.svc-items span').forEach((s) => {
               const r = s.getBoundingClientRect();
               if (r.width > c.getBoundingClientRect().width - 4) {
                 overflow.push(s.textContent + ':' + r.width.toFixed(0));
               }
             });
           });
           return {
             tracks: getComputedStyle(grid).gridTemplateColumns,
             heights: hs.map((v) => v.toFixed(0)),
             designSideBySide: sideBySide,
             designWrapped: wrapped,
             designListsW: [a.width.toFixed(0), b.width.toFixed(0)],
             overflowItems: overflow,
             cellW: cells[0].getBoundingClientRect().width.toFixed(0),
           };
         })()`
      );
      console.log('WIDTH', w, JSON.stringify(info));
    }
  } finally {
    await driver.quit();
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
