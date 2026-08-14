"use client";

import React, { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // --- STATE BARU UNTUK CUSTOM NOTIFIKASI (TOAST) ---
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- FUNGSI PEMANGGIL NOTIFIKASI ---
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    // Notifikasi akan otomatis hilang setelah 3 detik
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleUpdate = async (id: string, currentData: any) => {
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: currentData.status,
          courier: currentData.courier,
          trackingNumber: currentData.trackingNumber,
        }),
      });

      if (res.ok) {
        showToast("Order updated successfully!", "success"); // <--- Menggantikan alert()
        fetchOrders();
      } else {
        showToast("Failed to update order.", "error"); // <--- Menggantikan alert()
      }
    } catch (err) {
      showToast("Error updating order.", "error"); // <--- Menggantikan alert()
    } finally {
      setSavingId(null);
    }
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, [field]: value } : ord))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return <div className="p-8 text-[#ececec] bg-[#050505] min-h-screen font-mono text-sm uppercase tracking-widest">Loading void...</div>;
  }

  return (
    <div className="p-8 bg-[#050505] text-[#ececec] min-h-screen relative overflow-hidden">
      <h1 className="text-2xl font-serif tracking-widest uppercase mb-6">Order Management</h1>

      <div className="overflow-x-auto border border-[#1f1f1f] rounded-lg">
        <table className="w-full text-left text-sm text-[#ececec]/80">
          <thead className="bg-[#0a0a0a] uppercase text-xs tracking-wider text-[#ececec]/50 border-b border-[#1f1f1f]">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Recipient</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Courier</th>
              <th className="p-4">Tracking Number</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-[#ececec]/50 font-mono text-xs uppercase tracking-widest">
                  No orders found in the void.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <React.Fragment key={ord.id}>
                  {/* BARIS UTAMA */}
                  <tr className="hover:bg-[#111111] transition-colors">
                    <td className="p-4 font-mono text-[#ececec]">{ord.orderNumber || ord.id.substring(0,8)}</td>
                    <td className="p-4">
                      <div className="font-bold">{ord.recipientName || ord.user?.name || "Unknown"}</div>
                      <div className="text-xs text-[#ececec]/50 mt-1">{ord.phone || "No Phone"}</div>
                    </td>
                    <td className="p-4 text-emerald-400 font-mono">${ord.totalAmount}</td>
                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleInputChange(ord.id, "status", e.target.value)}
                        className="bg-[#0a0a0a] border border-[#1f1f1f] rounded px-2 py-1.5 text-xs text-[#ececec] focus:outline-none focus:border-[#ececec]/50"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELED">CANCELED</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="e.g. J&T"
                        value={ord.courier || ""}
                        onChange={(e) => handleInputChange(ord.id, "courier", e.target.value)}
                        className="bg-[#0a0a0a] border border-[#1f1f1f] rounded px-2 py-1.5 text-xs text-[#ececec] w-20 focus:outline-none focus:border-[#ececec]/50"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="Receipt No."
                        value={ord.trackingNumber || ""}
                        onChange={(e) => handleInputChange(ord.id, "trackingNumber", e.target.value)}
                        className="bg-[#0a0a0a] border border-[#1f1f1f] rounded px-2 py-1.5 text-xs text-[#ececec] w-32 font-mono focus:outline-none focus:border-[#ececec]/50"
                      />
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(ord.id)}
                        className="border border-[#1f1f1f] text-[#ececec] bg-transparent text-[10px] uppercase tracking-widest px-3 py-1.5 rounded hover:bg-[#1f1f1f] transition-colors"
                      >
                        {expandedId === ord.id ? "Close" : "Details"}
                      </button>
                      <button
                        onClick={() => handleUpdate(ord.id, ord)}
                        disabled={savingId === ord.id}
                        className="bg-[#ececec] text-[#050505] font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded hover:bg-white transition-colors disabled:opacity-50"
                      >
                        {savingId === ord.id ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>

                  {/* BARIS DETAIL */}
                  {expandedId === ord.id && (
                    <tr className="bg-[#0a0a0a]">
                      <td colSpan={7} className="p-6 border-b border-[#1f1f1f]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          
                          {/* Sisi Kiri: Daftar Barang */}
                          <div>
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#ececec]/50 mb-4 border-b border-[#1f1f1f] pb-2">
                              Purchased Items
                            </h4>
                            {ord.items && ord.items.length > 0 ? (
                              <ul className="space-y-3">
                                {ord.items.map((item: any, idx: number) => (
                                  <li key={idx} className="flex justify-between items-start text-xs text-[#ececec]">
                                    <div className="flex flex-col">
                                      <span className="font-bold">{item.productName || item.product?.name || "Unknown Product"}</span>
                                      <span className="text-[#ececec]/50 mt-1">
                                        Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ""}
                                      </span>
                                    </div>
                                    <span className="font-mono text-emerald-400">${item.price}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-red-400/80 italic">
                                Item details not found.
                              </p>
                            )}
                          </div>

                          {/* Sisi Kanan: Alamat Pengiriman */}
                          <div>
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#ececec]/50 mb-4 border-b border-[#1f1f1f] pb-2">
                              Shipping Information
                            </h4>
                            <div className="text-xs text-[#ececec]/80 space-y-1.5 leading-relaxed">
                              <p><span className="text-[#ececec]/40 w-20 inline-block">Address:</span> {ord.address || "N/A"}</p>
                              <p><span className="text-[#ececec]/40 w-20 inline-block">City/Prov:</span> {ord.city || "N/A"}, {ord.province || ""}</p>
                              <p><span className="text-[#ececec]/40 w-20 inline-block">Postal:</span> {ord.postalCode || "N/A"}</p>
                              <p><span className="text-[#ececec]/40 w-20 inline-block">Notes:</span> {ord.notes || "-"}</p>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- KOMPONEN TOAST NOTIFICATION --- */}
      {toast && (
        <div 
          className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-xl shadow-2xl border text-[10px] uppercase tracking-widest transition-all duration-300 transform flex items-center gap-3 ${
            toast.type === "success" 
              ? "bg-[#0a0a0a] border-emerald-500/30 text-emerald-400 translate-y-0 opacity-100" 
              : "bg-[#0a0a0a] border-red-500/30 text-red-400 translate-y-0 opacity-100"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-400" : "bg-red-400"} animate-pulse`} />
          {toast.message}
        </div>
      )}
    </div>
  );
}