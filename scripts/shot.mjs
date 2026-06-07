import { chromium } from "playwright";

const base = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});

async function go(path, waitText) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  if (waitText) {
    await page.getByText(waitText, { exact: false }).first().waitFor({ timeout: 15000 });
  }
  await page.waitForTimeout(700);
}

async function shot(file) {
  await page.screenshot({ path: file, fullPage: true });
  console.log("saved", file);
}

// 1. Dashboard
await go("/", "Class Dashboard");
await shot("/tmp/shot-dashboard.png");

// 2. Student profile (Sofia — focus skill: schwa)
await go("/students/sofia", "Skill profile");
await shot("/tmp/shot-student.png");

// 3. Groups
await go("/groups", "Suggested by shared gap");
await shot("/tmp/shot-groups.png");

// 4. Library
await go("/library", "Passage Library");
await shot("/tmp/shot-library.png");

// 5. Passage reader with running-record mode on + a few miscues marked
await go("/passages/bioluminescence", "Vocabulary");
await page.getByRole("button", { name: /Record a reading/i }).click();
await page.waitForTimeout(400);
// mark a few words as miscues by tapping them
const words = page.locator("p span.cursor-pointer");
const count = await words.count();
for (const i of [5, 12, 23, 40]) {
  if (i < count) {
    await words.nth(i).click();
    if (i === 12) await words.nth(i).click(); // cycle to a second miscue type
  }
}
await page.waitForTimeout(400);
await shot("/tmp/shot-reader.png");

await browser.close();
console.log("done");
