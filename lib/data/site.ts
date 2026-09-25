import { whatsappLink } from "@/lib/utils";

export const site = {
  name: "Studio Viana",
  tagline: "Curated with love",
  secondaryLine: "Flowers that never fade, feelings that never end",
  founder: "Dr. Sadhana",
  location: "Tamil Nadu, India",
  url: "https://studioviana.com",
  email: "studioviana30@gmail.com",
  instagramHandle: "@studio_viana.in",
  instagramUrl: "https://www.instagram.com/studio_viana.in",
  whatsappNumber: "919488713438",
  whatsappDisplay: "+91 94887 13438",
  businessHours: "Orders open Mon–Sat, 10 AM – 7 PM",
  deliveryRegions: ["Tamil Nadu", "Kerala", "across India"],
} as const;

export type OrderMode = "whatsapp-direct" | "builder";

/** Switch every product-order entry point without changing component code. */
export const ORDER_MODE: OrderMode = "builder";

export const phaseFiveConfig = {
  bulkThreshold: 20,
  cataloguePath: "/catalogue/studio-viana-catalogue.pdf",
  leadTimeDays: 3,
  leadTimeLabel: "Lead time: 3–7 days*",
} as const;

export const builderOptions = {
  flowers: [
    "Sunflower",
    "Lily",
    "Rose",
    "Tulip",
    "Gerbera",
    "Hydrangea",
    "Orchid",
    "Daisy",
    "Surprise me",
  ],
  palettes: [
    "Blush Pink",
    "Lilac",
    "Ruby Red",
    "Ivory White",
    "Sunshine Yellow",
    "Royal Purple",
    "Peach",
    "Mixed Pastels",
    "Custom",
  ],
  wraps: [
    "Classic cream",
    "Blush pink",
    "Noir black",
    "Sheer white",
    "Let the studio choose",
  ],
  occasions: [
    "Birthday",
    "Anniversary",
    "Wedding",
    "Proposal",
    "Thank you",
    "Congratulations",
    "Get well soon",
    "Return gifts",
    "Corporate",
    "Just because",
    "Other",
  ],
  bulkRanges: ["20–50", "50–100", "100–250", "250+"],
  budgetRanges: ["Under ₹250", "₹250–₹500", "₹500–₹1,000", "₹1,000+"],
  eventTypes: [
    "Wedding",
    "Corporate event",
    "Launch",
    "Felicitation",
    "Birthday or party",
    "Other",
  ],
} as const;

export { whatsappLink };
