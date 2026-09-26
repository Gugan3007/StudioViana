import { expect, test, type Page } from "@playwright/test";

interface TraceEvent {
  args?: { name?: string };
  dur?: number;
  name?: string;
  ph?: string;
  tid?: number;
}

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

async function skipToHome(page: Page) {
  await waitForPage(page);
  const skip = page.getByRole("button", { name: "Skip intro" });
  if (await skip.isVisible()) await skip.click();
  await expect
    .poll(
      () =>
        page
          .locator("#home")
          .evaluate((element) => Math.abs(element.getBoundingClientRect().top)),
      { timeout: 10_000 },
    )
    .toBeLessThan(6);
}

test("intro hand-off and reload reveal the hero and navigation without a cream seam", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await skipToHome(page);

  await expect(page.locator("html")).toHaveAttribute(
    "data-intro-complete",
    "true",
  );
  await expect(
    page.getByRole("navigation", { name: /primary/i }),
  ).toBeVisible();
  await expect(page.locator("#home")).toHaveCSS(
    "background-color",
    "rgb(247, 240, 230)",
  );
  await expect(page.locator("#home")).toHaveAttribute(
    "data-hero-entered",
    "true",
  );

  const beforeReload = await page.evaluate(() => window.scrollY);
  await page.reload({ waitUntil: "networkidle" });
  await waitForPage(page);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(
    beforeReload * 0.8,
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-intro-complete",
    "true",
  );
  expect(errors).toEqual([]);
});

test("navbar links, direction, active section, dark theme, and service preview work", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await skipToHome(page);

  const nav = page.getByRole("banner");
  const primary = page.getByRole("navigation", { name: /primary/i });
  const expectedLinks = {
    About: "#about",
    Collection: "#collection",
    Contact: "#contact",
    Craft: "#craft-closeup",
    Gallery: "#gallery",
    Pricing: "#pricing",
  } as const;
  for (const [label, href] of Object.entries(expectedLinks)) {
    const link = primary.getByRole("link", { name: label });
    await expect(link).toHaveAttribute("href", href);
  }

  if ((await nav.getAttribute("data-nav-hidden")) === "true") {
    await page.mouse.wheel(0, -600);
    await expect(nav).not.toHaveAttribute("data-nav-hidden", "true");
  }
  await primary.getByRole("link", { name: "About" }).click();
  await expect
    .poll(() =>
      page
        .locator("#about")
        .evaluate((element) =>
          Math.abs(element.getBoundingClientRect().top - 84),
        ),
    )
    .toBeLessThan(8);
  await expect(nav).not.toHaveAttribute("data-nav-hidden", "true");
  await expect(primary.getByRole("link", { name: "About" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.mouse.wheel(0, 120);
  await expect(nav).toHaveAttribute("data-nav-hidden", "true");
  await page.mouse.wheel(0, -600);
  await expect(nav).not.toHaveAttribute("data-nav-hidden", "true");

  const firstService = page.locator("#craft article").first();
  await firstService.scrollIntoViewIfNeeded();
  await firstService.dispatchEvent("pointerenter");
  await expect(firstService.locator("[data-cursor-preview]")).toHaveAttribute(
    "data-visible",
    "true",
  );

  for (let step = 0; step < 16; step += 1) {
    const bounds = await page
      .getByTestId("craft-marquee")
      .evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { bottom: rect.bottom, top: rect.top };
      });
    if (bounds.top <= 42 && bounds.bottom >= 42) break;
    const remaining = bounds.top - 42;
    const delta =
      Math.sign(remaining) * Math.min(360, Math.max(40, Math.abs(remaining)));
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(300);
  }
  await expect
    .poll(() =>
      page.getByTestId("craft-marquee").evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.top <= 42 && bounds.bottom >= 42;
      }),
    )
    .toBe(true);
  await expect(nav).toHaveAttribute("data-nav-theme", "dark");
  expect(errors).toEqual([]);
});

test("normal-motion mobile menu traps focus, exposes close, navigates, and restores focus", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForPage(page);
  await page.locator("#home").evaluate((element) => element.scrollIntoView());

  const nav = page.getByRole("banner");
  if ((await nav.getAttribute("data-nav-hidden")) === "true") {
    await page.mouse.wheel(0, -500);
    await expect(nav).not.toHaveAttribute("data-nav-hidden", "true");
  }
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.focus();
  await expect(nav).not.toHaveAttribute("data-nav-hidden", "true");
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Mobile navigation" });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", { name: "Close menu" });
  await expect(close).toBeFocused({ timeout: 3_000 });
  expect(
    await close.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const hit = document.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2,
      );
      return hit === element || element.contains(hit);
    }),
  ).toBe(true);
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("link", { name: "@studio_viana.in" }),
  ).toBeFocused();

  await dialog.getByRole("link", { name: /About/ }).click();
  await expect(dialog).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .locator("#about")
        .evaluate((element) =>
          Math.abs(element.getBoundingClientRect().top - 84),
        ),
    )
    .toBeLessThan(8);

  await page.mouse.wheel(0, -500);
  await expect(nav).not.toHaveAttribute("data-nav-hidden", "true");
  const reopenedTrigger = page.getByRole("button", { name: "Open menu" });
  await reopenedTrigger.focus();
  await reopenedTrigger.click();
  await expect(close).toBeFocused({ timeout: 3_000 });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  expect(errors).toEqual([]);
});

test("focused navigation stays visible and alpha color treatments render", async ({
  page,
}) => {
  await markIntroSeen(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await skipToHome(page);

  const nav = page.getByRole("banner");
  await page.mouse.wheel(0, 900);
  await expect(nav).toHaveAttribute("data-nav-hidden", "true");
  await page
    .getByRole("navigation", { name: /primary/i })
    .getByRole("link", { name: "About" })
    .focus();
  await expect(nav).not.toHaveAttribute("data-nav-hidden", "true");
  await expect
    .poll(() => nav.evaluate((element) => element.getBoundingClientRect().top))
    .toBeGreaterThan(-1);

  await expect(nav).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(
    page.locator("#about").getByText("The Grand Bouquet", { exact: true }),
  ).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator("[data-hero-badge]")).not.toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(page.locator("[data-band-overlay]")).not.toHaveCSS(
    "background-image",
    "none",
  );
});

test("coarse pointers do not receive infinite ambient motion", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await markIntroSeen(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await skipToHome(page);
  await page.waitForTimeout(2_500);

  const badge = page.locator("[data-hero-badge]");
  const first = await badge.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await page.waitForTimeout(1_200);
  const second = await badge.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  expect(second).toBe(first);
  await context.close();
});

test("the Home heading is readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const tokens = page.locator("#home [data-split-token]");
  await expect(tokens).toHaveCount(3);
  for (const token of await tokens.all()) {
    await expect(token).toHaveCSS("opacity", "1");
  }
  await context.close();
});

test("reduced motion renders complete static values without ambient animation", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForPage(page);

  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator("#about [data-count]")).toHaveText("100%");
  await expect(page.locator("#craft article > p").first()).toHaveText("01");
  await expect(
    page.locator("#craft article").last().locator(":scope > p").first(),
  ).toHaveText("04");
  await expect(page.locator("[data-expanding-frame]")).toHaveCSS(
    "clip-path",
    /inset\((0%|0px)/,
  );
  await expect(page.locator("[data-cursor-preview]")).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  test(`has no horizontal overflow or failed images at ${width}px`, async ({
    page,
  }) => {
    const errors = monitorRuntime(page);
    await markIntroSeen(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto("/", { waitUntil: "networkidle" });
    await waitForPage(page);
    // Phase 2 owns the intro and Home/About/Craft media. Collection assets are
    // lazy and are traversed product-by-product by the Phase 3 suite.
    const images = page.locator(
      "[data-intro-mode] img, #home img, #about img, #craft img",
    );
    for (const image of await images.all()) {
      if (!(await image.isVisible())) continue;
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(
          () =>
            image.evaluate((element) => {
              const candidate = element as HTMLImageElement;
              return candidate.complete && candidate.naturalWidth > 0;
            }),
          { timeout: 15_000 },
        )
        .toBe(true);
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(350);

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await expect
      .poll(() =>
        images.evaluateAll((elements) =>
          elements.every((image) => {
            const element = image as HTMLImageElement;
            const bounds = element.getBoundingClientRect();
            if (bounds.width === 0 || bounds.height === 0) return true;
            return element.complete && element.naturalWidth > 0;
          }),
        ),
      )
      .toBe(true);
    expect(errors).toEqual([]);
  });
}

test("Home, About, and Craft scroll has no 50ms main-thread tasks in production", async ({
  context,
  page,
}) => {
  test.skip(
    process.env.PLAYWRIGHT_PRODUCTION !== "true",
    "Performance budgets are measured against the production runtime.",
  );
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await waitForPage(page);
  const start = await page
    .locator("#home")
    .evaluate((element) => (element as HTMLElement).offsetTop);
  const end = await page
    .getByTestId("craft-marquee")
    .evaluate(
      (element) => element.getBoundingClientRect().bottom + window.scrollY,
    );

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

  for (let step = 0; step <= 30; step += 1) {
    await page.evaluate(
      ({ from, progress, to }) =>
        window.scrollTo(0, from + (to - from) * progress),
      { from: start, progress: step / 30, to: end },
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
  const longTasks = events.filter(
    (event) =>
      event.name === "ThreadControllerImpl::RunTask" &&
      event.ph === "X" &&
      event.tid !== undefined &&
      mainThreads.has(event.tid) &&
      (event.dur ?? 0) >= 50_000,
  );

  expect(longTasks).toEqual([]);
  expect(errors).toEqual([]);
});
