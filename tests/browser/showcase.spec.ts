import { expect, test, type Page } from "@playwright/test";

const desktopScreenshot = "/tmp/studio-viana-phase-0-desktop.png";
const mobileScreenshot = "/tmp/studio-viana-phase-0-mobile.png";

function monitorRuntime(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (
      message.text().includes("/_next/hmr") &&
      message.text().includes("WebSocket")
    )
      return;
    if (message.type() === "error" || /hydration/i.test(message.text())) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function expectHealthyDocument(page: Page) {
  await expect(page.locator("body")).toContainText("Design System");
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth ===
        document.documentElement.clientWidth,
    ),
  ).toBe(true);

  const imageElements = page.locator("img");
  expect(await imageElements.count()).toBeGreaterThan(0);
  for (let index = 0; index < (await imageElements.count()); index += 1) {
    await imageElements
      .nth(index)
      .evaluate((image) => image.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(100);
  }
  await expect
    .poll(() =>
      imageElements.evaluateAll((elements) =>
        elements.every((image) => {
          const element = image as HTMLImageElement;
          return element.complete && element.naturalWidth > 0;
        }),
      ),
    )
    .toBe(true);
}

test("desktop showcase loads, scrolls, focuses, and captures cleanly", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });

  await expectHealthyDocument(page);
  for (const text of [
    "The Studio palette",
    "Editorial hierarchy",
    "Essential primitives",
    "Movement, considered quietly",
    "A system that feels alive",
    "Catalogue records",
  ]) {
    await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
  }

  for (const name of ["Outline gold", "Solid forest", "Text link"]) {
    const control = page.getByRole(
      name === "Solid forest" ? "button" : "link",
      { name },
    );
    await control.focus();
    expect(
      await control.evaluate((element) => {
        const style = getComputedStyle(element);
        return style.outlineStyle !== "none" && style.outlineWidth !== "0px";
      }),
    ).toBe(true);
  }

  await page
    .getByText("Movement, considered quietly", { exact: true })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await expect(
    page.getByText("Soft entrances.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/lenis/);

  await page.setViewportSize({ width: 1024, height: 900 });
  await page.waitForTimeout(150);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expectHealthyDocument(page);
  expect(errors).toEqual([]);

  await page.screenshot({ fullPage: true, path: desktopScreenshot });
});

test("320px mobile layout has no overflow or clipped specimen labels", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/", { waitUntil: "networkidle" });

  await expectHealthyDocument(page);
  for (const label of [
    "Studio Viana / Phase 0",
    "05 / Motion language",
    "07 / Typed content",
  ]) {
    const element = page.getByText(label, { exact: true });
    await element.scrollIntoViewIfNeeded();
    expect(
      await element.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return (
          rect.left >= 0 && rect.right <= document.documentElement.clientWidth
        );
      }),
    ).toBe(true);
  }
  expect(errors).toEqual([]);

  await page.screenshot({ fullPage: true, path: mobileScreenshot });
});

test("reduced motion leaves final content visible and ambient motion still", async ({
  page,
}) => {
  const errors = monitorRuntime(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page
    .getByText("A system that feels alive", { exact: true })
    .scrollIntoViewIfNeeded();

  const splitTokens = page.locator("[data-split-token]");
  expect(await splitTokens.count()).toBeGreaterThan(0);
  for (const token of await splitTokens.all()) {
    await expect(token).toBeVisible();
  }
  await expect(page.locator("html")).not.toHaveClass(/lenis-smooth/);

  const marquee = page
    .getByText("FLOWERS THAT NEVER FADE · ", { exact: true })
    .last();
  const floatImage = page.getByAltText("Floating abstract botanical fixture");
  const before = await Promise.all([
    marquee.evaluate(
      (element) => getComputedStyle(element.parentElement!).transform,
    ),
    floatImage.evaluate(
      (element) => getComputedStyle(element.parentElement!).transform,
    ),
  ]);
  await page.waitForTimeout(400);
  const after = await Promise.all([
    marquee.evaluate(
      (element) => getComputedStyle(element.parentElement!).transform,
    ),
    floatImage.evaluate(
      (element) => getComputedStyle(element.parentElement!).transform,
    ),
  ]);
  expect(after).toEqual(before);
  expect(errors).toEqual([]);
});
