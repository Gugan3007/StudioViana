"use client";

import { useId, useState } from "react";

import { builderOptions, site } from "@/lib/data/site";
import {
  bulkEnquirySchema,
  type BulkEnquiry,
} from "@/lib/validation/orderSchema";
import { whatsappLink } from "@/lib/utils";
import { buildBulkMessage, mailtoLink } from "@/lib/utils/whatsapp";

type FieldErrors = Partial<Record<keyof BulkEnquiry, string>>;

const initialValues: BulkEnquiry = {
  budget: "",
  email: "",
  eventDate: "",
  eventType: "",
  message: "",
  name: "",
  organisation: "",
  phone: "",
  quantityRange: "",
};

export function BulkEnquiryForm() {
  const [values, setValues] = useState<BulkEnquiry>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const prefix = useId();
  const update = (field: keyof BulkEnquiry, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const validate = () => {
    const result = bulkEnquirySchema.safeParse(values);
    if (result.success) return result.data;
    const next: FieldErrors = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof BulkEnquiry;
      if (!next[field]) next[field] = issue.message;
    });
    setErrors(next);
    return null;
  };
  const send = (channel: "whatsapp" | "email") => {
    const valid = validate();
    if (!valid) return;
    const message = buildBulkMessage(valid);
    const href =
      channel === "whatsapp"
        ? whatsappLink(message)
        : mailtoLink("Bulk order enquiry — Studio Viana", message);
    window.open(
      href,
      channel === "whatsapp" ? "_blank" : "_self",
      "noopener,noreferrer",
    );
    setSent(true);
  };

  if (sent) {
    return (
      <div className="grid min-h-80 place-items-center border-t border-gold/35 py-12 text-center">
        <div>
          <svg
            aria-hidden="true"
            className="mx-auto h-20 w-20 text-gold"
            fill="none"
            viewBox="0 0 100 100"
          >
            <path
              className="animate-[flower_draw_1.2s_ease-out_both] [stroke-dasharray:260] motion-reduce:animate-none"
              d="M50 86V48m0 0C22 42 21 18 43 26c8 3 9 13 7 22Zm0 0c28-6 29-30 7-22-8 3-9 13-7 22Zm0 14c-17-2-24-14-14-20 7-4 13 3 14 20Zm0 0c17-2 24-14 14-20-7-4-13 3-14 20Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <h3 className="mt-5 font-display text-4xl text-cream">Thank you!</h3>
          <p className="mt-3 text-sm font-light text-cream/70">
            We&apos;ll be in touch with a thoughtful quote and next steps.
          </p>
          <button
            className="mt-6 border-b border-gold pb-1 text-xs uppercase tracking-[0.16em] text-gold-light"
            onClick={() => {
              setValues(initialValues);
              setSent(false);
            }}
            type="button"
          >
            Start another enquiry
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    "min-h-12 border-b border-gold/55 bg-transparent px-1 text-sm text-cream placeholder:text-cream/45 focus:border-gold";
  const field = (
    name: keyof BulkEnquiry,
    label: string,
    control: React.ReactNode,
  ) => (
    <label className="grid gap-2 text-[0.55rem] uppercase tracking-[0.16em] text-gold-light">
      {label}
      {control}
      {errors[name] ? (
        <span
          id={`${prefix}-${name}`}
          aria-live="polite"
          className="normal-case tracking-normal text-[#e6a2a8]"
        >
          {errors[name]}
        </span>
      ) : null}
    </label>
  );

  return (
    <form
      className="border-t border-gold/35 pt-10"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        send("whatsapp");
      }}
    >
      <div className="grid gap-x-7 gap-y-6 md:grid-cols-2 lg:grid-cols-4">
        {field(
          "name",
          "Name",
          <input
            aria-describedby={errors.name ? `${prefix}-name` : undefined}
            aria-label="Name"
            autoComplete="name"
            className={inputClass}
            onChange={(event) => update("name", event.target.value)}
            value={values.name}
          />,
        )}
        {field(
          "organisation",
          "Organisation (optional)",
          <input
            aria-label="Organisation (optional)"
            autoComplete="organization"
            className={inputClass}
            onChange={(event) => update("organisation", event.target.value)}
            value={values.organisation}
          />,
        )}
        {field(
          "phone",
          "Phone",
          <input
            aria-describedby={errors.phone ? `${prefix}-phone` : undefined}
            aria-label="Phone"
            autoComplete="tel"
            className={inputClass}
            inputMode="tel"
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+91"
            value={values.phone}
          />,
        )}
        {field(
          "email",
          "Email (optional)",
          <input
            aria-label="Email (optional)"
            autoComplete="email"
            className={inputClass}
            onChange={(event) => update("email", event.target.value)}
            type="email"
            value={values.email}
          />,
        )}
        {field(
          "eventType",
          "Event type",
          <select
            aria-label="Event type"
            className={inputClass}
            onChange={(event) => update("eventType", event.target.value)}
            value={values.eventType}
          >
            <option className="text-charcoal" value="">
              Choose event
            </option>
            {builderOptions.eventTypes.map((option) => (
              <option key={option} className="text-charcoal" value={option}>
                {option}
              </option>
            ))}
          </select>,
        )}
        {field(
          "quantityRange",
          "Quantity",
          <select
            aria-label="Quantity"
            className={inputClass}
            onChange={(event) => update("quantityRange", event.target.value)}
            value={values.quantityRange}
          >
            <option className="text-charcoal" value="">
              Choose range
            </option>
            {builderOptions.bulkRanges.map((option) => (
              <option key={option} className="text-charcoal" value={option}>
                {option}
              </option>
            ))}
          </select>,
        )}
        {field(
          "eventDate",
          "Event date",
          <input
            aria-label="Event date"
            className={inputClass}
            onChange={(event) => update("eventDate", event.target.value)}
            type="date"
            value={values.eventDate}
          />,
        )}
        {field(
          "budget",
          "Budget per piece (optional)",
          <select
            aria-label="Budget per piece (optional)"
            className={inputClass}
            onChange={(event) => update("budget", event.target.value)}
            value={values.budget}
          >
            <option className="text-charcoal" value="">
              Open to guidance
            </option>
            {builderOptions.budgetRanges.map((option) => (
              <option key={option} className="text-charcoal" value={option}>
                {option}
              </option>
            ))}
          </select>,
        )}
        <div className="md:col-span-2 lg:col-span-3">
          {field(
            "message",
            "Tell us about the occasion",
            <textarea
              aria-label="Tell us about the occasion"
              className="min-h-24 resize-y border-b border-gold/55 bg-transparent p-2 text-sm normal-case tracking-normal text-cream placeholder:text-cream/45"
              onChange={(event) => update("message", event.target.value)}
              placeholder="Palette, gifting format, branding or anything you already know"
              value={values.message}
            />,
          )}
        </div>
        <div className="grid content-end gap-2">
          <button
            className="min-h-12 bg-gold px-4 text-[0.58rem] font-medium uppercase tracking-[0.15em] text-forest"
            type="submit"
          >
            Request a quote on WhatsApp
          </button>
          <button
            className="min-h-12 border border-gold/60 px-4 text-[0.58rem] uppercase tracking-[0.15em] text-cream"
            onClick={() => send("email")}
            type="button"
          >
            Email us at {site.email}
          </button>
        </div>
      </div>
    </form>
  );
}
