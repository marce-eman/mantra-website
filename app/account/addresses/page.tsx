"use client";

import { useState } from "react";
import { Plus, MapPin, Trash2, Check } from "lucide-react";
import { saveUserAddressAction } from "@/app/actions/address";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    label: "",
    recipientName: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
  });

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleDelete = async (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    // Jika semua alamat dihapus, kosongkan kolom address di database
    if (addresses.length <= 1) {
      await saveUserAddressAction("");
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Gabungkan data form menjadi satu string alamat lengkap
    const fullAddressString = `[${formData.label.toUpperCase()}] ${formData.recipientName} (${formData.phone}) - ${formData.street}, ${formData.city}, ${formData.postalCode}`;

    // 1. Simpan ke Supabase
    const result = await saveUserAddressAction(fullAddressString);

    if (result.success) {
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0,
      };

      setAddresses([...addresses, newAddress]);
      setIsModalOpen(false);
      setFormData({
        label: "",
        recipientName: "",
        phone: "",
        street: "",
        city: "",
        postalCode: "",
      });
    } else {
      setErrorMsg(result.error || "Gagal menyimpan alamat.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] p-6 md:p-8 rounded-2xl text-[#ececec]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl uppercase tracking-widest font-light mb-1">
            SAVED ADDRESSES
          </h2>
          <p className="text-xs uppercase tracking-widest text-[#ececec]/50">
            Manage your shipping destinations for a seamless checkout.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#ececec] text-[#050505] px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 border border-[#1f1f1f] rounded-xl bg-[#0a0a0a]">
          <MapPin className="w-8 h-8 text-[#ececec]/20 mx-auto mb-3" />
          <p className="text-xs uppercase tracking-widest text-[#ececec]/40">
            No saved addresses found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`border rounded-xl p-6 bg-[#0a0a0a] flex flex-col justify-between transition-all ${
                addr.isDefault
                  ? "border-[#ececec]/60"
                  : "border-[#1f1f1f] hover:border-[#1f1f1f]/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest bg-[#181818] px-3 py-1 rounded-md border border-[#2a2a2a]">
                    {addr.label || "ADDRESS"}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-medium uppercase tracking-wider mb-1">
                  {addr.recipientName}
                </h3>
                <p className="text-xs text-[#ececec]/50 font-mono mb-3">
                  {addr.phone}
                </p>
                <p className="text-xs text-[#ececec]/70 font-light leading-relaxed mb-4">
                  {addr.street}, {addr.city}, {addr.postalCode}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#1f1f1f] text-xs uppercase tracking-widest">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs text-[#ececec]/50 hover:text-white transition-colors cursor-pointer"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span />
                )}

                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-red-400/70 hover:text-red-400 transition-colors p-1 cursor-pointer ml-auto"
                  title="Delete Address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Address */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 w-full max-w-lg space-y-6">
            <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest">
                Add New Address
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#ececec]/50 hover:text-white text-xs uppercase tracking-widest"
              >
                Close
              </button>
            </div>

            {errorMsg && (
              <p className="text-red-400 text-xs uppercase tracking-widest">{errorMsg}</p>
            )}

            <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1">
                  Address Label (e.g. Home, Office)
                </label>
                <input
                  type="text"
                  required
                  placeholder="HOME"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 text-[#ececec] rounded-lg focus:outline-none focus:border-[#ececec]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.recipientName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipientName: e.target.value,
                      })
                    }
                    className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 text-[#ececec] rounded-lg focus:outline-none focus:border-[#ececec]"
                  />
                </div>
                <div>
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+62 812..."
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 text-[#ececec] rounded-lg focus:outline-none focus:border-[#ececec]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Main Street No. 123"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 text-[#ececec] rounded-lg focus:outline-none focus:border-[#ececec]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1">
                    City / Region
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jakarta"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 text-[#ececec] rounded-lg focus:outline-none focus:border-[#ececec]"
                  />
                </div>
                <div>
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12345"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postalCode: e.target.value,
                      })
                    }
                    className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 text-[#ececec] rounded-lg focus:outline-none focus:border-[#ececec]"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 border border-[#1f1f1f] py-3 uppercase tracking-widest font-bold rounded-lg hover:bg-[#1f1f1f]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-[#ececec] text-[#050505] py-3 uppercase tracking-widest font-bold rounded-lg hover:bg-white cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}