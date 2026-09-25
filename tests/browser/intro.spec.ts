import { expect, test, type Page } from "@playwright/test";

const screenshots = {
  brand: "/tmp/studio-viana-phase-1-brand.png",
  circle: "/tmp/studio-viana-phase-1-circle.png",
  desktop: "/tmp/studio-viana-phase-1-desktop-full.png",
  dive: "/tmp/studio-viana-phase-1-dive.png",
  home: "/tmp/studio-viana-phase-1-home.png",
  light: "/tmp/studio-viana-phase-1-light.png",
  mobile: "/tmp/studio-viana-phase-1-mobile-full.png",
} as const;

interface ChromeTraceEvent {
  args?: { name?: string };
  dur?: number;
  name?: string;
  ph?: string;
  tdur?: number;
  tid?: number;
}

function monitorRuntime(page: Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    const text = message.text();
    if (text.includes("/_next/hmr") && text.includes("WebSocket")) return;
    if (
      message.type() === "error" ||
      message.type() === "warning" ||
      /hydration/i.test(text)
    ) {
      errors.push(`console:${message.type()}:${text}`);
    }
  });
  page.on("pageerror", (error) => errors.push(`pageerror:${error.message}`));
  page.on("response", (response) => {
    if (
      response.url().startsWith("http://localhost:3000") &&
      response.status() >= 400
    ) {
      errors.push(`response:${response.status()}:${response.url()}`);
    }
  });

  return errors;
}

async function markIntroSeen(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("studio-viana:intro-seen", "true");
  });
}

async function waitForIntro(page: Page) {
  await expect(page.locator("[data-preloader]")).toHaveCount(0, {
    timeout: 30_000,
  });
  await expect(page.getByTestId("intro-section")).toHaveAttribute(
    "data-intro-ready",
    "true",
  );
}

async function expectHealthyDocument(page: Page) {
  await expect(page.locator("body")).toContainText(
    "HANDCRAFTED CHENILLE FLORALS",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Where flowers become",
  );
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth ===
        document.documentElement.clientWidth,
    ),
  ).toBe(true);

  // Phase 2 intentionally lazy-loads below-fold About and Craft media. This
  // intro health check owns only the eager intro and Home hero surfaces; the
  // Phase 2 suite scrolls the full document and validates every image.
  const images = page.locator("[data-intro-mode] img, #home img");
  expect(await images.count()).toBeGreaterThan(0);
  await expect
    .poll(() =>
      images.evaluateAll((elements) =>
        elements.every((image) => {
          const element = image as HTMLImageElement;
          return element.complete && element.naturalWidth > 0;
        }),
      ),
    )
    .toBe(true);
}

async function introEndScroll(page: Page) {
  return page.evaluate(() => {
    const home = document.getElementById("home");
    if (!home) throw new Error("Home hero is missing");
    return Math.max(0, home.offsetTop - window.innerHeight);
  });
}

async function moveToProgress(page: Page, progress: number) {
  const end = await introEndScroll(page);
  await page.evaluate((top) => window.scrollTo({ top }), end * progress);
  await page.waitForTimeout(1_450);
}

async function flowerScale(page: Page) {
  return page.locator("[data-intro-flower]").evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    if (transform === "none") return 1;
    const matrix = new DOMMatrixReadOnly(transform);
    return Math.hypot(matrix.a, matrix.b);
  });
}

test("first visit reports real progress and honors the minimum loader time", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const startedAt = Date.now();

  await expect(page.locator("[data-preloader]")).toBeVisible();
  const frameBounds = await page
    .locator("[data-preloader-progress-track]")
    .boundingBox();
  expect(frameBounds).not.toBeNull();
  expect(frameBounds!.x).toBeGreaterThanOrEqual(30);
  await expect(page.getByText(/^\d{3}$/)).toHaveText("100", {
    timeout: 6_500,
  });
  await waitForIntro(page);

  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(350);
  expect(Date.now() - startedAt).toBeLessThan(1_600);
  expect(errors).toEqual([]);
});

test("desktop intro scrubs forward and backward through every visual state", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForIntro(page);
  await expectHealthyDocument(page);

  const intro = page.getByTestId("intro-section");
  await expect(intro).toHaveAttribute("data-intro-breakpoint", "desktop");
  await expect(intro).toHaveAttribute("data-pin-vh", "260");
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await expect(page.getByRole("button", { name: "Skip intro" })).toBeVisible();
  await page.screenshot({ path: screenshots.brand });

  await moveToProgress(page, 0.25);
  const revealScale = await page
    .locator("[data-intro-flower-mask]")
    .evaluate((element) => {
      const transform = getComputedStyle(element).transform;
      const matrix = new DOMMatrixReadOnly(transform);
      return Math.hypot(matrix.a, matrix.b);
    });
  expect(revealScale).toBeGreaterThan(0.05);
  expect(revealScale).toBeLessThan(0.5);
  await page.screenshot({ path: screenshots.circle });

  await moveToProgress(page, 0.64);
  const deepScale = await flowerScale(page);
  expect(deepScale).toBeGreaterThan(1.5);
  await page.screenshot({ path: screenshots.dive });

  await moveToProgress(page, 0.93);
  await expect(page.locator("[data-intro-light]")).not.toHaveCSS(
    "opacity",
    "0",
  );
  await page.screenshot({ path: screenshots.light });

  await moveToProgress(page, 0.4);
  const reverseScale = await flowerScale(page);
  expect(reverseScale).toBeLessThan(deepScale);
  await moveToProgress(page, 0);
  await expect(
    page
      .getByTestId("intro-section")
      .getByRole("img", { exact: true, name: "Studio Viana" }),
  ).not.toHaveCSS("opacity", "0");

  await page.evaluate(() => document.getElementById("home")?.scrollIntoView());
  await page.waitForTimeout(1_450);
  await expect(page.locator("#home [data-split-token]").first()).toHaveCSS(
    "opacity",
    "1",
  );
  const homeTokenOffset = await page
    .locator("#home [data-split-token]")
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element);
      if (style.transform === "none") return 0;
      return new DOMMatrixReadOnly(style.transform).m42;
    });
  expect(Math.abs(homeTokenOffset)).toBeLessThan(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.screenshot({ path: screenshots.home });
  await page.screenshot({ fullPage: true, path: screenshots.desktop });
  expect(errors).toEqual([]);
});

test("tablet and 320px mobile use their reduced layer contracts without overflow", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.setViewportSize({ width: 900, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForIntro(page);
  await expect(page.getByTestId("intro-section")).toHaveAttribute(
    "data-intro-breakpoint",
    "tablet",
  );
  await expect(page.getByTestId("intro-section")).toHaveAttribute(
    "data-pin-vh",
    "220",
  );
  expect(await page.locator("[data-intro-particle]").count()).toBe(6);
  await expectHealthyDocument(page);

  await page.setViewportSize({ width: 320, height: 760 });
  await page.reload({ waitUntil: "networkidle" });
  await waitForIntro(page);
  await expect(page.getByTestId("intro-section")).toHaveAttribute(
    "data-intro-breakpoint",
    "mobile",
  );
  await expect(page.getByTestId("intro-section")).toHaveAttribute(
    "data-pin-vh",
    "180",
  );
  expect(await page.locator("[data-intro-petal]").count()).toBe(1);
  await expect(
    page.getByRole("img", { name: /macro handcrafted/i }),
  ).toHaveAttribute("src", /closeup-flower/);

  const skipBounds = await page
    .getByRole("button", { name: "Skip intro" })
    .boundingBox();
  expect(skipBounds).not.toBeNull();
  expect(skipBounds!.x).toBeGreaterThanOrEqual(0);
  expect(skipBounds!.x + skipBounds!.width).toBeLessThanOrEqual(320);
  for (const element of await page
    .locator("[data-intro-brand-copy], [data-intro-poem-line]")
    .all()) {
    const bounds = await element.boundingBox();
    if (!bounds) continue;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  }
  await expectHealthyDocument(page);
  await page.screenshot({ fullPage: true, path: screenshots.mobile });
  expect(errors).toEqual([]);
});

test("desktop scrub completes without browser long tasks", async ({
  context,
  page,
}) => {
  test.skip(
    process.env.PLAYWRIGHT_PRODUCTION !== "true",
    "Long-task budgets must be measured against the production runtime.",
  );
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForIntro(page);
  const end = await introEndScroll(page);
  await page.waitForTimeout(1_000);

  const client = await context.newCDPSession(page);
  const traceEvents: ChromeTraceEvent[] = [];
  client.on("Tracing.dataCollected", ({ value }) => {
    traceEvents.push(...(value as ChromeTraceEvent[]));
  });
  await client.send("Tracing.start", {
    categories: "devtools.timeline,toplevel",
    options: "record-as-much-as-possible",
    transferMode: "ReportEvents",
  });

  for (let step = 0; step <= 20; step += 1) {
    await page.evaluate(
      ({ progress, scrollEnd }) => window.scrollTo(0, scrollEnd * progress),
      { progress: step / 20, scrollEnd: end },
    );
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1_250);
  const tracingComplete = new Promise<void>((resolve) => {
    client.once("Tracing.tracingComplete", () => resolve());
  });
  await client.send("Tracing.end");
  await tracingComplete;
  await client.detach();

  const mainThreadIds = new Set(
    traceEvents
      .filter(
        (event) =>
          event.name === "thread_name" && event.args?.name === "CrRendererMain",
      )
      .map((event) => event.tid)
      .filter((threadId): threadId is number => threadId !== undefined),
  );
  const mainThreadTasks = traceEvents.filter(
    (event) =>
      event.name === "ThreadControllerImpl::RunTask" &&
      event.ph === "X" &&
      event.tid !== undefined &&
      mainThreadIds.has(event.tid),
  );
  const cpuTimedTasks = mainThreadTasks.filter(
    (event): event is ChromeTraceEvent & { tdur: number } =>
      event.tdur !== undefined,
  );
  const longTasks = cpuTimedTasks
    .filter((event) => event.tdur >= 50_000)
    .map((event) => event.tdur / 1_000);

  expect(mainThreadTasks.length).toBeGreaterThan(0);
  expect(cpuTimedTasks.length).toBeGreaterThan(0);
  expect(longTasks).toEqual([]);
  expect(errors).toEqual([]);
});

test("skip intro reaches the Home hero and retires the control", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForIntro(page);

  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect
    .poll(
      () =>
        page
          .locator("#home")
          .evaluate((element) => Math.abs(element.getBoundingClientRect().top)),
      { timeout: 8_000 },
    )
    .toBeLessThan(6);
  await expect(page.getByRole("button", { name: "Skip intro" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test("reduced motion uses a static unpinned flow", async ({ page }) => {
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForIntro(page);

  await expect(page.getByTestId("intro-section")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveClass(/lenis-smooth/);
  await expect(
    page
      .getByTestId("intro-section")
      .getByRole("img", { exact: true, name: "Studio Viana" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: /macro handcrafted/i }),
  ).toBeVisible();
  await expect(page.locator("[data-intro-particles]")).toHaveCSS(
    "display",
    "none",
  );
  for (const token of await page.locator("#home [data-split-token]").all()) {
    await expect(token).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("reload preserves restored mid-intro and post-intro positions", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForIntro(page);
  const end = await introEndScroll(page);
  await page.evaluate((top) => window.scrollTo(0, top), end * 0.62);
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => window.scrollY);

  await page.reload({ waitUntil: "networkidle" });
  await waitForIntro(page);
  const after = await page.evaluate(() => window.scrollY);

  expect(before).toBeGreaterThan(0);
  expect(after).toBeGreaterThan(before * 0.65);

  await page.evaluate(() => document.getElementById("home")?.scrollIntoView());
  await page.waitForTimeout(1_450);
  const postIntroBefore = await page.evaluate(() => window.scrollY);
  await page.reload({ waitUntil: "networkidle" });
  await waitForIntro(page);
  const postIntroAfter = await page.evaluate(() => window.scrollY);

  expect(postIntroAfter).toBeGreaterThan(postIntroBefore * 0.8);
  await expect(page.locator("html")).toHaveAttribute(
    "data-intro-complete",
    "true",
  );
  await expect(page.getByRole("button", { name: "Skip intro" })).toHaveCount(0);
  expect(errors).toEqual([]);
});
