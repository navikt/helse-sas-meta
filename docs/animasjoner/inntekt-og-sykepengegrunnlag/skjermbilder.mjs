import { chromium } from "playwright";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const mappe = path.dirname(fileURLToPath(import.meta.url));
const side = pathToFileURL(path.join(mappe, "index.html")).href;
const bilder = path.join(mappe, "skjermbilder");
const videoer = path.join(mappe, "video");
const VIEWPORT = { width: 1920, height: 1500 };

const modus = process.argv[2] ?? "bilder";
const kunScenario = process.argv[3];

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});

async function scenarioer(page) {
  await page.goto(side);
  const alle = await page.evaluate(() => window.skisse.scenarier());
  return kunScenario ? alle.filter((s) => s.id === kunScenario) : alle;
}

async function feilsjekk(page) {
  const feil = [];
  page.on("pageerror", (e) => feil.push(e.message));
  page.on("console", (m) => m.type() === "error" && feil.push(m.text()));
  return feil;
}

if (modus === "bilder") {
  await mkdir(bilder, { recursive: true });
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const feil = await feilsjekk(page);
  for (const { id, antall } of await scenarioer(page)) {
    for (let steg = 0; steg <= antall; steg++) {
      await page.goto(`${side}?scenario=${id}&steg=${steg}`);
      await page.waitForFunction(() => window.skisse.tilstand.ferdig);
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(bilder, `${id}-${String(steg).padStart(2, "0")}.png`), fullPage: true });
    }
  }
  console.log(feil.length ? `Feil i siden:\n${feil.join("\n")}` : "Ingen feil i siden");
}

if (modus === "g") {
  await mkdir(bilder, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
  const feil = await feilsjekk(page);
  const gside = pathToFileURL(path.join(mappe, "g-regulering.html")).href;
  await page.goto(gside);
  const antall = await page.evaluate(() => window.gregulering.antall);
  for (let steg = 1; steg <= antall; steg++) {
    await page.evaluate((s) => window.gregulering.visSteg(s), steg);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: path.join(bilder, `g-regulering-${String(steg).padStart(2, "0")}.png`), fullPage: true });
  }
  console.log(feil.length ? `Feil i siden:\n${feil.join("\n")}` : "Ingen feil i siden");
}

if (modus === "animasjon") {
  await mkdir(bilder, { recursive: true });
  const page = await browser.newPage({ viewport: VIEWPORT });
  const feil = await feilsjekk(page);
  const [{ id }] = await scenarioer(page);
  const steg = Number(process.argv[4] ?? 2);
  await page.goto(`${side}?scenario=${id}&steg=${steg - 1}`);
  await page.waitForFunction(() => window.skisse.tilstand.ferdig);
  await page.keyboard.press("ArrowRight");
  let forrige = 0;
  for (const ms of [400, 900, 1500, 2600, 4000]) {
    await page.waitForTimeout(ms - forrige);
    forrige = ms;
    await page.locator(".sider").screenshot({ path: path.join(bilder, `anim-${id}-${steg}-${ms}ms.png`) });
  }
  console.log(feil.length ? `Feil i siden:\n${feil.join("\n")}` : "Ingen feil i siden");
}

if (modus === "video") {
  await mkdir(videoer, { recursive: true });
  const fart = process.argv[4] ?? "1.5";
  const probe = await browser.newPage();
  const alle = await scenarioer(probe);
  await probe.close();
  for (const { id } of alle) {
    const context = await browser.newContext({ viewport: VIEWPORT, recordVideo: { dir: videoer, size: VIEWPORT } });
    const page = await context.newPage();
    const feil = await feilsjekk(page);
    await page.goto(`${side}?scenario=${id}&fart=${fart}&spill=1`);
    await page.waitForFunction(() => !window.skisse.tilstand.spiller && window.skisse.tilstand.ferdig, null, { timeout: 300_000 });
    await page.waitForTimeout(1500);
    const video = page.video();
    await context.close();
    const mål = path.join(videoer, `${id}.webm`);
    await rm(mål, { force: true });
    await rename(await video.path(), mål);
    console.log(`${id}: ${mål}${feil.length ? ` (feil: ${feil.join("; ")})` : ""}`);
  }
  for (const fil of await readdir(videoer)) if (!fil.endsWith(".webm")) await rm(path.join(videoer, fil));
}

await browser.close();
