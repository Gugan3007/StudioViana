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
  desktop: "/tmp/studio-viana-phase-3-desktop-gallery.png",
  detail: "/tmp/studio-viana-phase-3-product-detail.png",
  index: "/tmp/studio-viana-phase-3-index.png",
  mobile: "/tmp/studio-viana-phase-3-mobile.png",
  showcase: "/tmp/studio-viana-phase-3-grand-showcase.png",
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

async function openPage(page: Page, reduced = false, url = "/") {
  await markIntroSeen(page);
  await page.emulateMedia({
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await waitForPage(page);
}

async function openReducedCollection(page: Page, width = 1024) {
  await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
  await openPage(page, true);
  await page.locator("[data-collection-index]").scrollIntoViewIfNeeded();
}

async function createTouchPage(browser: Browser) {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await openPage(page, false);
  return { context, page };
}

test("the index navigates the horizontal gallery forward and backward", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openPage(page);
  const index = page.locator("[data-collection-index]");
  const mediumIndexRow = index.getByRole("button", {
    name: "View Medium Bouquets in collection",
  });
  await mediumIndexRow.scrollIntoViewIfNeeded();
  await expect(mediumIndexRow).toBeVisible();
  await index.screenshot({ path: screenshots.index });

  await mediumIndexRow.click();
  const gallery = page.locator("[data-collection-gallery]");
  await expect
    .poll(() => gallery.getByTestId("gallery-counter").textContent())
    .toMatch(/04\s*\/\s*08/);
  const medium = gallery.locator(
    '[data-gallery-mode="horizontal"] [data-product-slug="medium-bouquets"]',
  );
  await expect
    .poll(() =>
      medium.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return (
          bounds.left < innerWidth * 0.75 && bounds.right > innerWidth * 0.25
        );
      }),
    )
    .toBe(true);
  await page.screenshot({ path: screenshots.desktop });

  await gallery.focus();
  await page.keyboard.press("ArrowLeft");
  await expect
    .poll(() => gallery.getByTestId("gallery-counter").textContent())
    .toMatch(/03\s*\/\s*08/);
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => gallery.getByTestId("gallery-counter").textContent())
    .toMatch(/04\s*\/\s*08/);
  expect(errors).toEqual([]);
});

test("reduced motion uses eight vertical cards, sticky context, and static variants", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await openReducedCollection(page);
  const gallery = page.locator("[data-collection-gallery]");
  const vertical = gallery.locator('[data-gallery-mode="vertical"]');
  await expect(vertical).toBeVisible();
  await expect(
    gallery.locator('[data-gallery-mode="horizontal"]'),
  ).toBeHidden();
  await expect(vertical.locator("[data-mobile-card]")).toHaveCount(9);
  await expect(vertical.locator(":scope > div").first()).toHaveCSS(
    "position",
    "sticky",
  );

  const medium = vertical.locator('[data-product-slug="medium-bouquets"]');
  await medium.scrollIntoViewIfNeeded();
  await medium.getByRole("button", { name: "Violet Edit" }).click();
  await expect(
    medium
      .getByRole("button", { name: /View details for Medium/ })
      .getByRole("img", {
        name: "Violet Edit medium bouquet — handcrafted purple chenille lilies in a white wrap",
      }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("product detail owns URL, configuration, related switching, history, and focus", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await openReducedCollection(page);
  const trigger = page
    .locator(
      '[data-gallery-mode="vertical"] [data-product-slug="small-bouquets"]',
    )
    .getByRole("button", { exact: true, name: "View Details" });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Small Bouquets details" });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\?product=small-bouquets/);
  await expect(
    dialog.getByRole("button", { name: "Close details" }),
  ).toBeFocused();
  await dialog.getByText("2 blooms · ₹250", { exact: true }).click();
  await dialog.getByText("Lilac", { exact: true }).click();
  await dialog.getByLabel("Occasion").selectOption("Birthdays");
  await dialog.getByLabel("Personal message").fill("Made for a forever memory");
  await expect(dialog.getByTestId("configured-total")).toHaveText("₹250");
  const orderLink = dialog.getByRole("link", { name: "Order on WhatsApp" });
  await expect(orderLink).toHaveAttribute("href", /wa\.me\/919488713438/);
  const orderHref = await orderLink.getAttribute("href");
  expect(decodeURIComponent(orderHref ?? "")).toContain("2 blooms");
  expect(decodeURIComponent(orderHref ?? "")).toContain("Lilac");
  expect(decodeURIComponent(orderHref ?? "")).toContain(
    "Made for a forever memory",
  );

  const care = dialog.getByRole("button", {
    name: "Care — how to keep your blooms beautiful",
  });
  await care.click();
  await expect(care).toHaveAttribute("aria-expanded", "true");
  await dialog
    .getByRole("button", { name: "View Single Stem Florals details" })
    .click();
  await expect(page).toHaveURL(/\?product=single-stem-florals/);
  await expect(
    page.getByRole("dialog", { name: "Single Stem Florals details" }),
  ).toBeVisible();
  await expect(page.locator("[data-product-detail]")).toHaveCount(1);
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await page.getByRole("button", { name: "Close details" }).click();
  await expect(page.locator("[data-product-detail]")).toHaveCount(0);
  await expect(page).not.toHaveURL(/product=/);
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});

test("direct details remain scroll-locked after the first-visit preloader", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?product=medium-bouquets", { waitUntil: "networkidle" });
  await waitForPage(page);

  await expect(
    page.getByRole("dialog", { name: "Medium Bouquets details" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(page.locator("html")).toHaveClass(/lenis-stopped/);
  expect(errors).toEqual([]);
});

test("reduced-motion details prevent wheel chaining into the document", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPage(page, true, "/?product=medium-bouquets");
  const dialog = page.getByRole("dialog", { name: "Medium Bouquets details" });
  await dialog.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  const before = await page.evaluate(() => window.scrollY);
  await dialog.hover({ position: { x: 200, y: 800 } });
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(150);

  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
});

test("detail supports Escape, backdrop close, direct URLs, and focus restoration", async ({
  page,
}) => {
  await openReducedCollection(page);
  const trigger = page
    .locator(
      '[data-gallery-mode="vertical"] [data-product-slug="small-bouquets"]',
    )
    .getByRole("button", { exact: true, name: "View Details" });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-product-detail]")).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Small Bouquets details" });
  await dialog.click({ position: { x: 4, y: 4 } });
  await expect(dialog).toHaveCount(0);

  await page.goto("/?ref=collection&product=grand-bouquet", {
    waitUntil: "networkidle",
  });
  await waitForPage(page);
  const direct = page.getByRole("dialog", {
    name: "The Grand Bouquet details",
  });
  await expect(direct).toBeVisible();
  await direct.getByRole("button", { name: "Close details" }).click();
  await expect(page).toHaveURL(/\?ref=collection$/);
});

test("fine pointers receive the lens and pearls while touch pointers do not", async ({
  browser,
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openPage(page, false, "/?product=medium-bouquets");
  const dialog = page.getByRole("dialog", {
    name: "Medium Bouquets details",
  });
  const zoomSurface = dialog.locator('[data-cursor="zoom"]');
  await expect(zoomSurface).toBeVisible();
  await zoomSurface.hover({ position: { x: 250, y: 280 } });
  await expect(dialog.locator("[data-lens]")).toHaveCSS("opacity", "1");
  await dialog.getByRole("button", { name: "Close details" }).click();
  await page.locator("[data-grand-bouquet]").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-pearl]")).toHaveCount(18);

  const touch = await createTouchPage(browser);
  await touch.page.goto("/?product=medium-bouquets", {
    waitUntil: "networkidle",
  });
  await waitForPage(touch.page);
  await expect(touch.page.locator("[data-lens]")).toHaveCount(0);
  await touch.page.getByRole("button", { name: "Close details" }).click();
  await touch.page.locator("[data-grand-bouquet]").scrollIntoViewIfNeeded();
  await expect(touch.page.locator("[data-pearl]")).toHaveCount(0);
  await touch.context.close();
});

test("responsive collection layouts survive mobile, tablet, desktop, and resize", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await openPage(page, true);
    const collection = page.locator("#collection");
    await collection.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(250);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await openPage(page, true);
  const verticalCards = page.locator(
    '[data-gallery-mode="vertical"] [data-product-slug]',
  );
  for (const card of await verticalCards.all()) {
    await card.scrollIntoViewIfNeeded();
    const hero = card
      .getByRole("button", { name: /View details for/ })
      .getByRole("img");
    await expect
      .poll(() =>
        hero.evaluate((image) => {
          const element = image as HTMLImageElement;
          return element.complete && element.naturalWidth > 0;
        }),
      )
      .toBe(true);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await openPage(page);
  await page.locator("[data-collection-gallery]").scrollIntoViewIfNeeded();
  await page.setViewportSize({ width: 900, height: 900 });
  await page.waitForTimeout(500);
  expect(
    await page
      .locator("[data-horizontal-track]")
      .evaluate((element) => getComputedStyle(element).transform),
  ).not.toContain("NaN");
  expect(errors).toEqual([]);
});

test("normal-motion mobile updates the sticky product context", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPage(page);
  const vertical = page.locator('[data-gallery-mode="vertical"]');
  const medium = vertical.locator('[data-product-slug="medium-bouquets"]');
  await medium.scrollIntoViewIfNeeded();

  await expect
    .poll(() => vertical.locator(":scope > div").first().textContent())
    .toContain("Medium Bouquets");
});

test("short tablet viewports use the complete vertical product layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await openPage(page);
  const gallery = page.locator("[data-collection-gallery]");
  const vertical = gallery.locator('[data-gallery-mode="vertical"]');
  await expect(vertical).toBeVisible();
  await expect(
    gallery.locator('[data-gallery-mode="horizontal"]'),
  ).toBeHidden();

  const single = vertical.locator('[data-product-slug="single-stem-florals"]');
  await single.scrollIntoViewIfNeeded();
  await expect(single.getByText("₹120")).toBeVisible();
  await expect(
    single.getByRole("button", { exact: true, name: "View Details" }),
  ).toBeVisible();
});

test("desktop without JavaScript keeps the full collection reachable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 30_000 });
  const gallery = page.locator("[data-collection-gallery]");
  const vertical = gallery.locator('[data-gallery-mode="vertical"]');
  await expect(
    gallery.locator('[data-gallery-mode="horizontal"]'),
  ).toBeHidden();
  await expect(vertical).toBeVisible();
  await expect(vertical.locator("[data-mobile-card]")).toHaveCount(9);
  const finalProduct = vertical.locator('[data-product-slug="grand-bouquet"]');
  await finalProduct.scrollIntoViewIfNeeded();
  await expect(
    finalProduct.getByRole("button", { exact: true, name: "View Details" }),
  ).toBeVisible();
  await context.close();
});

test("captures the mobile collection, product detail, and dark finale", async ({
  page,
}) => {
  await openReducedCollection(page, 390);
  const first = page.locator(
    '[data-gallery-mode="vertical"] [data-product-slug="flower-cards"]',
  );
  await first.scrollIntoViewIfNeeded();
  await page.screenshot({ path: screenshots.mobile });
  await first
    .getByRole("button", { exact: true, name: "View Details" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Flower Cards details" }),
  ).toBeVisible();
  await page.waitForTimeout(900);
  await page.screenshot({ path: screenshots.detail });
  await page.getByRole("button", { name: "Close details" }).click();
  await expect(page.locator("[data-product-detail]")).toHaveCount(0);
  const showcase = page.locator("[data-grand-bouquet]");
  await showcase.scrollIntoViewIfNeeded();
  const showcaseImage = showcase.locator("img:visible");
  await expect
    .poll(() =>
      showcaseImage.evaluate((image) => {
        const element = image as HTMLImageElement;
        return element.complete && element.naturalWidth > 0;
      }),
    )
    .toBe(true);
  await page.screenshot({ path: screenshots.showcase });
});

test("the normal-motion collection scroll has no 50ms main-thread tasks", async ({
  context,
  page,
}) => {
  test.skip(
    process.env.PLAYWRIGHT_PRODUCTION !== "true",
    "Performance budgets are measured against the production runtime.",
  );
  const errors = monitorRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openPage(page);
  const start = await page
    .locator("[data-collection-index]")
    .evaluate((element) => element.getBoundingClientRect().top + scrollY);
  const end = await page
    .locator("[data-grand-bouquet]")
    .evaluate((element) => element.getBoundingClientRect().bottom + scrollY);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((image) => image.complete)
        .map((image) => image.decode().catch(() => {})),
    );
  });

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
  for (let step = 0; step <= 40; step += 1) {
    await page.evaluate(
      ({ from, progress, to }) =>
        window.scrollTo(0, from + (to - from) * progress),
      { from: start, progress: step / 40, to: end },
    );
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(400);
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
