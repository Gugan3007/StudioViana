import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="grid min-h-screen place-items-center overflow-hidden bg-forest px-gutter py-24 text-center text-cream"
      tabIndex={-1}
    >
      <div className="max-w-2xl">
        <svg
          aria-hidden="true"
          className="mx-auto h-24 w-24 text-gold motion-reduce:animate-none"
          fill="none"
          viewBox="0 0 100 100"
        >
          <path
            className="[stroke-dasharray:240] [stroke-dashoffset:0] motion-safe:animate-[draw_1.8s_ease-out]"
            d="M50 88C48 65 49 45 52 28M52 49c-18 1-24-10-25-22 15-1 25 7 25 22Zm0-10c15-1 22-10 22-22-14 0-22 8-22 22Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
        <p className="mt-7 text-xs uppercase tracking-[0.24em] text-gold-light">
          404
        </p>
        <h1 className="mt-4 font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.92]">
          This bloom wandered away.
        </h1>
        <p className="mx-auto mt-6 max-w-md font-light leading-8 text-cream/70">
          Let&apos;s return to the studio and find the arrangement you were
          looking for.
        </p>
        <Link
          className="mt-9 inline-flex min-h-12 items-center rounded-full border border-gold px-7 text-xs uppercase tracking-[0.16em]"
          href="/"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
