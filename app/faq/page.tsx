"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "ORDERS & SHIPPING",
    question: "When will my order ship?",
    answer: "Orders are processed within 24-48 hours. Shipping takes 2-4 business days depending on your region within Indonesia.",
  },
  {
    category: "ORDERS & SHIPPING",
    question: "How do I track my shipment?",
    answer: "Once dispatched, your tracking reference will be updated in your Account dashboard under 'My Orders'. You will also receive an automated confirmation email.",
  },
  {
    category: "SIZING & FIT",
    question: "How does MANTRA sizing work?",
    answer: "Most of our garments feature an oversized, boxy brutalist cut with dropped shoulders. We recommend choosing your true size for the intended oversized fit, or sizing down for a standard fit.",
  },
  {
    category: "PAYMENTS & RETURNS",
    question: "What payment methods do you accept?",
    answer: "We support Bank Transfer (BCA, Mandiri) and instant QRIS payments. Payment codes/QRIS remain active for 24 hours before automatic order expiry.",
  },
  {
    category: "PAYMENTS & RETURNS",
    question: "Can I exchange sizes or return an item?",
    answer: "Size exchanges are valid within 3 days of delivery, provided the tags are intact, unwashed, and in original condition. Return shipping costs are borne by the customer.",
  },
  {
    category: "EPISODES & DROPS",
    question: "Do you restock sold-out items?",
    answer: "No. Every MANTRA drop is produced in strictly limited quantities under individual Episodes. Once an episode sells out, it will never be restocked.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec] pt-24 pb-20 px-6 md:px-12 border-t border-[#1f1f1f]">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Top Navigation */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#ececec]/50 hover:text-white transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Header Section */}
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#ececec]/50 font-mono block">
            // HELP CENTER
          </span>
          <h1 className="text-3xl md:text-5xl font-light tracking-widest uppercase leading-tight">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-[#ececec]/60 text-xs md:text-sm uppercase tracking-widest max-w-2xl leading-relaxed font-light">
            Everything you need to know about MANTRA drops, sizing, shipping, and order management.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  isOpen ? "bg-[#0a0a0a] border-[#ececec]/40" : "bg-[#0a0a0a]/50 border-[#1f1f1f] hover:border-[#2a2a2a]"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest block mb-1">
                      {faq.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#ececec]">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#ececec]/60 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-[#1f1f1f]">
                    <p className="text-xs text-[#ececec]/70 font-light leading-relaxed tracking-wider">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <div className="p-8 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <HelpCircle className="w-8 h-8 text-[#ececec]/40 shrink-0" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-1">STILL HAVE QUESTIONS?</h3>
              <p className="text-xs text-[#ececec]/50 font-light">
                Our support team is available to assist you via WhatsApp or Instagram.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20MANTRA,%20saya%20punya%20pertanyaan."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ececec] text-[#050505] px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors shrink-0 cursor-pointer"
          >
            Ask Support
          </a>
        </div>

      </div>
    </div>
  );
}