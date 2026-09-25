import { expect, test, type Page } from "@playwright/test";

async function markIntroSeen(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("studio-viana:intro-seen", "true");
  });
}

async function waitForIntro(page: Page) {
  await expect(page.locator("[data-preloader]")).toHaveCount(0, {
    timeout: 10_000,
  });
  await expect(page.getByTestId("intro-section")).toHaveAttribute(
    "data-intro-ready",
    "true",
  );
}

async function introEnd(page: Page) {
  return page.evaluate(() => {
    const home = document.getElementById("home");
    if (!home) throw new Error("Home section is missing");
    return Math.max(0, home.offsetTop - window.innerHeight);
  });
}

test("first paint becomes interactive quickly and has no missing assets", async ({
  page,
}) => {
  const failedResponses: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.url()}`);
    }
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const startedAt = Date.now();

  await waitForIntro(page);

  expect(Date.now() - startedAt).toBeLessThan(1_600);
  expect(failedResponses).toEqual([]);
});

test("flower dive stays on compositor-friendly properties and reveals poetry", async ({
  page,
}) => {
  await markIntroSeen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForIntro(page);

  const mask = page.locator("[data-intro-flower-mask]");
  await expect(mask).toHaveCSS("clip-path", "none");
  await expect(page.locator("[data-intro-flower]")).toHaveCSS("filter", "none");
  await expect(page.locator("[data-intro-middle]")).toHaveCount(0);
  await expect(page.locator("[data-intro-petal]").first()).toHaveCSS(
    "filter",
    "none",
  );

  const end = await introEnd(page);
  await page.evaluate((top) => window.scrollTo(0, top), end * 0.6);
  await page.waitForTimeout(700);

  const visiblePoems = await page
    .locator("[data-intro-poem-line]")
    .evaluateAll(
      (lines) =>
        lines.filter((line) => Number(getComputedStyle(line).opacity) > 0.2)
          .length,
    );
  expect(visiblePoems).toBeGreaterThan(0);
  await expect(mask).toHaveCSS("clip-path", "none");
});

test("desktop dive stays close to the 60fps frame budget", async ({ page }) => {
  await markIntroSeen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForIntro(page);
  const end = await introEnd(page);

  const frameTimes = await page.evaluate(async (scrollEnd) => {
    const samples: number[] = [];
    let frame = 0;
    let previous = performance.now();

    await new Promise<void>((resolve) => {
      const sample = (now: number) => {
        if (frame > 0) samples.push(now - previous);
        previous = now;
        window.scrollTo(0, scrollEnd * (frame / 90));
        frame += 1;
        if (frame <= 90) requestAnimationFrame(sample);
        else resolve();
      };
      requestAnimationFrame(sample);
    });

    return samples.sort((a, b) => a - b);
  }, end);
  const p95 = frameTimes[Math.floor(frameTimes.length * 0.95)];

  expect(frameTimes).toHaveLength(90);
  expect(p95).toBeLessThan(25);
});

test("dark OS mode keeps light-section controls readable", async ({ page }) => {
  await markIntroSeen(page);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForIntro(page);

  for (const [section, role, label] of [
    ["#home", "link", "Order on WhatsApp"],
    ["#process", "link", "Start your order"],
    ["#gallery", "button", "View more pieces"],
    ["#instagram", "link", "Follow on Instagram"],
  ] as const) {
    const control = page.locator(section).getByRole(role, { name: label });
    await control.scrollIntoViewIfNeeded();
    await expect(control).toHaveCSS("color", "rgb(42, 42, 38)");
  }
});

test("touch devices use native scrolling and keep content inside the viewport", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 320, height: 760 },
  });
  const page = await context.newPage();
  await markIntroSeen(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForIntro(page);

  await expect(page.locator("html")).not.toHaveClass(/lenis-smooth/);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth ===
        document.documentElement.clientWidth,
    ),
  ).toBe(true);

  const end = await introEnd(page);
  await page.evaluate((top) => window.scrollTo(0, top), end * 0.6);
  await page.waitForTimeout(500);
  const poemBounds = await page
    .locator("[data-intro-poem-line]")
    .filter({ hasText: "petal by petal" })
    .boundingBox();
  expect(poemBounds).not.toBeNull();
  expect(poemBounds!.x).toBeGreaterThanOrEqual(0);
  expect(poemBounds!.x + poemBounds!.width).toBeLessThanOrEqual(320);

  await context.close();
});
