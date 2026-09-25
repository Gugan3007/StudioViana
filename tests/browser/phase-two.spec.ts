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
  const expectedLinks = ["Collection", "About", "Craft", "Pricing", "Contact"];
  for (const label of expectedLinks) {
    const link = primary.getByRole("link", { name: label });
    await expect(link).toHaveAttribute("href", `#${label.toLowerCase()}`);
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
  await expect(nav).toHaveAttribute("data-nav-hidden", "true");
  await expect(primary.getByRole("link", { name: "About" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.mouse.wheel(0, -600);
  await expect(nav).not.toHaveAttribute("data-nav-hidden", "true");

  const firstService = page.locator("#craft article").first();
  await firstService.scrollIntoViewIfNeeded();
  await firstService.hover();
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

test("mobile menu traps focus, navigates, and closes with Escape", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
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
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Mobile navigation" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Collection/ })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("link", { name: "@studio_viana.in" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  expect(errors).toEqual([]);
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
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(350);

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const images = page.locator("img");
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
  await page.emulateMedia({ reducedMotion: "reduce" });
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
