"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { useCurrency } from "@/context/CurrencyContext";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Minus, Plus } from "lucide-react";
import { addToCartAction } from "@/app/actions/cart";
import { InlineEditableProduct } from "@/components/inline-edit";
import ProductCard from "@/components/ProductCard";
import { getAssetUrl } from "@/lib/assetUrls";

interface ProductProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  sizes: string[];
  inStock: boolean;
  episodeId?: string | null;
  episode?: any;
}

export default function ProductDetailClient({
  product,
  relatedProducts = [],
  episode,
}: {
  product: ProductProps;
  relatedProducts?: any[];
  episode?: any;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrency();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setError("Please select a size.");
      return;
    }

    if (!session?.user) {
      router.push(`/login?redirect=/shop/${product.slug}`);
      return;
    }

    setError("");

    const result = await addToCartAction(product.id, quantity);

    if (!result.success) {
      setError(result.error || "Failed to add item to cart.");
      return;
    }

    addItem({
      ...product,
      image: getAssetUrl(product.images[0] || "/images/placeholder.jpg"),
      quantity,
      selectedColor: "Exclusive",
      selectedSize,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setError("Please select a size.");
      return;
    }

    if (!session?.user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    addItem({
      ...product,
      image: getAssetUrl(product.images[0] || "/images/placeholder.jpg"),
      quantity,
      selectedColor: "Exclusive",
      selectedSize,
    });

    router.push("/checkout");
  };

  return (
    <div className="bg-[#050505] min-h-screen border-t border-[#1f1f1f]">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#ececec]/40">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-white">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#ececec]">{product.name}</span>
          </div>

          {/* Admin Live Product Edit Button */}
          <InlineEditableProduct product={product} buttonOnly />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full border border-[#1f1f1f] bg-[#111111] overflow-hidden group">
              <Image
                src={getAssetUrl(product.images[selectedImage] || "/images/placeholder.jpg")}
                alt={product.name}
                fill
                className="object-cover transition-all duration-300"
                priority
              />

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/60 sm:bg-black/40 backdrop-blur-sm border border-[#1f1f1f] text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-[#111] cursor-pointer z-10"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/60 sm:bg-black/40 backdrop-blur-sm border border-[#1f1f1f] text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-[#111] cursor-pointer z-10"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "relative aspect-[3/4] border border-[#1f1f1f] overflow-hidden cursor-pointer",
                      selectedImage === idx ? "opacity-100 ring-1 ring-[#ececec]" : "opacity-50 hover:opacity-100"
                    )}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col pt-4 md:pt-12">
            <h1 className="text-3xl md:text-5xl font-black text-[#ececec] uppercase tracking-widest mb-4">
              {product.name}
            </h1>

            {/* PRODUCT PRICE IN ACTIVE CURRENCY */}
            <p className="text-[#ececec] font-mono text-xl md:text-2xl mb-8">
              {formatPrice(product.price)}
            </p>

            <div className="prose prose-invert border-y border-[#1f1f1f] py-6 mb-8">
              <p className="text-[#ececec]/80 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size & Quantity Selectors */}
            <div className="space-y-6 mb-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#ececec] text-xs uppercase tracking-widest">Size</span>
                  <span className="text-[#ececec]/40 text-xs hover:text-white cursor-pointer underline">Size Guide</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "py-3 border border-[#1f1f1f] text-sm font-mono transition-colors cursor-pointer",
                        selectedSize === size ? "bg-[#ececec] text-[#050505]" : "text-[#ececec] hover:bg-[#1f1f1f]"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#ececec] text-xs uppercase tracking-widest">Quantity</span>
                  {product.stock > 0 && (
                    <span className="text-[#ececec]/40 text-[10px] uppercase tracking-wider font-mono">
                      {product.stock} in stock
                    </span>
                  )}
                </div>
                <div className="inline-flex items-center border border-[#1f1f1f] bg-[#0a0a0a]">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1 || !product.inStock}
                    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-[#ececec] hover:bg-[#1f1f1f] hover:text-white transition-colors disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 sm:w-14 text-center font-mono text-sm font-medium text-[#ececec] select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) =>
                        product.stock ? Math.min(product.stock, prev + 1) : prev + 1
                      )
                    }
                    disabled={
                      (product.stock > 0 && quantity >= product.stock) || !product.inStock
                    }
                    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-[#ececec] hover:bg-[#1f1f1f] hover:text-white transition-colors disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs uppercase tracking-widest mb-4">{error}</p>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-[#ececec] text-[#050505] py-5 uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {product.inStock ? "Add to Cart" : "Sold Out"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="w-full border border-[#1f1f1f] text-[#ececec] py-5 uppercase tracking-widest text-xs font-bold hover:bg-[#111111] transition-colors cursor-pointer disabled:opacity-50"
              >
                Buy It Now
              </button>
            </div>
          </div>
        </div>

        {/* --- REKOMENDASI PRODUK DARI EPISODE YANG SAMA --- */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#1f1f1f]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.25em] block mb-2">
                  {episode ? `EPISODE ${episode.episodeNo || "01"} // ` : "RECOMMENDED PIECES"}
                </span>
                <h2 className="text-2xl md:text-4xl font-light tracking-[0.15em] text-[#ececec] uppercase font-serif">
                  {episode?.title ? `MORE FROM ${episode.title}` : "MORE TO EXPLORE"}
                </h2>
              </div>

              <Link
                href="/shop"
                className="text-xs font-mono uppercase tracking-widest text-[#ececec]/60 hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto group"
              >
                <span>Catalogue</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}