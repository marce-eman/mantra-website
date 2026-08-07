"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import { getProductBySlug } from "@/data/products";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const router = useRouter();
  
  const { addItem } = useCartStore();
  const { isGuest } = useUserStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  if (!product) {
    return notFound();
  }

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      setError("Please select color and size.");
      return;
    }
    setError("");
    addItem({
      ...product,
      quantity,
      selectedColor,
      selectedSize
    });
  };

  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      setError("Please select color and size.");
      return;
    }
    
    // Add to cart first
    addItem({
      ...product,
      quantity,
      selectedColor,
      selectedSize
    });

    // Guest Guard Logic
    if (isGuest) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
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
            <div className="relative aspect-[3/4] w-full border border-[#1f1f1f] bg-[#111111] overflow-hidden">
              <Image 
                src={product.images[selectedImage]} 
                alt={product.name} 
                fill 
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative aspect-[3/4] border border-[#1f1f1f] overflow-hidden",
                    selectedImage === idx ? "opacity-100 ring-1 ring-[#ececec]" : "opacity-50 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col pt-4 md:pt-12">
            <h1 className="text-3xl md:text-5xl font-black text-[#ececec] uppercase tracking-widest mb-4">
              {product.name}
            </h1>
            <p className="text-[#ececec] font-mono text-xl md:text-2xl mb-8">
              Rp {product.price.toLocaleString('id-ID')}
            </p>

            <div className="prose prose-invert border-y border-[#1f1f1f] py-6 mb-8">
              <p className="text-[#ececec]/80 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Selectors */}
            <div className="space-y-6 mb-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#ececec] text-xs uppercase tracking-widest">Color</span>
                  <span className="text-[#ececec]/40 text-xs font-mono">{selectedColor}</span>
                </div>
                <div className="flex space-x-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-4 py-2 border border-[#1f1f1f] text-xs uppercase tracking-widest transition-colors",
                        selectedColor === color ? "bg-[#ececec] text-[#050505]" : "text-[#ececec] hover:bg-[#1f1f1f]"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

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
                        "py-3 border border-[#1f1f1f] text-sm font-mono transition-colors",
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
                  "w-full py-5 border text-xs uppercase tracking-widest font-bold transition-all",
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
                  "w-full py-5 text-xs uppercase tracking-widest font-bold transition-all",
                  product.inStock 
                    ? "bg-[#ececec] text-[#050505] hover:bg-white" 
                    : "bg-[#1f1f1f] text-[#050505]/30 cursor-not-allowed"
                )}
              >
                Buy Now
              </button>
            </div>
            
            {/* Shipping Info */}
            <div className="mt-8 text-xs text-[#ececec]/40 uppercase tracking-widest leading-loose">
              <p>• Free shipping on orders over Rp 1,500,000.</p>
              <p>• Returns accepted within 14 days of delivery.</p>
              <p>• Ships within 24-48 hours via premium courier.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
