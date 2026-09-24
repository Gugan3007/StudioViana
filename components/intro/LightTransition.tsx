export function LightTransition() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 origin-center scale-50 bg-[radial-gradient(circle_at_50%_50%,#fbf7f1_0%,#f7f0e6_38%,rgba(214,185,138,0.82)_62%,rgba(214,185,138,0)_78%)] opacity-0"
      data-intro-light
      data-testid="light-transition"
    />
  );
}
