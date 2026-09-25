export interface FAQItem {
  readonly answer: string;
  readonly id: string;
  readonly placeholder?: boolean;
  readonly question: string;
}

export const faqItems: readonly FAQItem[] = [
  {
    id: "what-are-chenille-flowers",
    question: "What are chenille flowers?",
    answer:
      "Chenille flowers are sculpted by hand from soft, flexible chenille stems. Every petal, leaf and detail is shaped individually, creating a tactile floral keepsake that never needs water.",
  },
  {
    id: "how-long-they-last",
    question: "How long do they last?",
    answer:
      "They never wilt. With gentle care and a dry place away from direct sunlight, your Studio Viana flowers can remain beautiful for years.",
  },
  {
    id: "customise-colours-and-flowers",
    question: "Can I customise colours and flowers?",
    answer:
      "Yes. Most pieces can be re-imagined in your preferred palette and flower selection. Share your idea in the order builder and we will confirm what is possible on WhatsApp.",
  },
  {
    id: "order-lead-time",
    question: "How long does an order take?",
    answer:
      "Most pieces need 3–7 days to make before delivery. Larger, highly customised and bulk orders may need longer; we will always confirm the lead time before you place the order.",
  },
  {
    id: "delivery-areas",
    question: "Do you deliver? Where?",
    answer:
      "Yes. We arrange delivery across Tamil Nadu, Kerala and other locations in India where our delivery partners can serve safely. Charges and timing are confirmed on WhatsApp.",
    placeholder: true,
  },
  {
    id: "payment-methods",
    question: "How do I pay?",
    answer:
      "Payment is currently arranged by UPI or bank transfer after your order and final total are confirmed on WhatsApp.",
    placeholder: true,
  },
  {
    id: "bulk-orders",
    question: "Do you take bulk and corporate orders?",
    answer:
      "We do. Studio Viana creates flower cards, favours, centrepieces and branded keepsakes for weddings, celebrations and corporate moments, with tailored quantities and pricing.",
  },
  {
    id: "flower-care",
    question: "How do I care for my flowers?",
    answer:
      "Keep them dry, dust gently with a soft brush, and avoid crushing the petals. Store away from prolonged direct sunlight to preserve their colour and shape.",
  },
] as const;
