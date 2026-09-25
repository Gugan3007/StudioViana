import Image from "next/image";

export interface ClientLogo {
  readonly name: string;
  readonly src: string;
}

export function ClientLogos({ logos }: { logos: readonly ClientLogo[] }) {
  if (!logos.length) return null;
  return (
    <div className="mt-12 border-t border-gold/25 pt-7">
      <p className="text-center text-[0.58rem] uppercase tracking-[0.2em] text-gold-light">
        Trusted for celebrations across Tamil Nadu
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-10">
        {logos.map((logo) => (
          <Image
            key={logo.name}
            alt={logo.name}
            className="h-10 w-auto grayscale transition-[filter] hover:grayscale-0"
            height={40}
            src={logo.src}
            width={120}
          />
        ))}
      </div>
    </div>
  );
}
