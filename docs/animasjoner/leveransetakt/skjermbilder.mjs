import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const mappe = path.dirname(fileURLToPath(import.meta.url));
const side = pathToFileURL(path.join(mappe, "index.html")).href;
const bilder = path.join(mappe, "skjermbilder");

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const feil = [];
page.on("pageerror", (e) => feil.push(e.message));
page.on("console", (m) => m.type() === "error" && feil.push(m.text()));

await mkdir(bilder, { recursive: true });
await page.goto(side);
const antall = await page.evaluate(() => window.takt.antall);
for (let l = 0; l < antall; l++) {
  const steg = await page.evaluate((i) => window.takt.steg(i), l);
  for (let s = 0; s <= steg; s++) {
    await page.evaluate(([i, j]) => window.takt.gaTil(i, j), [l, s]);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: path.join(bilder, `${String(l + 1).padStart(2, "0")}-${s}.png`) });
  }
}
console.log(feil.length ? `Feil i siden:\n${feil.join("\n")}` : "Ingen feil i siden");
await browser.close();
