import { useId } from "react";

import { MessageCardPreview } from "@/components/sections/order/MessageCardPreview";
import { builderOptions, phaseFiveConfig } from "@/lib/data/site";
import { useOrderStore } from "@/lib/store/orderStore";
import { cn } from "@/lib/utils";

export function minimumOrderDate(now = new Date()) {
  const minimum = new Date(now);
  minimum.setHours(12, 0, 0, 0);
  minimum.setDate(minimum.getDate() + phaseFiveConfig.leadTimeDays);
  return minimum.toISOString().slice(0, 10);
}

export function isUrgentOrderDate(value: string, now = new Date()) {
  if (!value) return false;
  const selected = new Date(`${value}T12:00:00`);
  const threshold = new Date(now);
  threshold.setHours(12, 0, 0, 0);
  threshold.setDate(threshold.getDate() + 7);
  return selected <= threshold;
}

interface StepDetailsProps {
  errors: Record<string, string | undefined>;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span id={id} aria-live="polite" className="text-xs text-[#a64f59]">
      {message}
    </span>
  ) : null;
}

export function StepDetails({ errors }: StepDetailsProps) {
  const order = useOrderStore();
  const prefix = useId();
  const describedBy = (field: string) =>
    errors[field] ? `${prefix}-${field}` : undefined;
  const inputClass =
    "min-h-12 border-b border-gold/45 bg-transparent px-1 text-sm text-charcoal placeholder:text-muted/65";

  return (
    <div>
      <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#765b34]">
        04 · Details
      </p>
      <h3 className="mt-3 font-display text-4xl tracking-[-0.03em]">
        The thoughtful details
      </h3>
      <p className="mt-3 text-sm font-light text-muted">
        Tell us who it is for and when the moment arrives.
      </p>

      <fieldset className="mt-7">
        <legend className="text-[0.58rem] uppercase tracking-[0.18em] text-muted">
          Occasion
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {builderOptions.occasions.map((occasion) => (
            <button
              key={occasion}
              aria-pressed={order.occasion === occasion}
              className={cn(
                "min-h-11 rounded-full border px-4 text-[0.58rem] uppercase tracking-[0.1em]",
                order.occasion === occasion
                  ? "border-gold bg-gold text-forest"
                  : "border-gold/35",
              )}
              onClick={() => order.update({ occasion })}
              type="button"
            >
              {occasion}
            </button>
          ))}
        </div>
        <FieldError id={`${prefix}-occasion`} message={errors.occasion} />
      </fieldset>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs text-muted">
          Message card text
          <textarea
            aria-label="Message card text"
            className="min-h-32 resize-y border border-gold/35 bg-transparent p-4 text-charcoal"
            maxLength={150}
            onChange={(event) =>
              order.update({ messageCard: event.target.value })
            }
            placeholder="Optional — write something from the heart"
            value={order.messageCard ?? ""}
          />
          <span className="justify-self-end text-[0.58rem]">
            {order.messageCard?.length ?? 0} / 150
          </span>
        </label>
        <MessageCardPreview message={order.messageCard ?? ""} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <label className="grid gap-2 text-xs text-muted">
          Needed by date
          <input
            aria-describedby={describedBy("neededBy")}
            aria-label="Needed by date"
            className={inputClass}
            min={minimumOrderDate()}
            onChange={(event) => order.update({ neededBy: event.target.value })}
            type="date"
            value={order.neededBy ?? ""}
          />
          <FieldError id={`${prefix}-neededBy`} message={errors.neededBy} />
          {order.neededBy && isUrgentOrderDate(order.neededBy) ? (
            <span className="text-xs text-[#765b34]">
              This is close to our usual lead time. We&apos;ll confirm
              availability with you personally.
            </span>
          ) : null}
        </label>

        <fieldset>
          <legend className="text-xs text-muted">Delivery</legend>
          <div className="mt-2 flex gap-3">
            {(["pickup", "delivery"] as const).map((method) => (
              <label key={method} className="cursor-pointer">
                <input
                  aria-label={method === "pickup" ? "Pick up" : "Delivery"}
                  checked={order.deliveryMethod === method}
                  className="peer sr-only"
                  name="delivery-method"
                  onChange={() => order.update({ deliveryMethod: method })}
                  type="radio"
                />
                <span className="flex min-h-12 items-center border border-gold/35 px-4 capitalize peer-checked:border-gold peer-checked:bg-gold peer-checked:text-forest">
                  {method === "pickup" ? "Pick up" : "Delivery"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {order.deliveryMethod === "delivery" ? (
        <label className="mt-5 grid gap-2 text-xs text-muted">
          City or area
          <input
            aria-describedby={describedBy("deliveryArea")}
            aria-label="City or area"
            className={inputClass}
            onChange={(event) =>
              order.update({ deliveryArea: event.target.value })
            }
            placeholder="e.g. Kochi"
            value={order.deliveryArea ?? ""}
          />
          <FieldError
            id={`${prefix}-deliveryArea`}
            message={errors.deliveryArea}
          />
        </label>
      ) : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <label className="grid gap-2 text-xs text-muted">
          Your name
          <input
            aria-describedby={describedBy("customerName")}
            aria-label="Your name"
            autoComplete="name"
            className={inputClass}
            onChange={(event) =>
              order.update({ customerName: event.target.value })
            }
            value={order.customerName ?? ""}
          />
          <FieldError
            id={`${prefix}-customerName`}
            message={errors.customerName}
          />
        </label>
        <label className="grid gap-2 text-xs text-muted">
          Phone number
          <input
            aria-describedby={describedBy("phone")}
            aria-label="Phone number"
            autoComplete="tel"
            className={inputClass}
            inputMode="tel"
            onChange={(event) => order.update({ phone: event.target.value })}
            placeholder="+91"
            value={order.phone ?? ""}
          />
          <FieldError id={`${prefix}-phone`} message={errors.phone} />
        </label>
        <label className="grid gap-2 text-xs text-muted">
          Email address (optional)
          <input
            aria-describedby={describedBy("email")}
            aria-label="Email address (optional)"
            autoComplete="email"
            className={inputClass}
            onChange={(event) => order.update({ email: event.target.value })}
            type="email"
            value={order.email ?? ""}
          />
          <FieldError id={`${prefix}-email`} message={errors.email} />
        </label>
        <label className="grid gap-2 text-xs text-muted sm:row-span-2">
          Notes or reference ideas (optional)
          <textarea
            aria-label="Notes or reference ideas (optional)"
            className="min-h-28 resize-y border border-gold/35 bg-transparent p-4 text-charcoal"
            onChange={(event) => order.update({ notes: event.target.value })}
            value={order.notes ?? ""}
          />
        </label>
      </div>
    </div>
  );
}
