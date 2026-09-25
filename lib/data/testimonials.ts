import type { StaticImageData } from "next/image";

import anniversaryPhoto from "@/public/images/gallery/gallery-14.jpg";
import birthdayPhoto from "@/public/images/gallery/gallery-15.jpg";
import cardPhoto from "@/public/images/gallery/gallery-01.jpg";
import hamperPhoto from "@/public/images/gallery/gallery-16.jpg";
import violetPhoto from "@/public/images/gallery/gallery-11.jpg";

export interface TestimonialData {
  readonly id: string;
  readonly name: string;
  readonly occasion: string;
  readonly photo?: StaticImageData;
  readonly placeholder: true;
  readonly product: string;
  readonly quote: string;
}

export interface TrustStat {
  readonly label: string;
  readonly numericTarget?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly value: string;
}

// PLACEHOLDER — replace with real customer reviews before public launch.
export const testimonials: readonly TestimonialData[] = [
  { id: "t01", name: "Ananya R.", occasion: "Anniversary", product: "Large Statement Bouquet", quote: "The bouquet felt deeply personal — every colour was considered, and it still looks as beautiful as the day I gifted it.", photo: anniversaryPhoto, placeholder: true },
  { id: "t02", name: "Meera S.", occasion: "Birthday", product: "Medium Bouquet", quote: "It arrived wrapped with such care. My sister kept noticing tiny details in the petals and pearls all evening.", photo: birthdayPhoto, placeholder: true },
  { id: "t03", name: "Kavya P.", occasion: "Return Gifts", product: "Flower Cards", quote: "Each guest took home something thoughtful instead of something disposable. The flower cards were the loveliest memory of the day.", photo: cardPhoto, placeholder: true },
  { id: "t04", name: "Rhea M.", occasion: "Congratulations", product: "Just For You Hamper", quote: "The colours were exactly right for her, and the handcrafted bouquet made the whole hamper feel one of a kind.", photo: hamperPhoto, placeholder: true },
  { id: "t05", name: "Nithya K.", occasion: "Just Because", product: "Violet Edit", quote: "A quiet little gift that became the centre of her desk. It is soft, joyful and genuinely made to last.", photo: violetPhoto, placeholder: true },
] as const;

export const trustStats: readonly TrustStat[] = [
  { label: "Blooms handcrafted", numericTarget: 500, suffix: "+", value: "500+" },
  { label: "Made to order", numericTarget: 100, suffix: "%", value: "100%" },
  { label: "Never fades", value: "∞" },
  { label: "Customer love", prefix: "★ ", value: "★ 5.0" },
] as const;

