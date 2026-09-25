export function MessageCardPreview({ message }: { message: string }) {
  return (
    <div
      aria-label="Message card preview"
      className="relative min-h-32 border border-gold/30 bg-cream-soft p-5 shadow-soft"
    >
      <span className="absolute left-2 top-2 h-3 w-3 border-l border-t border-gold/50" />
      <span className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-gold/50" />
      <p className="font-display text-lg italic leading-7 text-charcoal/80">
        {message || "Your words will be handwritten with care."}
      </p>
    </div>
  );
}
