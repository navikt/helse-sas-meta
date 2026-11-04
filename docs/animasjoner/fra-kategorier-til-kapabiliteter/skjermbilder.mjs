import { chromium } from "playwright";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// Bruk: node skjermbilder.mjs [bilder|animasjon|video]
// Sett CHROME=<sti> hvis Playwright-nettleseren ikke er installert.
const mappe = path.dirname(fileURLToPath(import.meta.url));
const side = pathToFileURL(path.join(mappe, "index.html")).href;
const bilder = path.join(mappe, "skjermbilder");
const videoer = path.join(mappe, "video");
const VIEWPORT = { width: 1600, height: 900 };
const modus = process.argv[2] ?? "bilder";

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});

function feilsjekk(page) {
  const feil = [];
  page.on("pageerror", (e) => feil.push(e.message));
  page.on("console", (m) => m.type() === "error" && feil.push(m.text()));
  return feil;
}
const rapport = (feil) => console.log(feil.length ? `Feil i siden:\n${feil.join("\n")}` : "Ingen feil i siden");

if (modus === "bilder") {
  await mkdir(bilder, { recursive: true });
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const feil = feilsjekk(page);
  for (let n = 1; n <= 6; n++) {
    await page.goto(`${side}?kapittel=${n}&t=999999`);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(bilder, `kapittel-${n}.png`) });
  }
  for (const valg of ["inaktiv", "fl", "dagpenger", "bladb", "sn", "at", "inaktiv,dagpenger,verneplikt", "yrkesskade"]) {
    await page.goto(`${side}?kapittel=6&t=999999&kategorier=${valg}`);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(bilder, `velg-${valg.replaceAll(",", "+")}.png`) });
  }
  await page.goto(`${side}?kapittel=6&t=999999&kategorier=fl`);
  await page.waitForTimeout(300);
  await page.locator('[data-kategori="kombsn"]').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(bilder, "klikk-fl+kombsn.png") });
  rapport(feil);
}

if (modus === "animasjon") {
  await mkdir(bilder, { recursive: true });
  const page = await browser.newPage({ viewport: VIEWPORT });
  const feil = feilsjekk(page);
  for (let n = 1; n <= 6; n++) {
    await page.goto(`${side}?kapittel=${n}`);
    let forrige = 0;
    for (const ms of [700, 1600, 3200, 5000]) {
      await page.waitForTimeout(ms - forrige);
      forrige = ms;
      await page.screenshot({ path: path.join(bilder, `anim-${n}-${ms}ms.png`) });
    }
  }
  rapport(feil);
}

if (modus === "video") {
  await mkdir(videoer, { recursive: true });
  const context = await browser.newContext({ viewport: VIEWPORT, recordVideo: { dir: videoer, size: VIEWPORT } });
  const page = await context.newPage();
  const feil = feilsjekk(page);
  await page.goto(`${side}?auto=1&demo=1`);
  await page.waitForFunction(() => window.skisse.tilstand.alleFerdig, null, { timeout: 300_000 });
  await page.waitForTimeout(1500);
  const video = page.video();
  await context.close();
  const mål = path.join(videoer, "fra-kategorier-til-kapabiliteter.webm");
  await rm(mål, { force: true });
  await rename(await video.path(), mål);
  for (const fil of await readdir(videoer)) if (!fil.endsWith(".webm")) await rm(path.join(videoer, fil));
  console.log(mål);
  rapport(feil);
}

await browser.close();
