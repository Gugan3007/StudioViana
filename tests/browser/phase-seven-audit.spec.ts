import { expect, test, type Browser, type Page } from "@playwright/test";

test.describe.configure({ timeout: 180_000 });

const responsiveMatrix = [
  { height: 800, label: "360 portrait", width: 360 },
  { height: 360, label: "360 landscape", width: 800 },
  { height: 812, label: "375 portrait", width: 375 },
  { height: 375, label: "375 landscape", width: 812 },
  { height: 844, label: "390 portrait", width: 390 },
  { height: 390, label: "390 landscape", width: 844 },
  { height: 915, label: "412 portrait", width: 412 },
  { height: 412, label: "412 landscape", width: 915 },
  { height: 932, label: "430 portrait", width: 430 },
  { height: 430, label: "430 landscape", width: 932 },
  { height: 1024, label: "768 tablet portrait", width: 768 },
  { height: 768, label: "1024 tablet landscape", width: 1024 },
  { height: 1000, label: "1440 desktop", width: 1440 },
] as const;

const inAppContexts = [
  {
    label: "Instagram iPhone",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 347.0.0.35.103",
    viewport: { height: 844, width: 390 },
  },
  {
    label: "WhatsApp Android",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UQ1A.240205.004; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/123.0.0.0 Mobile Safari/537.36 WhatsApp/2.24.18.80",
    viewport: { height: 915, width: 412 },
  },
] as const;

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
    const hostname = new URL(response.url()).hostname;
    if (
      ["localhost", "127.0.0.1"].includes(hostname) &&
      response.status() >= 400
    ) {
      errors.push(`response:${response.status()}:${response.url()}`);
    }
  });
  return errors;
}

async function prepareRepeatVisit(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("studio-viana:intro-seen", "true");
    localStorage.setItem("studio-viana:motion", "reduce");
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
}

async function waitForHome(page: Page) {
  await expect(page.locator("[data-preloader]")).toHaveCount(0, {
    timeout: 30_000,
  });
  await expect(page.getByTestId("intro-section")).toHaveAttribute(
    "data-intro-ready",
    "true",
  );
  await expect(page.locator("#main-content")).toBeVisible();
}

function intersects(
  a: { height: number; width: number; x: number; y: number },
  b: { height: number; width: number; x: number; y: number },
) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

test("declares edge-to-edge safe-area support", async ({ page }) => {
  await prepareRepeatVisit(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const viewport = page.locator('meta[name="viewport"]');

  await expect(viewport).toHaveAttribute("content", /viewport-fit=cover/);
});

for (const viewport of responsiveMatrix) {
  test(`${viewport.label} has no overflow, clipped copy or blocked global controls`, async ({
    page,
  }) => {
    const errors = monitorRuntime(page);
    await page.setViewportSize(viewport);
    await prepareRepeatVisit(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForHome(page);
    await expect(page.locator("header[data-nav-theme]")).toHaveAttribute(
      "data-nav-theme",
      "dark",
    );
    await expect(
      page.getByText("TAMIL NADU · INDIA", { exact: true }),
    ).toBeHidden();
    await expect(
      page.getByText("2026–27 COLLECTION", { exact: true }),
    ).toBeHidden();

    const measurements = await page.evaluate(() => {
      const clippedText = Array.from(
        document.querySelectorAll<HTMLElement>("h1, h2, h3, p"),
      )
        .filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.overflowX === "visible" &&
            element.scrollWidth > element.clientWidth + 1
          );
        })
        .map((element) => element.textContent?.trim().slice(0, 80));
      return {
        clippedText,
        horizontalOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        homeHeight:
          document.querySelector<HTMLElement>("#home")?.getBoundingClientRect()
            .height ?? 0,
      };
    });
    expect(measurements.horizontalOverflow).toBeLessThanOrEqual(1);
    expect(measurements.clippedText).toEqual([]);
    expect(measurements.homeHeight).toBeGreaterThanOrEqual(viewport.height - 1);

    for (const control of [
      page.getByRole("button", { name: /Open order bag/ }).first(),
      page.getByRole("link", { name: "Chat with us on WhatsApp" }),
    ]) {
      await expect(control).toBeVisible();
      await expect
        .poll(async () => (await control.boundingBox())?.width ?? 0)
        .toBeGreaterThanOrEqual(44);
      const bounds = await control.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
    }

    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const floating = page.getByRole("link", {
      name: "Chat with us on WhatsApp",
    });
    const floatingBounds = await floating.boundingBox();
    expect(floatingBounds).not.toBeNull();
    const visibleFooterControls = page.locator(
      "footer a:visible, footer button:visible, footer input:visible",
    );
    const collisions: string[] = [];
    for (
      let index = 0;
      index < (await visibleFooterControls.count());
      index++
    ) {
      const control = visibleFooterControls.nth(index);
      if (await control.evaluate((node) => node === document.activeElement)) {
        continue;
      }
      const bounds = await control.boundingBox();
      if (!bounds || !intersects(floatingBounds!, bounds)) continue;
      collisions.push(
        (await control.getAttribute("aria-label")) ?? "footer control",
      );
    }
    expect(collisions).toEqual([]);

    if (viewport.height <= 430) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.getByRole("button", { name: "Open menu" }).click();
      const menu = page.getByRole("dialog", { name: "Mobile navigation" });
      await expect(menu).toBeVisible();
      await menu.evaluate((element) =>
        element.scrollTo(0, element.scrollHeight),
      );
      await expect(menu.getByText("@studio_viana.in")).toBeVisible();
      await menu.getByRole("button", { name: "Close menu" }).click();
    }

    expect(errors).toEqual([]);
  });
}

for (const inApp of inAppContexts) {
  test(`${inApp.label} emulation completes intro and keeps native touch flows usable`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      reducedMotion: "reduce",
      userAgent: inApp.userAgent,
      viewport: inApp.viewport,
    });
    const page = await context.newPage();
    const errors = monitorRuntime(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-preloader]")).toHaveCount(0, {
      timeout: 30_000,
    });
    const skip = page.getByRole("button", { name: "Skip intro" });
    if (await skip.isVisible()) await skip.click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-intro-complete",
      "true",
    );
    await expect(page.locator("html")).not.toHaveClass(/lenis-smooth/);
    expect(
      await page
        .locator("body")
        .evaluate((body) => getComputedStyle(body).fontFamily),
    ).toMatch(/Poppins/i);

    await page
      .getByRole("button", { name: /Open order bag/ })
      .first()
      .click();
    const bag = page.getByRole("dialog", { name: "Your order bag" });
    await expect(bag).toBeVisible();
    await expect(
      bag.getByRole("button", { name: "Close order bag" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(bag).toHaveCount(0);

    const gallery = page.locator("#gallery");
    await gallery.scrollIntoViewIfNeeded();
    const trigger = gallery.getByRole("button", {
      name: "Open A Note in Bloom in gallery",
    });
    await trigger.click();
    const lightbox = page.getByRole("dialog", { name: /Gallery lightbox/ });
    await expect(lightbox).toBeVisible();
    await expect(
      lightbox.getByRole("button", { name: "Close gallery lightbox" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");

    const whatsapp = page.getByRole("link", {
      name: "Chat with us on WhatsApp",
    });
    const href = await whatsapp.getAttribute("href");
    expect(new URL(href!).pathname).toBe("/919488713438");
    expect(errors).toEqual([]);
    await context.close();
  });
}

async function captureHome(
  browser: Browser,
  viewport: { height: number; width: number },
  path: string,
) {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport,
  });
  const page = await context.newPage();
  await prepareRepeatVisit(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForHome(page);
  await page.screenshot({ fullPage: false, path });
  await context.close();
}

test("captures Phase 7 responsive release evidence", async ({ browser }) => {
  await captureHome(
    browser,
    { height: 800, width: 360 },
    "/tmp/studio-viana-phase-7-360-portrait.png",
  );
  await captureHome(
    browser,
    { height: 430, width: 932 },
    "/tmp/studio-viana-phase-7-430-landscape.png",
  );
  await captureHome(
    browser,
    { height: 1024, width: 768 },
    "/tmp/studio-viana-phase-7-768-tablet.png",
  );
  await captureHome(
    browser,
    { height: 1000, width: 1440 },
    "/tmp/studio-viana-phase-7-1440-desktop.png",
  );
});
