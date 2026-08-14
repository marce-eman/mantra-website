"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { addToCartAction } from "@/app/actions/cart";

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
}

export default function ProductDetailClient({ product }: { product: ProductProps }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCartStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const [quantity] = useState(1);
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
      image: product.images[0] || "/images/placeholder.jpg",
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
      image: product.images[0] || "/images/placeholder.jpg",
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
        <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#ececec]/40 mb-8">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-white">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#ececec]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full border border-[#1f1f1f] bg-[#111111] overflow-hidden group">
              <Image 
                src={product.images[selectedImage] || "/images/placeholder.jpg"} 
                alt={product.name} 
                fill 
                className="object-cover transition-all duration-300"
                priority
              />
              
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-[#1f1f1f] text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#111] cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-[#1f1f1f] text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#111] cursor-pointer"
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
            
            {/* TAMPILAN HARGA USD (SUDAH DIUBAH) */}
            <p className="text-[#ececec] font-mono text-xl md:text-2xl mb-8">
              ${product.price.toFixed(2)} USD
            </p>

            <div className="prose prose-invert border-y border-[#1f1f1f] py-6 mb-8">
              <p className="text-[#ececec]/80 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selector */}
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
            </div>

            {error && (
              <p className="text-red-500 text-xs uppercase tracking-widest mb-4">{error}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col space-y-4">
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={cn(
                  "w-full py-5 border text-xs uppercase tracking-widest font-bold transition-all cursor-pointer",
                  product.inStock 
                    ? "border-[#1f1f1f] text-[#ececec] hover:bg-[#1f1f1f]" 
                    : "border-[#1f1f1f]/30 text-[#ececec]/30 cursor-not-allowed"
                )}
              >
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </button>

              <button 
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className={cn(
                  "w-full py-5 text-xs uppercase tracking-widest font-bold transition-all cursor-pointer",
                  product.inStock 
                    ? "bg-[#ececec] text-[#050505] hover:bg-white" 
                    : "bg-[#1f1f1f] text-[#050505]/30 cursor-not-allowed"
                )}
              >
                Buy Now
              </button>
            </div>
            
            {/* Shipping Info (SUDAH DIUBAH KE USD/INTERNATIONAL) */}
            <div className="mt-8 text-xs text-[#ececec]/40 uppercase tracking-widest leading-loose">
              <p>• Worldwide shipping available. Rates calculated at checkout.</p>
              <p>• Returns accepted within 14 days of delivery.</p>
              <p>• Ships within 24-48 hours via express courier.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}