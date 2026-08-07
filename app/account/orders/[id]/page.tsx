import Link from "next/link";
import { ChevronLeft, CheckCircle2, Circle } from "lucide-react";

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const steps = [
    { title: "Order Placed", date: "Oct 12, 10:00 AM", completed: true },
    { title: "Payment Confirmed", date: "Oct 12, 10:15 AM", completed: true },
    { title: "Processing", date: "Oct 13, 09:00 AM", completed: true },
    { title: "Shipped", date: "Oct 14, 14:30 PM", completed: true },
    { title: "Out for Delivery", date: "Pending", completed: false },
    { title: "Delivered", date: "Pending", completed: false },
  ];

  return (
    <div>
      <Link href="/account/orders" className="inline-flex items-center text-xs text-[#ececec]/60 hover:text-white uppercase tracking-widest mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
      </Link>
      
      <div className="border-b border-[#1f1f1f] pb-4 mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[#ececec] uppercase tracking-widest mb-1">
            Order #{params.id}
          </h2>
          <p className="text-[#ececec]/60 text-xs uppercase tracking-widest">
            Tracking ID: JNE8291038102
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Tracking Timeline */}
        <div className="border border-[#1f1f1f] p-6 bg-[#0a0a0a]">
          <h3 className="text-[#ececec] uppercase tracking-widest font-bold text-sm mb-8">Tracking Status</h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#1f1f1f] before:to-transparent">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-[#050505] z-10 ${step.completed ? 'border-green-500 text-green-500' : 'border-[#1f1f1f] text-[#1f1f1f]'}`}>
                  {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-2 h-2 fill-current" />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] p-4 border border-[#1f1f1f] bg-[#050505]">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold text-sm uppercase tracking-wider ${step.completed ? 'text-[#ececec]' : 'text-[#ececec]/40'}`}>{step.title}</h4>
                  </div>
                  <time className="text-xs text-[#ececec]/60 font-mono">{step.date}</time>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details Summary */}
        <div className="space-y-6">
          <div className="border border-[#1f1f1f] p-6 bg-[#0a0a0a]">
            <h3 className="text-[#ececec] uppercase tracking-widest font-bold text-sm mb-4">Items Summary</h3>
            <div className="flex space-x-4">
              <div className="relative w-16 h-20 bg-[#111111] border border-[#1f1f1f]">
                {/* Mock image path */}
                <img src="/images/Rectangle 26.png" className="object-cover w-full h-full" alt="Item" />
                <span className="absolute -top-2 -right-2 bg-[#ececec] text-[#050505] text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">1</span>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[#ececec] text-xs uppercase tracking-widest font-bold mb-1">OPUS ARCANUM T-SHIRT</p>
                <p className="text-[#ececec]/60 text-[10px] uppercase">Black | L</p>
                <p className="text-[#ececec] font-mono text-xs mt-2">Rp 450.000</p>
              </div>
            </div>
            <div className="border-t border-[#1f1f1f] mt-6 pt-4 flex justify-between text-[#ececec] text-sm uppercase tracking-widest font-bold">
              <span>Total</span>
              <span className="font-mono">Rp 500.000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
