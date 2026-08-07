"use client";

import { useState } from "react";
import { MapPin, Plus, Edit2, Trash2 } from "lucide-react";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([
    { id: 1, label: "Home", name: "Guest User", address: "Jl. Sudirman No. 1, Jakarta Pusat, 10220", isPrimary: true }
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-[#1f1f1f] pb-4">
        <h2 className="text-2xl font-bold text-[#ececec] uppercase tracking-widest">
          Address Book
        </h2>
        <button className="flex items-center text-xs uppercase tracking-widest bg-[#ececec] text-[#050505] px-4 py-2 font-bold hover:bg-white transition-colors">
          <Plus className="w-4 h-4 mr-1" /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map(addr => (
          <div key={addr.id} className="border border-[#1f1f1f] p-6 bg-[#0a0a0a] relative">
            {addr.isPrimary && (
              <span className="absolute top-4 right-4 bg-[#1f1f1f] text-[#ececec] text-[10px] px-2 py-1 uppercase tracking-widest font-bold">
                Primary
              </span>
            )}
            <div className="flex items-start mb-4">
              <MapPin className="w-5 h-5 text-[#ececec]/60 mr-3 mt-0.5" />
              <div>
                <h3 className="text-[#ececec] text-sm uppercase tracking-widest font-bold mb-1">{addr.label}</h3>
                <p className="text-[#ececec]/80 text-xs mb-1">{addr.name}</p>
                <p className="text-[#ececec]/60 text-xs leading-relaxed">{addr.address}</p>
              </div>
            </div>
            <div className="flex space-x-4 mt-6 border-t border-[#1f1f1f] pt-4">
              <button className="text-[#ececec]/60 hover:text-white flex items-center text-xs uppercase tracking-widest transition-colors">
                <Edit2 className="w-3 h-3 mr-1" /> Edit
              </button>
              <button className="text-red-500/60 hover:text-red-500 flex items-center text-xs uppercase tracking-widest transition-colors">
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
