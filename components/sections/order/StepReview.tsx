import { Button } from "@/components/ui/Button";
import { catalogueProducts } from "@/lib/data/products";
import { whatsappLink } from "@/lib/data/site";
import { useOrderStore } from "@/lib/store/orderStore";
import { estimateOrder, formatINR } from "@/lib/utils/formatINR";
import { buildOrderMessage, mailtoLink } from "@/lib/utils/whatsapp";

export function StepReview() {
  const order = useOrderStore();
  const product = catalogueProducts.find(
    (candidate) => candidate.slug === order.pieceSlug,
  );
  const message = buildOrderMessage(order);
  const whatsapp = whatsappLink(message);
  const groups = [
    {
      label: "Piece",
      step: 1,
      value: `${product?.name ?? "Something custom"}${order.variant ? ` · ${order.variant}` : ""}`,
    },
    {
      label: "Flowers",
      step: 2,
      value: order.flowers.length
        ? order.flowers.join(", ")
        : "Studio's choice",
    },
    {
      label: "Palette",
      step: 3,
      value: `${order.palettes.join(", ")} · ${order.wrapStyle}`,
    },
    {
      label: "Details",
      step: 4,
      value: `${order.occasion} · ${order.neededBy} · ${order.deliveryMethod === "pickup" ? "Pick up" : order.deliveryArea}`,
    },
  ];

  return (
    <div>
      <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#765b34]">
        05 · Review
      </p>
      <h3 className="mt-3 font-display text-4xl tracking-[-0.03em]">
        Review your order
      </h3>
      <div className="mt-7 divide-y divide-gold/30 border-y border-gold/30">
        {groups.map((group) => (
          <div
            key={group.label}
            className="grid grid-cols-[1fr_auto] gap-5 py-5"
          >
            <div>
              <p className="text-[0.55rem] uppercase tracking-[0.16em] text-muted">
                {group.label}
              </p>
              <p className="mt-1 font-display text-lg">{group.value}</p>
            </div>
            <button
              aria-label={`Edit ${group.label.toLowerCase()}`}
              className="self-start border-b border-gold text-[0.58rem] uppercase tracking-[0.14em] text-[#765b34]"
              onClick={() => order.setStep(group.step)}
              type="button"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
      <div className="mt-7 flex items-end justify-between gap-5">
        <p className="max-w-xs text-xs leading-5 text-muted">
          Estimated — final price confirmed on WhatsApp
        </p>
        <p className="font-display text-3xl tabular-nums">
          {formatINR(estimateOrder(order))}
        </p>
      </div>
      <div className="mt-7 grid gap-3">
        <Button
          href={whatsapp}
          onClick={() => order.update({ submitted: true })}
          rel="noreferrer"
          target="_blank"
          variant="solid-forest"
        >
          Send order on WhatsApp
        </Button>
        <Button
          href={mailtoLink(
            `Order enquiry — ${product?.name ?? "Custom order"}`,
            message,
          )}
          onClick={() => order.update({ submitted: true })}
          variant="outline-gold"
        >
          Send by email instead
        </Button>
      </div>
    </div>
  );
}
