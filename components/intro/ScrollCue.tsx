export function ScrollCue() {
  return (
    <div
      className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      data-intro-scroll-cue
    >
      <span className="font-body text-[0.58rem] font-medium uppercase tracking-[0.32em] text-gold-light">
        Scroll to explore
      </span>
      <span
        aria-hidden="true"
        className="intro-scroll-line bg-gold/30 relative h-10 w-px overflow-hidden"
      >
        <span className="intro-scroll-drop absolute inset-x-0 top-0 h-4 bg-gold-light" />
      </span>
    </div>
  );
}
