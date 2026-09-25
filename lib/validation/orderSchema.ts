import { z } from "zod";

const indianPhone = /^(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/;

const optionalTrimmedString = z.string().trim().optional().or(z.literal(""));

export const customerDetailsSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(2, "Please tell us the name we should use."),
    deliveryArea: optionalTrimmedString,
    deliveryMethod: z.enum(["pickup", "delivery"]),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .regex(indianPhone, "Please enter a valid Indian phone number."),
  })
  .superRefine((value, context) => {
    if (value.deliveryMethod === "delivery" && !value.deliveryArea?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Please tell us where you would like this delivered.",
        path: ["deliveryArea"],
      });
    }
  });

export const orderSchema = z
  .object({
    bagItems: z.array(z.unknown()).optional(),
    customPalette: optionalTrimmedString,
    customerName: z.string().trim().min(2),
    deliveryArea: optionalTrimmedString,
    deliveryMethod: z.enum(["pickup", "delivery"]),
    email: z.string().trim().email().optional().or(z.literal("")),
    flowers: z.array(z.string()).default([]),
    messageCard: z.string().max(150).optional(),
    neededBy: z.string().min(1, "Please choose when you need your order."),
    notes: optionalTrimmedString,
    occasion: z.string().min(1, "Please choose an occasion."),
    palettes: z.array(z.string()).min(1).max(3),
    phone: z.string().trim().regex(indianPhone),
    pieceSlug: z.string().min(1),
    quantity: z.number().int().min(1).max(500),
    size: z.enum(["1 bloom", "2 blooms"]).optional(),
    step: z.number().int().min(1).max(5),
    variant: optionalTrimmedString,
    wrapStyle: z.string().min(1),
  })
  .superRefine((value, context) => {
    if (value.deliveryMethod === "delivery" && !value.deliveryArea?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Please tell us where you would like this delivered.",
        path: ["deliveryArea"],
      });
    }
    if (value.palettes.includes("Custom") && !value.customPalette?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Describe the colours you have in mind.",
        path: ["customPalette"],
      });
    }
  });

export const bulkEnquirySchema = z.object({
  budget: optionalTrimmedString,
  email: z.string().trim().email().optional().or(z.literal("")),
  eventDate: z.string().min(1, "Please choose your event date."),
  eventType: z.string().min(1, "Please choose the kind of event."),
  message: z
    .string()
    .trim()
    .min(8, "Tell us a little about what you have in mind."),
  name: z.string().trim().min(2, "Please tell us your name."),
  organisation: optionalTrimmedString,
  phone: z
    .string()
    .trim()
    .regex(indianPhone, "Please enter a valid Indian phone number."),
  quantityRange: z.string().min(1, "Please choose an approximate quantity."),
});

export type BulkEnquiry = z.infer<typeof bulkEnquirySchema>;
export type OrderDraft = z.input<typeof orderSchema>;
