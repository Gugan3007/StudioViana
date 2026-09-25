import { expect, test, type Browser, type Page } from "@playwright/test";

interface TraceEvent {
  args?: { name?: string };
  dur?: number;
  name?: string;
  ph?: string;
  tdur?: number;
  tid?: number;
}

const screenshots = {
  gallery: "/tmp/studio-viana-phase-4-gallery.png",
  instagram: "/tmp/studio-viana-phase-4-instagram.png",
  mobile: "/tmp/studio-viana-phase-4-mobile.png",
  process: "/tmp/studio-viana-phase-4-process.png",
  testimonials: "/tmp/studio-viana-phase-4-testimonials.png",
  upClose: "/tmp/studio-viana-phase-4-up-close.png",
} as const;

test.describe.configure({ timeout: 90_000 });

function monitorRuntime(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    const text = message.text();
    if (text.includes("/_next/hmr") && text.includes("WebSocket")) return;
    if (message.type() === "error" || /hydration/i.test(text)) {
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

async function waitForPage(page: Page) {
  await expect(page.locator("[data-preloader]")).toHaveCount(0, {
    timeout: 30_000,
  });
  await expect(page.getByTestId("intro-section")).toHaveAttribute(
    "data-intro-ready",
    "true",
  );
}

async function openPage(page: Page, reduced = false) {
  await markIntroSeen(page);
  await page.emulateMedia({
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForPage(page);
}

async function createTouchPage(
  browser: Browser,
  viewport = { height: 780, width: 320 },
) {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
    viewport,
  });
  const page = await context.newPage();
  await markIntroSeen(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForPage(page);
  return { context, page };
}

test("desktop craft chapters draw, reverse, switch theme and match the editorial rhythm", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ height: 1000, width: 1440 });
  await openPage(page);

  const closeup = page.locator("#craft-closeup");
  await closeup.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, innerHeight * 0.75));
  await expect(
    closeup.getByRole("heading", { name: "Every fibre, shaped by hand." }),
  ).toBeVisible();
  await expect(closeup.locator("[data-annotation-callout]")).toHaveCount(3);
  await expect(page.getByRole("banner")).toHaveAttribute(
    "data-nav-theme",
    "dark",
  );
  await expect
    .poll(() =>
      closeup
        .locator("img")
        .evaluateAll((images) =>
          images.every((image) => (image as HTMLImageElement).complete),
        ),
    )
    .toBe(true);
  await page.screenshot({ path: screenshots.upClose });

  const process = page.locator("#process");
  const processTop = await process.evaluate(
    (element) => element.getBoundingClientRect().top + scrollY,
  );
  const processBottom = await process.evaluate(
    (element) => element.getBoundingClientRect().bottom + scrollY - innerHeight,
  );
  await page.evaluate((top) => window.scrollTo(0, top), processTop);
  await page.waitForTimeout(350);
  const stem = process.locator("[data-stem-path]");
  await expect(stem).toHaveAttribute("d", /C/);
  const initialOffset = await stem.evaluate((path) =>
    Number.parseFloat(getComputedStyle(path).strokeDashoffset || "0"),
  );
  await page.evaluate((bottom) => window.scrollTo(0, bottom), processBottom);
  await page.waitForTimeout(350);
  const forwardOffset = await stem.evaluate((path) =>
    Number.parseFloat(getComputedStyle(path).strokeDashoffset || "0"),
  );
  await page.evaluate((top) => window.scrollTo(0, top), processTop);
  await page.waitForTimeout(350);
  const reverseOffset = await stem.evaluate((path) =>
    Number.parseFloat(getComputedStyle(path).strokeDashoffset || "0"),
  );
  expect(Number.isFinite(initialOffset)).toBe(true);
  expect(Number.isFinite(forwardOffset)).toBe(true);
  expect(Number.isFinite(reverseOffset)).toBe(true);
  expect(forwardOffset).toBeLessThanOrEqual(initialOffset);
  expect(reverseOffset).toBeGreaterThanOrEqual(forwardOffset);
  await page.screenshot({ path: screenshots.process });
  expect(errors).toEqual([]);
});

test("tablet craft annotations remain inside the visible section", async ({
  page,
}) => {
  await markIntroSeen(page);
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const width of [768, 1024, 1280]) {
    await page.setViewportSize({ height: 900, width });
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPage(page);
    const closeup = page.locator("#craft-closeup");
    await closeup.scrollIntoViewIfNeeded();
    for (const callout of await closeup
      .locator("[data-annotation-callout]")
      .all()) {
      const bounds = await callout.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    }
  }
});

test("gallery filters, loads, navigates, zooms and hands one dialog to product detail", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ height: 1000, width: 1440 });
  await openPage(page, true);
  const gallery = page.locator("#gallery");
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery.locator("[data-gallery-item]")).toHaveCount(12);
  await gallery.getByRole("button", { name: "Hampers" }).click();
  await expect(
    gallery.locator('[data-gallery-category="Hampers"]'),
  ).toHaveCount(2);
  await gallery.getByRole("button", { exact: true, name: "All" }).click();
  await gallery.getByRole("button", { name: "View more pieces" }).click();
  await expect(gallery.locator("[data-gallery-item]")).toHaveCount(18);
  await expect
    .poll(() =>
      gallery
        .locator("[data-gallery-item] img")
        .evaluateAll((images) =>
          images.every((image) => (image as HTMLImageElement).complete),
        ),
    )
    .toBe(true);
  await page.screenshot({ path: screenshots.gallery });

  await gallery.getByRole("button", { name: "Occasions" }).click();
  await expect(
    gallery.locator('[data-gallery-category="Occasions"]'),
  ).toHaveCount(4);
  await gallery
    .locator('[data-gallery-category="Occasions"]')
    .first()
    .getByRole("button")
    .click();
  let lightbox = page.getByRole("dialog", { name: /Gallery lightbox/ });
  await expect(lightbox.getByTestId("lightbox-counter")).toHaveText(
    /01\s*\/\s*04/,
  );
  await page.keyboard.press("ArrowRight");
  await expect(lightbox.getByTestId("lightbox-counter")).toHaveText(
    /02\s*\/\s*04/,
  );
  await page.keyboard.press("Escape");
  await gallery.getByRole("button", { exact: true, name: "All" }).click();
  await expect(gallery.locator("[data-gallery-item]")).toHaveCount(18);

  const trigger = gallery.getByRole("button", {
    name: "Open A Note in Bloom in gallery",
  });
  await trigger.click();
  lightbox = page.getByRole("dialog", { name: /Gallery lightbox/ });
  await expect(lightbox).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("ArrowRight");
  await expect(lightbox.getByTestId("lightbox-counter")).toHaveText(
    /02\s*\/\s*18/,
  );
  await page.keyboard.press("ArrowLeft");
  const zoom = lightbox.getByRole("button", { name: "Zoom in image" });
  await zoom.click();
  await expect(
    lightbox.getByRole("button", { name: "Zoom out image" }),
  ).toHaveAttribute("aria-pressed", "true");
  await lightbox.getByRole("button", { name: "View this piece" }).click();

  await expect(lightbox).toHaveCount(0);
  const product = page.getByRole("dialog", { name: "Flower Cards details" });
  await expect(product).toBeVisible();
  await expect(page.locator("[role=dialog]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(product).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});

test("reduced-motion testimonials stay manual and the social finale remains usable", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ height: 900, width: 1280 });
  await openPage(page, true);
  const testimonials = page.locator("#testimonials");
  await testimonials.scrollIntoViewIfNeeded();
  const region = testimonials.getByRole("region", {
    name: "Customer testimonials",
  });
  const firstName = await region.getByTestId("testimonial-name").textContent();
  await page.waitForTimeout(6_200);
  await expect(region.getByTestId("testimonial-name")).toHaveText(
    firstName ?? "",
  );
  await region.getByRole("button", { name: "Next testimonial" }).click();
  await expect(region.getByTestId("testimonial-name")).not.toHaveText(
    firstName ?? "",
  );
  await page.screenshot({ path: screenshots.testimonials });

  const instagram = page.locator("#instagram");
  await instagram.scrollIntoViewIfNeeded();
  await expect(
    instagram.getByRole("link", { name: /View .* on Instagram/ }),
  ).toHaveCount(10);
  await expect(
    instagram.getByRole("link", { name: "Follow on Instagram" }),
  ).toHaveAttribute("href", "https://instagram.com/studio_viana.in");
  await instagram
    .getByRole("link", { name: /View .* on Instagram/ })
    .first()
    .hover();
  await page.screenshot({ path: screenshots.instagram });
  await expect(
    page.locator("[aria-label='Studio Viana services'] > p.sr-only"),
  ).toContainText("Handcrafted, made to order");
  expect(errors).toEqual([]);
});

test("320px touch keeps two gallery columns and reachable lightbox gestures", async ({
  browser,
}) => {
  const { context, page } = await createTouchPage(browser);
  const errors = monitorRuntime(page);
  const gallery = page.locator("#gallery");
  await gallery.scrollIntoViewIfNeeded();
  expect(
    await gallery
      .locator("[data-masonry-grid]")
      .evaluate(
        (grid) =>
          getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean)
            .length,
      ),
  ).toBe(2);
  await gallery
    .getByRole("button", { name: "Open A Note in Bloom in gallery" })
    .click();
  const lightbox = page.getByRole("dialog", { name: /Gallery lightbox/ });
  await expect(lightbox).toBeVisible();
  const stage = lightbox.locator("[data-lightbox-stage]");
  await stage.dispatchEvent("pointerdown", { clientX: 280 });
  await stage.dispatchEvent("pointerup", { clientX: 120 });
  await expect(lightbox.getByTestId("lightbox-counter")).toHaveText(
    /02\s*\/\s*12/,
  );
  const counterBox = await lightbox
    .getByTestId("lightbox-counter")
    .boundingBox();
  const previousBox = await lightbox
    .getByRole("button", { name: "Previous gallery piece" })
    .boundingBox();
  const nextBox = await lightbox
    .getByRole("button", { name: "Next gallery piece" })
    .boundingBox();
  expect(counterBox).not.toBeNull();
  expect(previousBox).not.toBeNull();
  expect(nextBox).not.toBeNull();
  const overlaps = (
    first: NonNullable<typeof counterBox>,
    second: NonNullable<typeof previousBox>,
  ) =>
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y;
  expect(overlaps(counterBox!, previousBox!)).toBe(false);
  expect(overlaps(counterBox!, nextBox!)).toBe(false);
  expect(
    await lightbox
      .getByRole("button", { name: "View this piece" })
      .evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.top >= 0 && bounds.bottom <= innerHeight;
      }),
  ).toBe(true);
  const zoom = lightbox.getByRole("button", { name: "Zoom in image" });
  await zoom.dblclick();
  await expect(
    lightbox.getByRole("button", { name: "Zoom out image" }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const control of [
    lightbox.getByRole("button", { name: "Close gallery lightbox" }),
    lightbox.getByRole("button", { name: "Previous gallery piece" }),
    lightbox.getByRole("button", { name: "Next gallery piece" }),
  ]) {
    expect(
      await control.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.left >= 0 && bounds.right <= innerWidth;
      }),
    ).toBe(true);
  }
  await page.screenshot({ path: screenshots.mobile });
  await page.keyboard.press("Escape");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await context.close();
});

test("short portrait and landscape phones can reach every lightbox action", async ({
  browser,
}) => {
  const { context, page } = await createTouchPage(browser, {
    height: 568,
    width: 320,
  });
  const gallery = page.locator("#gallery");
  await gallery.scrollIntoViewIfNeeded();
  const trigger = gallery.getByRole("button", {
    name: "Open A Note in Bloom in gallery",
  });
  await trigger.click();
  let lightbox = page.getByRole("dialog", { name: /Gallery lightbox/ });
  await expect(lightbox).toHaveCSS("overflow-y", "auto");
  let action = lightbox.getByRole("button", { name: "View this piece" });
  await action.scrollIntoViewIfNeeded();
  await expect(action).toBeInViewport();
  await page.keyboard.press("Escape");

  await page.setViewportSize({ height: 320, width: 568 });
  await trigger.click();
  lightbox = page.getByRole("dialog", { name: /Gallery lightbox/ });
  action = lightbox.getByRole("button", { name: "View this piece" });
  await action.scrollIntoViewIfNeeded();
  await expect(action).toBeInViewport();
  await page.keyboard.press("Escape");
  await context.close();
});

test("Phase 4 copy and the initial gallery remain readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { height: 900, width: 1280 },
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#craft-closeup")).toContainText(
    "Every fibre, shaped by hand.",
  );
  await expect(page.locator("#process")).toContainText("From Stem to Story");
  await expect(page.locator("[data-stem-fallback]")).toHaveAttribute(
    "d",
    /L|C/,
  );
  await expect(page.locator("#gallery [data-gallery-item]")).toHaveCount(12);
  await expect(page.locator("#testimonials")).toContainText(
    "Loved by those who gift",
  );
  await expect(page.locator("#testimonials")).toContainText(
    "500+Blooms handcrafted",
  );
  await expect(page.locator("#testimonials")).toContainText(
    "100%Made to order",
  );
  await expect(page.locator("#instagram")).toContainText("@studio_viana.in");
  await expect(page.locator("[data-instagram-rail]")).toHaveCSS(
    "overflow-x",
    "auto",
  );
  await context.close();
});

test("the complete Phase 4 scroll has no 50ms main-thread tasks", async ({
  context,
  page,
}) => {
  test.skip(
    process.env.PLAYWRIGHT_PRODUCTION !== "true",
    "Performance budgets are measured against the production runtime.",
  );
  const errors = monitorRuntime(page);
  await page.setViewportSize({ height: 1000, width: 1440 });
  await openPage(page);
  for (const selector of [
    "#craft-closeup",
    "#process",
    "#gallery",
    "#testimonials",
    "#instagram",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((image) => image.complete)
        .map((image) => image.decode().catch(() => {})),
    );
  });
  const start = await page
    .locator("#craft-closeup")
    .evaluate((element) => element.getBoundingClientRect().top + scrollY);
  const end = await page
    .locator("[aria-label='Studio Viana services']")
    .evaluate((element) => element.getBoundingClientRect().bottom + scrollY);

  const client = await context.newCDPSession(page);
  const events: TraceEvent[] = [];
  client.on("Tracing.dataCollected", ({ value }) => {
    events.push(...(value as TraceEvent[]));
  });
  await client.send("Tracing.start", {
    categories: "devtools.timeline,toplevel",
    options: "record-as-much-as-possible",
    transferMode: "ReportEvents",
  });
  for (let step = 0; step <= 48; step += 1) {
    await page.evaluate(
      ({ from, progress, to }) =>
        window.scrollTo(0, from + (to - from) * progress),
      { from: start, progress: step / 48, to: end },
    );
    await page.waitForTimeout(65);
  }
  await page.waitForTimeout(350);
  const complete = new Promise<void>((resolve) => {
    client.once("Tracing.tracingComplete", () => resolve());
  });
  await client.send("Tracing.end");
  await complete;
  await client.detach();

  const mainThreads = new Set(
    events
      .filter(
        (event) =>
          event.name === "thread_name" && event.args?.name === "CrRendererMain",
      )
      .map((event) => event.tid)
      .filter((id): id is number => id !== undefined),
  );
  const longTasks = events.filter((event) => {
    const duration = event.tdur ?? event.dur ?? 0;
    return (
      event.name === "ThreadControllerImpl::RunTask" &&
      event.ph === "X" &&
      event.tid !== undefined &&
      mainThreads.has(event.tid) &&
      duration >= 50_000
    );
  });
  expect(longTasks).toEqual([]);
  expect(errors).toEqual([]);
});
