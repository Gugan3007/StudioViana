# Studio Viana Phase 7 Pre-deploy Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit and harden the completed Studio Viana site for deployment without adding product features or changing the approved design and motion system.

**Architecture:** Keep the Phase 0–6 application architecture intact. Add only production-safe configuration seams and test coverage needed to eliminate reproducible defects, then record external or owner-owned launch blockers honestly. Browser evidence comes from the production Next.js server through Playwright because the Browser plugin is unavailable.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, GSAP, Lenis, Framer Motion, Vitest, Playwright, Lighthouse.

**Spec:** `/Users/gugansaravanan/.codex/attachments/c23fc509-94b0-4f7a-8247-00207a3fe200/pasted-text.txt`, constrained by the direct user instruction: “Do NOT add new features or redesign anything; only find and fix problems.”

## Global Constraints

- Do not add CMS, order APIs, analytics UI, consent UI, `/links`, announcement bars, or other new product features in this audit.
- Preserve Phase 0–6 copy, layout, palette, typography, media treatment, motion choreography and route structure.
- Never commit secrets; production config must have safe defaults and documented owner-controlled values.
- Keep WhatsApp as `+91 94887 13438` / `919488713438` and email as `studioviana30@gmail.com` unless the owner supplies replacements.
- Validate on the production server at 360, 375, 390, 412 and 430 px portrait and landscape; 768 and 1024 px tablet; and 1440 px desktop.
- Save screenshots, Lighthouse artifacts, traces and temporary diagnostics outside the repository.
- Do not claim real Instagram/WhatsApp in-app browser, Safari, deployment, domain, DNS, email delivery, Lighthouse-on-live-site or securityheaders.com results unless those environments are actually available.

## Review Focus

- A mobile URL opened inside Instagram/WhatsApp must not trap the intro, smooth scroll, dialogs or external WhatsApp handoff; exercise representative iPhone and Android in-app user agents.
- Small landscape viewports and safe-area insets must keep dialog actions and the floating WhatsApp control reachable without covering content; test 360–430 px widths in both orientations.
- Every generated WhatsApp/mailto URL must preserve emoji, `₹`, line breaks and the exact destination number/email after URL decoding; test every builder, bag, product and bulk-message generator.
- Repeat visits and restored orders must not inherit stale focus, scroll locks or malformed local storage; exercise full/skip/repeat intro and persisted builder/bag flows.
- The release report must distinguish code defects fixed here from owner placeholders and external device/service checks that remain unverified.

---

### Task 1: Static production, config and asset audit

**Files:**

- Modify only when evidence requires it: `next.config.mjs`, `lib/data/site.ts`, `lib/utils.ts`, `lib/utils/whatsapp.ts`, `.gitignore`, `package.json`
- Remove only proven unused files/assets discovered by import and route traversal.
- Test: `tests/data.test.ts`, `tests/utils.test.ts`, `tests/phase-six-performance.test.ts`

**Interfaces:**

- Consumes: Phase 6 clean baseline at commit `3f97ad1`.
- Produces: one canonical contact/config source, a zero-warning build surface, and an auditable asset inventory.

- [ ] **Step 1: Capture baseline evidence**

Run `npm run check`, `rg` scans for console calls/dead markers/hard-coded contact data, tracked-file import searches, asset size/hash inventory, PDF/favicon/OG checks and `npm audit`.

- [ ] **Step 2: Write failing regressions for every confirmed code defect**

For example, if contact configuration is duplicated, add an assertion that `whatsappLink()` uses `site.whatsappNumber` rather than a second literal. If a public link targets a missing file, add an assertion that no unavailable asset is exposed.

- [ ] **Step 3: Apply the smallest static fixes**

Centralize confirmed duplicates, remove only files with no route/import/runtime owner, and add production configuration/security options only when their absence is directly evidenced.

- [ ] **Step 4: Verify the focused and aggregate checks**

Run the affected Vitest files, ESLint, TypeScript, `git diff --check`, and a fresh production build.

- [ ] **Step 5: Commit**

Commit as `fix: harden production configuration and assets`.

### Task 2: Message, encoding and contact-route audit

**Files:**

- Modify: `lib/utils/whatsapp.ts` only for reproduced formatting/encoding defects.
- Modify call sites only when a URL is malformed: `components/layout/OrderBagDrawer.tsx`, `components/sections/order/StepReview.tsx`, `components/sections/corporate/CorporateSection.tsx`, `components/product/ProductOptions.tsx`, `components/layout/Footer.tsx`.
- Test: `tests/utils.test.ts`, `tests/order-entry-phase-five.test.ts`, `tests/order-builder-phase-five.test.tsx`, `tests/order-bag-phase-five.test.tsx`, `tests/corporate-phase-five.test.tsx`.

**Interfaces:**

- Consumes: canonical Studio Viana contact configuration.
- Produces: decoded-message and destination invariants for product, builder, bag, bulk and email flows.

- [ ] **Step 1: Enumerate every WhatsApp and mailto producer**

Use `rg` to build the call-site list and decode representative URLs containing emoji, `₹`, punctuation and newlines.

- [ ] **Step 2: Add failing table-driven tests for defects**

Assert host `wa.me`, pathname `/919488713438`, one `text` parameter, exact decoded line breaks, preserved currency/emojis, and email destination `studioviana30@gmail.com`.

- [ ] **Step 3: Fix the shared generator or call site**

Keep encoding at the outer URL boundary and human-readable message composition inside the shared utilities.

- [ ] **Step 4: Run focused and complete message tests**

Verify every message family and ensure existing visible copy is unchanged.

- [ ] **Step 5: Commit**

Commit as `fix: guarantee contact message integrity`.

### Task 3: Mobile, in-app-browser and responsive browser matrix

**Files:**

- Create: `tests/browser/phase-seven-audit.spec.ts`
- Modify only for reproduced defects: layout, overlay, intro, smooth-scroll or floating-action components owning the failing state.
- Modify: `playwright.config.ts` only for evidence-backed device/project/runtime settings.

**Interfaces:**

- Consumes: production server, intro state, motion state, overlay manager and existing Phase 1–6 browser helpers.
- Produces: automated evidence for all requested widths/orientations, safe-area simulation, touch targets, overflow, floating-action collision and representative in-app user agents.

- [ ] **Step 1: Write the production matrix before fixes**

Create table-driven tests for portrait and landscape at 360, 375, 390, 412 and 430 px; tablet at 768 and 1024 px; desktop at 1440 px. Check `scrollWidth`, clipped text, minimum interactive bounds, `100svh` surfaces, safe-area padding and WhatsApp/content overlap.

- [ ] **Step 2: Add representative Instagram/WhatsApp UA scenarios**

Use documented iPhone/Android WebView-style user agents and coarse touch contexts. Prove intro completion/skip, native scroll fallback, font-rendered content, bag/lightbox focus, and `wa.me` URL generation. Record that this is emulation, not real-app certification.

- [ ] **Step 3: Run the new spec red and classify every failure**

For each failure capture route, viewport, DOM bounds, console/network evidence and the owning component before editing.

- [ ] **Step 4: Fix confirmed defects one at a time**

Add a focused unit/browser regression per defect, implement the smallest layout or behavior correction, and rerun its exact reproduction.

- [ ] **Step 5: Capture final mobile/desktop screenshots outside the repo**

Capture representative 360 portrait, 430 landscape, 768 tablet and 1440 desktop states under `/tmp/studio-viana-phase-7-*`.

- [ ] **Step 6: Commit**

Commit as `fix: close mobile and in-app browser gaps`.

### Task 4: End-to-end flow, route and persistence audit

**Files:**

- Extend: `tests/browser/phase-seven-audit.spec.ts`
- Modify only confirmed owners among intro, nav, collection, product, gallery, order, corporate, FAQ, contact, transition and not-found files.

**Interfaces:**

- Consumes: existing UI workflows and browser-local persistence.
- Produces: production end-to-end coverage for every requested visitor flow.

- [ ] **Step 1: Encode every requested flow as browser scenarios**

Cover intro full/skip/repeat, navigation/mobile menu, collection/gallery/product detail, lightbox/swipe, complete builder/reload restore, bag, bulk form, FAQ, contact copy, route transition/back-forward and unknown-route 404.

- [ ] **Step 2: Monitor runtime and same-origin network health**

Collect console errors, page errors, failed requests, hydration messages, framework overlays, unexpected status codes and stuck scroll locks for every scenario.

- [ ] **Step 3: Run red, diagnose and repair only confirmed failures**

Trace state through the owning store/context/component, compare with a working flow, add the smallest failing regression, then fix and rerun.

- [ ] **Step 4: Run the complete production Playwright suite**

Require all legacy and Phase 7 scenarios to pass serially against `next start`.

- [ ] **Step 5: Commit**

Commit as `test: verify complete predeploy journeys`.

### Task 5: Performance, Lighthouse, accessibility and security audit

**Files:**

- Modify: `package.json`, `package-lock.json` only if a repeatable local Lighthouse runner is needed.
- Modify only confirmed owners for LCP, CLS, interaction, contrast, focus or security defects.
- Evidence: `/tmp/studio-viana-phase-7-lighthouse-*` and command output, never committed HTML artifacts.

**Interfaces:**

- Consumes: optimized production build and complete browser flow suite.
- Produces: exact mobile/desktop Lighthouse results, Web Vitals evidence available locally, dependency/security findings and accessibility results.

- [ ] **Step 1: Run repeatable Lighthouse against production**

Use an installed/local CLI with mobile and desktop presets. Record performance, accessibility, best-practices, SEO, LCP, CLS and TBT; state that lab Lighthouse cannot directly measure field INP.

- [ ] **Step 2: Verify image and low-power behavior**

Run the image optimizer dry plan, inspect source dimensions/duplicates, verify `next/image` sizing, emulate save-data/low-memory/low-core signals and prove expensive loops are disabled.

- [ ] **Step 3: Audit accessibility and contrast**

Exercise keyboard order, focus traps/return, reduced motion, zoom-equivalent layouts and Lighthouse contrast/accessibility findings.

- [ ] **Step 4: Audit dependencies and headers**

Run `npm audit`, inspect production response headers locally and identify checks that require the live deployment (`securityheaders.com`, TLS and CDN behavior).

- [ ] **Step 5: Fix only reproducible release blockers and rerun measurements**

Use a failing regression or before/after measurement for each fix. Do not optimize merely to chase a score if it changes the approved experience.

- [ ] **Step 6: Commit**

Commit as `perf: close predeploy quality gates`.

### Task 6: Placeholder ledger and final release evidence

**Files:**

- No standalone repository report unless required for durable owner handoff; primary audit output is the final response.
- Modify: existing documentation only when a confirmed statement is stale or wrong.

**Interfaces:**

- Consumes: source scan, asset inventory, browser evidence, Lighthouse results and verification outputs.
- Produces: severity/location/fix table, exact placeholder list, changed-file links/code, and honest external blockers.

- [ ] **Step 1: Build the placeholder inventory from source and rendered copy**

List photos/assets, testimonials, FAQ answers, lead times, delivery regions, prices, catalogue, policy/legal text and any owner-confirmation flags with exact source locations.

- [ ] **Step 2: Review all changes for scope and dead code**

Run `git diff`, `git diff --check`, import/reference searches and tracked-asset checks. Confirm no redesign or unrelated feature entered the branch.

- [ ] **Step 3: Run final verification fresh**

Run `npm run check`, the full production browser suite, Lighthouse mobile/desktop, image dry run and dependency audit. Read every exit status before reporting.

- [ ] **Step 4: Commit the final audit evidence changes**

Commit as `chore: complete phase seven predeploy audit`.

- [ ] **Step 5: Deliver the QA report**

Lead with findings. Include severity, location, reproduction/evidence and fix; exact test/build/Lighthouse metrics; placeholder list; changed-file links; remaining real-device/external risks; and consecutive screenshots at the end.
