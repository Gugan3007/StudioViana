import { expect, test, type Page } from "@playwright/test";

const screenshots = {
  bag: "/tmp/studio-viana-phase-5-bag.png",
  contact: "/tmp/studio-viana-phase-5-contact.png",
  corporate: "/tmp/studio-viana-phase-5-corporate.png",
  faq: "/tmp/studio-viana-phase-5-faq.png",
  footer: "/tmp/studio-viana-phase-5-footer.png",
  mobile: "/tmp/studio-viana-phase-5-mobile-builder.png",
  order: "/tmp/studio-viana-phase-5-order.png",
  pricing: "/tmp/studio-viana-phase-5-pricing.png",
} as const;

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

async function openPage(page: Page, reduced = true) {
  await markIntroSeen(page);
  await page.emulateMedia({
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-preloader]")).toHaveCount(0, {
    timeout: 30_000,
  });
  await expect(page.getByTestId("intro-section")).toHaveAttribute(
    "data-intro-ready",
    "true",
  );
}

async function activatePhaseFive(page: Page) {
  await page.locator("#pricing").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-phase-five-loading]")).toHaveCount(0, {
    timeout: 30_000,
  });
}

function futureDate(days = 10) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function completeSingleStemOrder(page: Page) {
  const order = page.locator("#order");
  await page
    .locator("#pricing")
    .getByRole("link", { name: "Order Single Stem Florals" })
    .click();
  await expect(
    order.getByRole("heading", { name: "Choose your flowers" }),
  ).toBeVisible();
  await order.getByRole("button", { name: "Rose", exact: true }).click();
  await order.getByRole("button", { name: "Continue to Palette" }).click();
  await order.getByRole("button", { name: "Blush Pink" }).click();
  await order
    .getByRole("radio", { name: "Classic cream" })
    .check({ force: true });
  await order.getByRole("button", { name: "Continue to Details" }).click();
  await order.getByRole("button", { name: "Birthday" }).click();
  await order.getByLabel("Message card text").fill("Always in bloom.");
  await order.getByLabel("Needed by date").fill(futureDate());
  await order.getByRole("radio", { name: "Delivery" }).check({ force: true });
  await order.getByLabel("City or area").fill("Kochi");
  await order.getByLabel("Your name").fill("Ananya Rao");
  await order.getByLabel("Phone number").fill("9876543210");
  await order.getByLabel("Email address (optional)").fill("ananya@example.com");
  await order.getByRole("button", { name: "Review your order" }).click();
  await expect(
    order.getByRole("heading", { name: "Review your order" }),
  ).toBeVisible();
  return order;
}

test("pricing opens product details and the full builder produces restorable outbound links", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ height: 1000, width: 1440 });
  await openPage(page);

  const pricing = page.locator("#pricing");
  await activatePhaseFive(page);
  await expect(pricing.locator("[data-pricing-row]")).toHaveCount(9);
  const flowerCardsTrigger = pricing.getByRole("button", {
    name: "View Flower Cards details",
  });
  await flowerCardsTrigger.hover();
  await page.waitForLoadState("networkidle");
  await pricing.screenshot({ path: screenshots.pricing });
  await flowerCardsTrigger.click();
  const detail = page.getByRole("dialog", { name: "Flower Cards details" });
  await expect(detail).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("link", { name: "Chat with us on WhatsApp" }),
  ).toHaveCount(0);
  await detail.getByRole("button", { name: "Close details" }).click();
  await expect(
    page.getByRole("link", { name: "Chat with us on WhatsApp" }),
  ).toBeVisible();

  const order = await completeSingleStemOrder(page);
  const whatsapp = order.getByRole("link", { name: "Send order on WhatsApp" });
  const email = order.getByRole("link", { name: "Send by email instead" });
  await expect(whatsapp).toHaveAttribute("href", /wa\.me\/919488713438\?text=/);
  await expect(email).toHaveAttribute(
    "href",
    /^mailto:studioviana30@gmail\.com/,
  );
  const decoded = decodeURIComponent(
    (await whatsapp.getAttribute("href")) ?? "",
  );
  expect(decoded).toContain("Single Stem Floral");
  expect(decoded).toContain("Ananya Rao");
  expect(decoded).toContain("Always in bloom.");
  await page.waitForTimeout(450);
  await page.evaluate(() => {
    const orderSection = document.querySelector<HTMLElement>("#order");
    if (orderSection) window.scrollTo(0, orderSection.offsetTop);
  });
  await page.screenshot({ path: screenshots.order });

  await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
  await expect(
    page.locator("#order").getByRole("heading", { name: "Review your order" }),
  ).toBeVisible();
  await expect(
    page
      .locator("#order")
      .getByRole("link", { name: "Send order on WhatsApp" }),
  ).toHaveAttribute("href", /Ananya%20Rao/);
  expect(errors).toEqual([]);
});

test("the order bag persists, updates, hides competing controls and hands off to details", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ height: 900, width: 1280 });
  await openPage(page);

  const pricing = page.locator("#pricing");
  await activatePhaseFive(page);
  const singleStemTrigger = pricing.getByRole("button", {
    name: "View Single Stem Florals details",
  });
  await singleStemTrigger.hover();
  await page.waitForLoadState("networkidle");
  await singleStemTrigger.click();
  const detail = page.getByRole("dialog", {
    name: "Single Stem Florals details",
  });
  await detail.getByRole("button", { name: "Add to order" }).click();
  await detail.getByRole("button", { name: "Close details" }).click();
  const bagButton = page.getByRole("button", {
    name: "Open order bag, 1 item",
  });
  await expect(bagButton).toBeVisible();
  await page.evaluate(() =>
    window.dispatchEvent(new CustomEvent("studio-viana:open-bag")),
  );
  const bag = page.getByRole("dialog", { name: "Your order bag" });
  await expect(bag).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Chat with us on WhatsApp" }),
  ).toHaveCount(0);
  await bag
    .getByRole("button", { name: "Increase Single Stem Florals quantity" })
    .click();
  await expect(bag).toContainText("₹240");
  await page.waitForTimeout(450);
  await page.screenshot({ path: screenshots.bag });
  await bag.getByRole("button", { name: "Continue to custom details" }).click();
  await expect(bag).toHaveCount(0);
  await expect(
    page
      .locator("#order")
      .getByRole("heading", { name: "The thoughtful details" }),
  ).toBeVisible();

  await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
  await expect(
    page.getByRole("button", { name: "Open order bag, 2 items" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("corporate enquiry, FAQ, contact copy and footer controls remain functional", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ height: 1000, width: 1440 });
  await openPage(page);

  await page.evaluate(() => {
    Object.defineProperty(window, "open", {
      configurable: true,
      value: (url?: string | URL) => {
        (window as typeof window & { __openedUrl?: string }).__openedUrl =
          String(url ?? "");
        return null;
      },
    });
  });
  await activatePhaseFive(page);
  const corporate = page.locator("#corporate");
  await corporate.scrollIntoViewIfNeeded();
  await corporate
    .getByRole("button", { name: "Request a quote on WhatsApp" })
    .click();
  await expect(corporate.getByText("Please tell us your name.")).toBeVisible();
  await corporate.getByLabel("Name").fill("Maya Events");
  await corporate.getByLabel("Phone").fill("9876543210");
  await corporate.getByLabel("Event type").selectOption("Wedding");
  await corporate.getByLabel("Quantity").selectOption("50–100");
  await corporate.getByLabel("Event date").fill(futureDate(45));
  await corporate
    .getByLabel("Tell us about the occasion")
    .fill("Pastel guest favours with name tags.");
  await corporate
    .getByRole("button", { name: "Request a quote on WhatsApp" })
    .click();
  await expect(
    corporate.getByRole("heading", { name: "Thank you!" }),
  ).toBeVisible();
  const openedUrl = await page.evaluate(
    () => (window as typeof window & { __openedUrl?: string }).__openedUrl,
  );
  expect(decodeURIComponent(openedUrl ?? "")).toContain("Pastel guest favours");
  await page.screenshot({ path: screenshots.corporate });

  const faq = page.locator("#faq");
  const first = faq.getByRole("button", { name: "What are chenille flowers?" });
  const second = faq.getByRole("button", {
    name: "Can I customise colours and flowers?",
  });
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await faq.screenshot({ path: screenshots.faq });

  const contact = page.locator("#contact");
  await contact.scrollIntoViewIfNeeded();
  await contact.getByRole("button", { name: "Copy email" }).click();
  await expect(contact.getByText("Copied ✓")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "studioviana30@gmail.com",
  );
  await contact.screenshot({ path: screenshots.contact });

  const backToTop = page.getByRole("button", { name: "Back to top" });
  await backToTop.scrollIntoViewIfNeeded();
  await page.locator("footer").screenshot({ path: screenshots.footer });
  await backToTop.click();
  await expect
    .poll(() => page.evaluate(() => scrollY), { timeout: 5_000 })
    .toBeLessThan(20);
  expect(errors).toEqual([]);
});

test("mobile builder is contained, touch-friendly and exposes its summary only in context", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
    viewport: { height: 780, width: 375 },
  });
  const page = await context.newPage();
  const errors = monitorRuntime(page);
  await markIntroSeen(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  await expect(page.locator("[data-phase-five-loading]")).toHaveCount(4);
  await expect(page.getByRole("button", { name: /View summary/ })).toHaveCount(
    0,
  );

  await activatePhaseFive(page);
  const order = page.locator("#order");
  await order.scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: /View summary/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /View summary/ }).click();
  const summary = page.getByRole("dialog", { name: "Order summary" });
  await expect(summary).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Chat with us on WhatsApp" }),
  ).toHaveCount(0);
  await summary.getByRole("button", { name: "Close summary" }).click();
  await order.getByRole("button", { name: "Single Stem Florals" }).click();
  await page.screenshot({ path: screenshots.mobile });

  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth ===
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  for (const control of await order
    .locator("button:visible, a:visible, input:visible")
    .all()) {
    const box = await control.boundingBox();
    if (!box) continue;
    expect(box.height).toBeGreaterThanOrEqual(40);
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(376);
  }
  expect(errors).toEqual([]);
  await context.close();
});

test("production page keeps reduced-motion styles, layout stability and responsiveness healthy", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ height: 900, width: 1280 });
  await markIntroSeen(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const metrics = await page.evaluate(async () => {
    const shifts: number[] = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!shift.hadRecentInput) shifts.push(shift.value ?? 0);
      }
    });
    try {
      observer.observe({ type: "layout-shift", buffered: true });
    } catch {
      // Older engines can omit Layout Instability; the proxy remains zero.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_200));
    observer.disconnect();
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    const paint = performance.getEntriesByName("first-contentful-paint")[0];
    return {
      cls: shifts.reduce((sum, value) => sum + value, 0),
      dcl: navigation?.domContentLoadedEventEnd ?? 0,
      fcp: paint?.startTime ?? 0,
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      widthOk:
        document.documentElement.scrollWidth ===
        document.documentElement.clientWidth,
    };
  });

  expect(metrics.reduced).toBe(true);
  expect(metrics.widthOk).toBe(true);
  expect(metrics.cls).toBeLessThan(0.1);
  expect(metrics.dcl).toBeLessThan(5_000);
  expect(metrics.fcp).toBeLessThan(4_000);
  expect(errors).toEqual([]);
});
