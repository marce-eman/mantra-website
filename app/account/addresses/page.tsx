"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, MapPin, Trash2, Check, Search, Loader2, Pencil, ChevronDown } from "lucide-react";
import { saveUserAddressAction, getUserAddressAction } from "@/app/actions/address";
import { cn } from "@/lib/utils";

const PRESET_LABELS = ["HOME", "OFFICE", "APARTMENT"];

interface BiteshipArea {
  id: string;
  name: string;
  country_name?: string;
  province?: string;
  city?: string;
  district?: string;
  postal_code: string;
}

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  areaId?: string;
  areaName?: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Label dropdown & custom state
  const [labelType, setLabelType] = useState("HOME");
  const [customLabel, setCustomLabel] = useState("");

  // Biteship Area Autocomplete State for Modal
  const [areaSearchInput, setAreaSearchInput] = useState("");
  const [selectedArea, setSelectedArea] = useState<BiteshipArea | null>(null);
  const [areaResults, setAreaResults] = useState<BiteshipArea[]>([]);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const areaDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    label: "HOME",
    recipientName: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
  });

  // --- MENGAMBIL DATA DARI DATABASE SAAT HALAMAN DIBUKA ---
  useEffect(() => {
    async function loadAddress() {
      const dbAddress = await getUserAddressAction();

      if (dbAddress && dbAddress !== "-") {
        try {
          const parsed = JSON.parse(dbAddress);
          if (parsed && typeof parsed === "object") {
            setAddresses([{
              id: "db-address-1",
              label: parsed.label || "SAVED",
              recipientName: parsed.recipientName || "Customer",
              phone: parsed.phone || "-",
              street: parsed.street || parsed.street_details || "",
              areaId: parsed.area_id || parsed.areaId || "",
              areaName: parsed.area_name || parsed.areaName || "",
              city: parsed.city || "",
              district: parsed.district || "",
              province: parsed.province || "",
              postalCode: parsed.postal_code || parsed.postalCode || "",
              isDefault: true,
            }]);
            return;
          }
        } catch (e) {
          // Legacy string fallback
        }

        // Coba ngekstrak format legacy: [LABEL] Nama (Phone) - Jalan
        let label = "SAVED";
        let name = "Customer";
        let phone = "-";
        let street = dbAddress;
        let postalCode = "";

        const match = dbAddress.match(/\[(.*?)\] (.*?) \((.*?)\) - (.*)/);
        if (match) {
          label = match[1];
          name = match[2];
          phone = match[3];
          street = match[4];
        }
        const postalMatch = dbAddress.match(/\b(\d{5})\b/);
        if (postalMatch) {
          postalCode = postalMatch[1];
        }

        setAddresses([{
          id: "db-address-legacy",
          label,
          recipientName: name,
          phone,
          street,
          city: "",
          postalCode,
          isDefault: true,
        }]);
      }
    }
    loadAddress();
  }, []);

  // Search Biteship Areas via debounced API in Modal
  useEffect(() => {
    const query = areaSearchInput.trim();
    if (query.length < 2) {
      setAreaResults([]);
      setIsSearchingArea(false);
      return;
    }

    if (selectedArea && query === selectedArea.name) {
      return;
    }

    setIsSearchingArea(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/biteship/areas?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.areas)) {
          setAreaResults(data.areas);
          setShowAreaDropdown(true);
        } else {
          setAreaResults([]);
        }
      } catch (e) {
        console.error("Area search error:", e);
      } finally {
        setIsSearchingArea(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [areaSearchInput, selectedArea]);

  // Click outside to close area dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target as Node)) {
        setShowAreaDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectArea = (area: BiteshipArea) => {
    setSelectedArea(area);
    setAreaSearchInput(area.name);
    setShowAreaDropdown(false);
    setFormData((prev) => ({
      ...prev,
      city: area.city || area.district || "",
      postalCode: area.postal_code || "",
    }));
  };

  // --- SET DEFAULT KE DATABASE ---
  const handleSetDefault = async (id: string) => {
    const selected = addresses.find((addr) => addr.id === id);

    if (selected) {
      const payload = JSON.stringify({
        label: selected.label.toUpperCase(),
        recipientName: selected.recipientName,
        phone: selected.phone,
        street: selected.street,
        area_id: selected.areaId || "",
        area_name: selected.areaName || "",
        city: selected.city || "",
        district: selected.district || "",
        province: selected.province || "",
        postal_code: selected.postalCode || "",
      });
      await saveUserAddressAction(payload);
    }

    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleDelete = async (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    if (addresses.length <= 1) {
      await saveUserAddressAction("-");
    }
  };

  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setLabelType("HOME");
    setCustomLabel("");
    setFormData({ label: "HOME", recipientName: "", phone: "", street: "", city: "", postalCode: "" });
    setSelectedArea(null);
    setAreaSearchInput("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: Address) => {
    setEditingAddressId(addr.id);
    const rawLabel = (addr.label || "HOME").toUpperCase();
    if (PRESET_LABELS.includes(rawLabel)) {
      setLabelType(rawLabel);
      setCustomLabel("");
    } else {
      setLabelType("OTHER");
      setCustomLabel(rawLabel);
    }

    setFormData({
      label: rawLabel,
      recipientName: addr.recipientName || "",
      phone: addr.phone || "",
      street: addr.street || "",
      city: addr.city || "",
      postalCode: addr.postalCode || "",
    });
    if (addr.areaId || addr.areaName) {
      setSelectedArea({
        id: addr.areaId || "",
        name: addr.areaName || "",
        city: addr.city || "",
        district: addr.district || "",
        province: addr.province || "",
        postal_code: addr.postalCode || "",
      });
      setAreaSearchInput(addr.areaName || "");
    } else {
      setSelectedArea(null);
      setAreaSearchInput(addr.city ? `${addr.city} ${addr.postalCode}`.trim() : "");
    }
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddressId(null);
    setLabelType("HOME");
    setCustomLabel("");
    setFormData({ label: "HOME", recipientName: "", phone: "", street: "", city: "", postalCode: "" });
    setSelectedArea(null);
    setAreaSearchInput("");
    setErrorMsg("");
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const payload = JSON.stringify({
      label: formData.label.toUpperCase(),
      recipientName: formData.recipientName,
      phone: formData.phone,
      street: formData.street,
      area_id: selectedArea?.id || "",
      area_name: selectedArea?.name || "",
      city: selectedArea?.city || formData.city || "",
      district: selectedArea?.district || "",
      province: selectedArea?.province || "",
      postal_code: selectedArea?.postal_code || formData.postalCode || "",
    });

    const result = await saveUserAddressAction(payload);

    if (result.success) {
      if (editingAddressId) {
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === editingAddressId
              ? {
                  ...addr,
                  label: formData.label.toUpperCase(),
                  recipientName: formData.recipientName,
                  phone: formData.phone,
                  street: formData.street,
                  areaId: selectedArea?.id || "",
                  areaName: selectedArea?.name || "",
                  city: selectedArea?.city || formData.city || "",
                  district: selectedArea?.district || "",
                  province: selectedArea?.province || "",
                  postalCode: selectedArea?.postal_code || formData.postalCode || "",
                }
              : addr
          )
        );
      } else {
        const newAddress: Address = {
          id: Date.now().toString(),
          label: formData.label.toUpperCase(),
          recipientName: formData.recipientName,
          phone: formData.phone,
          street: formData.street,
          areaId: selectedArea?.id || "",
          areaName: selectedArea?.name || "",
          city: selectedArea?.city || formData.city || "",
          district: selectedArea?.district || "",
          province: selectedArea?.province || "",
          postalCode: selectedArea?.postal_code || formData.postalCode || "",
          isDefault: addresses.length === 0,
        };
        setAddresses([...addresses, newAddress]);
      }
      handleCloseModal();
    } else {
      setErrorMsg(result.error || "Failed to save address.");
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
            Manage your shipping destinations with instant Biteship location integration.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-[#ececec] text-[#050505] px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 border border-[#1f1f1f] rounded-xl bg-[#0a0a0a]">
          <MapPin className="w-8 h-8 text-[#ececec]/20 mx-auto mb-3" />
          <p className="text-xs uppercase tracking-widest text-[#ececec]/40 font-mono">
            No saved addresses found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`border rounded-2xl p-6 bg-[#0a0a0a] flex flex-col justify-between transition-all ${addr.isDefault
                  ? "border-emerald-500/60 shadow-lg shadow-emerald-950/20"
                  : "border-[#1f1f1f] hover:border-[#2a2a2a]"
                }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest bg-[#181818] px-3 py-1 rounded-md border border-[#2a2a2a]">
                    {addr.label || "ADDRESS"}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-full flex items-center gap-1 font-mono">
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
                <p className="text-xs text-[#ececec]/80 font-light leading-relaxed mb-2">
                  {addr.street}
                </p>
                {addr.areaName ? (
                  <p className="text-[11px] text-emerald-400/90 font-mono bg-[#141414] p-2 rounded-lg border border-[#1f1f1f] mb-4">
                    📍 {addr.areaName}
                  </p>
                ) : (
                  <p className="text-[11px] text-[#ececec]/50 font-mono mb-4">
                    {addr.city} {addr.postalCode && `• Postal Code: ${addr.postalCode}`}
                  </p>
                )}
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

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleOpenEditModal(addr)}
                    className="text-[#ececec]/60 hover:text-white hover:bg-[#1f1f1f] transition-colors p-1.5 rounded-lg cursor-pointer flex items-center justify-center"
                    title="Edit Address"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-red-400/70 hover:text-red-400 hover:bg-red-950/30 transition-colors p-1.5 rounded-lg cursor-pointer flex items-center justify-center"
                    title="Delete Address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Address */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 w-full max-w-lg space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest">
                {editingAddressId ? "Edit Shipping Address" : "Add New Shipping Address"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-[#ececec]/50 hover:text-white text-xs uppercase tracking-widest cursor-pointer"
              >
                Close
              </button>
            </div>

            {errorMsg && (
              <p className="text-red-400 text-xs uppercase tracking-widest">{errorMsg}</p>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1 font-mono text-[10px]">
                    Address Label *
                  </label>
                  <div className="space-y-2">
                    <div className="relative flex items-center">
                      <select
                        value={labelType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLabelType(val);
                          if (val !== "OTHER") {
                            setFormData((prev) => ({ ...prev, label: val }));
                          } else {
                            setFormData((prev) => ({ ...prev, label: customLabel || "OTHER" }));
                          }
                        }}
                        className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 text-[#ececec] rounded-xl focus:outline-none focus:border-[#ececec] uppercase font-mono text-xs cursor-pointer appearance-none pr-9"
                      >
                        <option value="HOME" className="bg-[#111111] text-[#ececec]">HOME</option>
                        <option value="OFFICE" className="bg-[#111111] text-[#ececec]">OFFICE</option>
                        <option value="APARTMENT" className="bg-[#111111] text-[#ececec]">APARTMENT</option>
                        <option value="OTHER" className="bg-[#111111] text-[#ececec]">OTHER (CUSTOM)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#ececec]/40 absolute right-3 pointer-events-none" />
                    </div>

                    {labelType === "OTHER" && (
                      <input
                        type="text"
                        required
                        placeholder="e.g. STUDIO, VILLA"
                        value={customLabel}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setCustomLabel(val);
                          setFormData((prev) => ({ ...prev, label: val || "OTHER" }));
                        }}
                        className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-2.5 text-[#ececec] rounded-xl focus:outline-none focus:border-[#ececec] uppercase font-mono text-xs"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1 font-mono text-[10px]">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={formData.recipientName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipientName: e.target.value,
                      })
                    }
                    className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 text-[#ececec] rounded-xl focus:outline-none focus:border-[#ececec]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1 font-mono text-[10px]">
                  Phone Number (WhatsApp Active) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 text-[#ececec] rounded-xl focus:outline-none focus:border-[#ececec] font-mono"
                />
              </div>

              {/* Biteship Area Search Autocomplete */}
              <div className="relative" ref={areaDropdownRef}>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[#ececec]/60 uppercase tracking-widest font-mono text-[10px]">
                    Destination Area / City / Postal Code (Biteship Maps) *
                  </label>
                  {selectedArea && (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" /> Selected
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-[#ececec]/40 absolute left-3.5 pointer-events-none z-10" />
                  <input
                    type="text"
                    required
                    placeholder="Search district, city, or postal code (e.g. Pontianak Selatan)..."
                    value={areaSearchInput}
                    onChange={(e) => {
                      setAreaSearchInput(e.target.value);
                      setShowAreaDropdown(true);
                    }}
                    onFocus={() => {
                      if (areaResults.length > 0) setShowAreaDropdown(true);
                    }}
                    className="w-full bg-[#0a0a0a] border border-[#1f1f1f] pl-10 pr-10 py-3 text-[#ececec] rounded-xl focus:outline-none focus:border-[#ececec] font-mono"
                  />
                  {isSearchingArea && (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3.5 pointer-events-none" />
                  )}
                </div>

                {/* Dropdown Suggestions */}
                {showAreaDropdown && areaResults.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-2 bg-[#0e0e0e] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                    <div className="p-2 text-[10px] uppercase tracking-widest text-[#ececec]/40 font-mono border-b border-[#1f1f1f]">
                      Location Suggestions ({areaResults.length})
                    </div>
                    {areaResults.map((area) => (
                      <div
                        key={area.id}
                        onClick={() => handleSelectArea(area)}
                        className="p-3 hover:bg-[#181818] cursor-pointer border-b border-[#181818] last:border-0 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-white line-clamp-1">
                              {area.district ? `${area.district}, ${area.city}` : area.name}
                            </p>
                            <p className="text-[10px] text-[#ececec]/60 font-mono">
                              {area.province}
                            </p>
                          </div>
                        </div>
                        {area.postal_code && (
                          <span className="bg-[#1f1f1f] text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-[#2a2a2a] shrink-0 font-bold">
                            {area.postal_code}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1 font-mono text-[10px]">
                  Street Address & House Details *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Jl. Gajah Mada No. 12, Gang Delima, RT 02/RW 03 (House notes)"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] p-3 text-[#ececec] rounded-xl focus:outline-none focus:border-[#ececec]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-1/2 border border-[#1f1f1f] py-3 uppercase tracking-widest font-bold rounded-xl hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-[#ececec] text-[#050505] py-3 uppercase tracking-widest font-bold rounded-xl hover:bg-white cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {loading ? "Saving..." : editingAddressId ? "Save Changes" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}