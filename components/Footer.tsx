"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-[#1f1f1f] bg-[#050505] pt-16 pb-8 text-[#ececec]">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Left Side: Logo & Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">

            {/* Column 1: Logo + Main Links */}
            <div>
              <div className="mb-8">
                <Image
                  src="/images/WORDMARK CHROME 1.png"
                  alt="Mantra Wordmark"
                  width={130}
                  height={24}
                  className="object-contain"
                />
              </div>
              <ul className="space-y-3 text-xs text-[#ececec]/60 uppercase tracking-widest">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/account" className="hover:text-white transition-colors">Account</Link></li>
              </ul>
            </div>

            {/* Column 2: Policy & Payment */}
            <div className="sm:pt-16">
              <ul className="space-y-3 text-xs text-[#ececec]/60 uppercase tracking-widest">
                <li><Link href="/return-policy" className="hover:text-white transition-colors">Return Policy</Link></li>
                <li><Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                <li><Link href="/order-payment" className="hover:text-white transition-colors">Order & Payment</Link></li>
              </ul>
            </div>

            {/* Column 3: Care & FAQ */}
            <div className="sm:pt-16">
              <ul className="space-y-3 text-xs text-[#ececec]/60 uppercase tracking-widest">
                <li><Link href="/care-instruction" className="hover:text-white transition-colors">Care Instruction</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

          </div>

          {/* Right Side: Newsletter & Social Media */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-8">

            {/* Newsletter Section */}
            <div>
              <h4 className="text-[#ececec] uppercase tracking-widest font-bold mb-2 text-xs">
                JOIN OUR NEWSLETTER
              </h4>
              <p className="text-[#ececec]/60 text-[11px] uppercase tracking-widest mb-4 leading-relaxed">
                Sign up to our newsletter to receive exclusive offers.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] px-4 py-2.5 text-xs uppercase tracking-widest focus:outline-none focus:border-[#ececec] transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#222222] hover:bg-[#333333] text-[#ececec] px-6 py-2 text-xs uppercase tracking-widest border border-[#333333] transition-colors"
                >
                  SUBSCRIBE
                </button>
              </form>
            </div>

            {/* Social Media Section */}
            <div>
              <h4 className="text-[#ececec] uppercase tracking-widest font-bold mb-4 text-xs">
                FOLLOW OUR SOCIAL MEDIA
              </h4>
              <div className="flex items-center space-x-6 text-[#ececec]/70">
                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* Facebook */}
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.37 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.75V8z" />
                  </svg>
                </a>
                {/* Twitter / X */}
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* TikTok */}
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Centered Copyright */}
        <div className="text-center text-[10px] text-[#ececec]/40 uppercase tracking-widest border-t border-[#1f1f1f] pt-8">
          <p>&copy; {new Date().getFullYear()} - MANTRA ALL RIGHTS RESERVED</p>
        </div>

      </div>
    </footer>
  );
}