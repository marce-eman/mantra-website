export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  inStock: boolean;
  colors: string[];
  sizes: string[];
}

export const products: Product[] = [
  {
    id: "prod_1",
    slug: "opus-arcanum-t-shirt",
    name: "OPUS ARCANUM T-SHIRT",
    price: 450000,
    image: "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/rectangle-26.webp",
    images: [
      "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/rectangle-26.webp",
      "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/rectangle-28.webp",
    ],
    description: "A manifestation of shadows. Crafted from heavyweight 230gsm cotton with a distressed, brutalist aesthetic. The Opus Arcanum print is designed to fade uniquely with every wash.",
    inStock: true,
    colors: ["Black", "Charcoal"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "prod_2",
    slug: "nocturne-cargo-pants",
    name: "NOCTURNE CARGO PANTS",
    price: 650000,
    image: "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/rectangle-28.webp",
    images: [
      "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/rectangle-28.webp",
      "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/rectangle-29.webp",
    ],
    description: "Utilitarian design meets gothic architecture. These cargos feature asymmetrical pockets and adjustable hemlines.",
    inStock: true,
    colors: ["Black", "Olive Drab"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "prod_3",
    slug: "void-heavyweight-hoodie",
    name: "VOID HEAVYWEIGHT HOODIE",
    price: 750000,
    image: "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/mantra-kv-final-1.webp",
    images: [
      "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/mantra-kv-final-1.webp",
      "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/rectangle-31.webp",
    ],
    description: "The abyss stares back. A 400gsm French Terry hoodie with an oversized drop-shoulder fit and our signature minimal branding.",
    inStock: false,
    colors: ["Black"],
    sizes: ["M", "L", "XL", "XXL"]
  },
  {
    id: "prod_4",
    slug: "ethereal-chain",
    name: "ETHEREAL SILVER CHAIN",
    price: 350000,
    image: "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/rectangle-29.webp",
    images: [
      "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/rectangle-29.webp",
      "https://xcorxezfhjmncyxegrvi.supabase.co/storage/v1/object/public/site-assets/rectangle-32.webp",
    ],
    description: "Industrial grade stainless steel chain. Does not tarnish, does not forgive.",
    inStock: true,
    colors: ["Silver"],
    sizes: ["OS"]
  }
];

export const getProductBySlug = (slug: string) => {
  return products.find(p => p.slug === slug);
};
