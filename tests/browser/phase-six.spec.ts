import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ timeout: 120_000 });

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
      ["localhost", "127.0.0.1"].includes(new URL(response.url()).hostname) &&
      response.status() >= 400
    ) {
      errors.push(`response:${response.status()}:${response.url()}`);
    }
  });
  return errors;
}

async function prepareVisit(page: Page, motion: "full" | "reduce" = "reduce") {
  await page.addInitScript((preference) => {
    sessionStorage.setItem("studio-viana:intro-seen", "true");
    localStorage.setItem("studio-viana:motion", preference);
    if (preference === "full") {
      const nativeMatchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query: string) => {
        if (query !== "(hover: hover) and (pointer: fine)") {
          return nativeMatchMedia(query);
        }
        return {
          addEventListener: () => undefined,
          addListener: () => undefined,
          dispatchEvent: () => true,
          matches: true,
          media: query,
          onchange: null,
          removeEventListener: () => undefined,
          removeListener: () => undefined,
        } as MediaQueryList;
      };
    }
  }, motion);
  await page.emulateMedia({
    reducedMotion: motion === "reduce" ? "reduce" : "no-preference",
  });
}

async function openHome(page: Page, motion: "full" | "reduce" = "reduce") {
  await prepareVisit(page, motion);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-preloader]")).toHaveCount(0, {
    timeout: 30_000,
  });
  await expect(page.getByTestId("intro-section")).toHaveAttribute(
    "data-intro-ready",
    "true",
  );
}

test("skip link, saved motion override and fine-pointer effects remain coherent", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ height: 900, width: 1440 });
  await openHome(page, "full");

  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  await page.locator("#home").scrollIntoViewIfNeeded();
  await expect(page.locator("html")).toHaveAttribute(
    "data-intro-complete",
    "true",
  );
  await expect(page.locator("div[data-custom-cursor]")).toBeAttached();
  await expect(page.locator("[data-magnetic-root]").first()).toBeAttached();

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const motionToggle = page.getByRole("button", { name: "Reduce motion: off" });
  await motionToggle.scrollIntoViewIfNeeded();
  await motionToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await expect(page.locator("div[data-custom-cursor]")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("studio-viana:motion")),
  ).toBe("reduce");
  expect(errors).toEqual([]);
});

test("managed order bag locks scroll, traps focus and restores its trigger", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await openHome(page);
  const trigger = page.getByRole("button", { name: "Open order bag, 0 items" });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Your order bag" });
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close order bag" }),
  ).toBeFocused();
  expect(
    await page.locator("html").evaluate((node) => node.style.overflow),
  ).toBe("hidden");

  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Close order bag" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(
    await page.locator("html").evaluate((node) => node.style.overflow),
  ).toBe("");
  expect(errors).toEqual([]);
});

test("deep product route is crawlable and returns through the curtain", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await prepareVisit(page, "full");
  await page.goto("/collection/grand-bouquet", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { level: 1, name: "The Grand Bouquet" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.locator('script[type="application/ld+json"]').textContent(),
    )
    .toContain("BreadcrumbList");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://studioviana.com/collection/grand-bouquet",
  );

  await page.getByRole("link", { name: "Explore the collection →" }).click();
  await expect(page).toHaveURL(/\/#collection$/);
  await expect(page.locator("[data-route-curtain]")).toHaveAttribute(
    "data-transition-state",
    "idle",
    { timeout: 10_000 },
  );

  await page.goBack({ waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/collection\/grand-bouquet$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "The Grand Bouquet" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("metadata endpoints and generated social artwork are production-ready", async ({
  request,
}) => {
  for (const [path, contentType] of [
    ["/robots.txt", "text/plain"],
    ["/sitemap.xml", "application/xml"],
    ["/manifest.webmanifest", "application/manifest+json"],
    ["/opengraph-image", "image/png"],
    ["/collection/grand-bouquet/opengraph-image", "image/png"],
  ] as const) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"], path).toContain(contentType);
    expect((await response.body()).byteLength, path).toBeGreaterThan(50);
  }
});

for (const width of [360, 768, 1440, 2560]) {
  test(`home remains readable without horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width });
    await openHome(page);
    await expect(page.locator("#main-content")).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const buttons = page.locator("button:not([disabled]), a[href]");
    expect(await buttons.count()).toBeGreaterThan(10);
  });
}

test("200 percent zoom equivalent retains content and controls", async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 720 });
  await openHome(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Open order bag/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("product content and ordering links survive without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto("/collection/grand-bouquet", {
    waitUntil: "domcontentloaded",
  });
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "The Grand Bouquet" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Begin custom order" }),
  ).toHaveAttribute("href", "/?product=grand-bouquet#order");
  expect(
    await page.locator('script[type="application/ld+json"]').textContent(),
  ).toContain("BreadcrumbList");
  await context.close();
});

test("captures Phase 6 desktop and mobile release evidence", async ({
  browser,
}) => {
  const desktop = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { height: 1000, width: 1440 },
  });
  const desktopPage = await desktop.newPage();
  await openHome(desktopPage);

  for (const [selector, path] of [
    ["#home", "/tmp/studio-viana-phase-6-home-desktop.png"],
    ["#collection", "/tmp/studio-viana-phase-6-collection-desktop.png"],
    ["#pricing", "/tmp/studio-viana-phase-6-pricing-desktop.png"],
    ["footer", "/tmp/studio-viana-phase-6-footer-desktop.png"],
  ] as const) {
    const section = desktopPage.locator(selector);
    await expect(section).toBeVisible();
    await section.evaluate((element) =>
      window.scrollTo({
        behavior: "auto",
        top: element.getBoundingClientRect().top + window.scrollY,
      }),
    );
    if (selector === "#pricing") {
      await expect(
        desktopPage.locator("[data-phase-five-loading]"),
      ).toHaveCount(0, { timeout: 30_000 });
    }
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({ path });
  }

  await desktopPage.goto("/collection/grand-bouquet", {
    waitUntil: "networkidle",
  });
  await desktopPage.screenshot({
    path: "/tmp/studio-viana-phase-6-product-desktop.png",
  });
  await desktop.close();

  const mobile = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
    viewport: { height: 844, width: 390 },
  });
  const mobilePage = await mobile.newPage();
  await openHome(mobilePage);
  const mobileHome = mobilePage.locator("#home");
  await mobileHome.evaluate((element) =>
    window.scrollTo({
      behavior: "auto",
      top: element.getBoundingClientRect().top + window.scrollY,
    }),
  );
  await mobilePage.waitForTimeout(300);
  await mobilePage.screenshot({
    path: "/tmp/studio-viana-phase-6-home-mobile.png",
  });
  expect(
    await mobilePage.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await mobile.close();
});
