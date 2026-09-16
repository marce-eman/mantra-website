"use client";

import React, { useEffect, useState } from "react";
import { Truck, CreditCard, Package, CheckCircle2, Clock, AlertTriangle, XCircle, Search } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Toast Notification
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

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
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
          paymentStatus: currentData.paymentStatus,
          courier: currentData.courier || currentData.shippingCourier,
          shippingCourier: currentData.shippingCourier,
          shippingService: currentData.shippingService,
          shippingCost: currentData.shippingCost,
          trackingNumber: currentData.trackingNumber,
        }),
      });

      if (res.ok) {
        showToast("Order updated successfully!", "success");
        fetchOrders();
      } else {
        showToast("Failed to update order.", "error");
      }
    } catch {
      showToast("Error updating order.", "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this canceled order?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/orders?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Order deleted permanently.", "success");
        fetchOrders();
      } else {
        showToast("Failed to delete order.", "error");
      }
    } catch {
      showToast("Error deleting order.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleInputChange = (id: string, field: string, value: any) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, [field]: value } : ord))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredOrders = orders.filter((ord) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(query)) ||
      (ord.recipientName && ord.recipientName.toLowerCase().includes(query)) ||
      (ord.email && ord.email.toLowerCase().includes(query)) ||
      (ord.phone && ord.phone.toLowerCase().includes(query)) ||
      (ord.trackingNumber && ord.trackingNumber.toLowerCase().includes(query)) ||
      (ord.shippingCourier && ord.shippingCourier.toLowerCase().includes(query))
    );
  });

  const getPaymentBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" /> PAID
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/60">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      case "EXPIRED":
      case "CANCELLED":
      case "CANCELED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/60">
            <XCircle className="w-3 h-3" /> {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-700">
            {status || "UNKNOWN"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-[#ececec] bg-[#050505] min-h-screen font-mono text-sm uppercase tracking-widest flex items-center justify-center">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#050505] text-[#ececec] min-h-screen relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif tracking-widest uppercase">Order Management</h1>
          <p className="text-xs text-[#ececec]/50 font-mono mt-1">
            Midtrans Snap Payment & Biteship Logistics Gateway
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#ececec]/40" />
          <input
            type="text"
            placeholder="Search Order, Name, Tracking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl pl-9 pr-4 py-2 text-xs text-[#ececec] focus:outline-none focus:border-[#ececec]/60 font-mono uppercase placeholder:normal-case"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-[#1f1f1f] rounded-2xl bg-[#080808]">
        <table className="w-full text-left text-sm text-[#ececec]/80">
          <thead className="bg-[#0e0e0e] uppercase text-[11px] tracking-wider text-[#ececec]/50 border-b border-[#1f1f1f] font-mono">
            <tr>
              <th className="p-4">Order Reference</th>
              <th className="p-4">Customer Details</th>
              <th className="p-4">Grand Total</th>
              <th className="p-4">Payment (Midtrans)</th>
              <th className="p-4">Order Status</th>
              <th className="p-4">Courier (Biteship)</th>
              <th className="p-4">Tracking Number</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#ececec]/50 font-mono text-xs uppercase tracking-widest">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <React.Fragment key={ord.id}>
                  {/* MAIN ROW */}
                  <tr className="hover:bg-[#111111] transition-colors">
                    {/* Order ID */}
                    <td className="p-4 font-mono text-xs text-[#ececec]">
                      <div className="font-bold">{ord.orderNumber || ord.id.substring(0, 8)}</div>
                      <div className="text-[10px] text-[#ececec]/40 mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="font-medium text-xs text-white">
                        {ord.recipientName || ord.user?.name || "Customer"}
                      </div>
                      <div className="text-[11px] text-[#ececec]/50 font-mono mt-0.5">
                        {ord.phone || ord.email || "No Contact"}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="p-4 font-mono text-xs">
                      <div className="text-emerald-400 font-bold">
                        {formatRupiah(ord.totalAmount)}
                      </div>
                      {ord.shippingCost > 0 && (
                        <div className="text-[10px] text-[#ececec]/40">
                          (Shipping: {formatRupiah(ord.shippingCost)})
                        </div>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div>{getPaymentBadge(ord.paymentStatus || "PENDING")}</div>
                        <select
                          value={ord.paymentStatus || "PENDING"}
                          onChange={(e) => handleInputChange(ord.id, "paymentStatus", e.target.value)}
                          className="bg-[#0a0a0a] border border-[#1f1f1f] rounded px-2 py-1 text-[10px] text-[#ececec]/70 focus:outline-none font-mono"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="EXPIRED">EXPIRED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </td>

                    {/* Order Status */}
                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleInputChange(ord.id, "status", e.target.value)}
                        className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-2.5 py-1.5 text-xs text-[#ececec] focus:outline-none focus:border-[#ececec]/50 font-mono"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELED">CANCELED</option>
                      </select>
                    </td>

                    {/* Courier & Shipping */}
                    <td className="p-4 font-mono text-xs">
                      <div className="flex items-center gap-1.5 font-bold uppercase text-[#ececec]">
                        <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {ord.shippingCourier || ord.courier || "N/A"}
                      </div>
                      {ord.shippingService && (
                        <div className="text-[10px] text-[#ececec]/50 uppercase mt-0.5">
                          {ord.shippingService}
                        </div>
                      )}
                    </td>

                    {/* Tracking Number Input */}
                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="Receipt / Resi..."
                        value={ord.trackingNumber || ""}
                        onChange={(e) => handleInputChange(ord.id, "trackingNumber", e.target.value)}
                        className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-1.5 text-xs text-[#ececec] w-36 font-mono focus:outline-none focus:border-emerald-500/50 uppercase"
                      />
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleExpand(ord.id)}
                          className="border border-[#1f1f1f] text-[#ececec] bg-transparent text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                        >
                          {expandedId === ord.id ? "Close" : "Details"}
                        </button>

                        <button
                          onClick={() => handleUpdate(ord.id, ord)}
                          disabled={savingId === ord.id}
                          className="bg-[#ececec] text-[#050505] font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {savingId === ord.id ? "Saving..." : "Save"}
                        </button>

                        {ord.status === "CANCELED" && (
                          <button
                            onClick={() => handleDelete(ord.id)}
                            disabled={deletingId === ord.id}
                            className="border border-red-500/30 text-red-400 bg-transparent font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {deletingId === ord.id ? "..." : "Delete"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED DETAILS */}
                  {expandedId === ord.id && (
                    <tr className="bg-[#0c0c0c]">
                      <td colSpan={8} className="p-6 border-b border-[#1f1f1f]">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          {/* Col 1: Purchased Items */}
                          <div className="bg-[#080808] border border-[#1f1f1f] rounded-xl p-4">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#ececec]/50 mb-3 border-b border-[#1f1f1f] pb-2 flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5" /> Ordered Items ({ord.items?.length || 0})
                            </h4>
                            {ord.items && ord.items.length > 0 ? (
                              <ul className="space-y-3">
                                {ord.items.map((item: any, idx: number) => (
                                  <li key={idx} className="flex justify-between items-start text-xs text-[#ececec]">
                                    <div>
                                      <span className="font-medium">{item.name || item.product?.name || "Product"}</span>
                                      <div className="text-[10px] text-[#ececec]/50 font-mono mt-0.5">
                                        Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ""} {item.color ? `• Color: ${item.color}` : ""}
                                      </div>
                                    </div>
                                    <span className="font-mono text-emerald-400 shrink-0">
                                      {formatRupiah(item.price * item.quantity)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-red-400 italic">No item details recorded.</p>
                            )}
                          </div>

                          {/* Col 2: Shipping Destination */}
                          <div className="bg-[#080808] border border-[#1f1f1f] rounded-xl p-4">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#ececec]/50 mb-3 border-b border-[#1f1f1f] pb-2 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5" /> Shipping Details (Biteship)
                            </h4>
                            <div className="text-xs text-[#ececec]/80 space-y-2 font-mono leading-relaxed">
                              <p><span className="text-[#ececec]/40 block text-[10px] uppercase">Destination Address:</span> {ord.address || "N/A"}</p>
                              <p><span className="text-[#ececec]/40 block text-[10px] uppercase">Courier & Service:</span> {ord.shippingCourier || ord.courier || "-"} ({ord.shippingService || "Standard"})</p>
                              <p><span className="text-[#ececec]/40 block text-[10px] uppercase">Shipping Cost:</span> {formatRupiah(ord.shippingCost)}</p>
                              <p><span className="text-[#ececec]/40 block text-[10px] uppercase">Tracking Number:</span> {ord.trackingNumber || "Pending Dispatch"}</p>
                            </div>
                          </div>

                          {/* Col 3: Midtrans Payment Info */}
                          <div className="bg-[#080808] border border-[#1f1f1f] rounded-xl p-4">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#ececec]/50 mb-3 border-b border-[#1f1f1f] pb-2 flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5" /> Midtrans Transaction
                            </h4>
                            <div className="text-xs text-[#ececec]/80 space-y-2 font-mono leading-relaxed">
                              <p><span className="text-[#ececec]/40 block text-[10px] uppercase">Payment Status:</span> {ord.paymentStatus || "PENDING"}</p>
                              <p><span className="text-[#ececec]/40 block text-[10px] uppercase">Snap Token:</span> <span className="text-[10px] break-all">{ord.snapToken || "N/A"}</span></p>
                              <p><span className="text-[#ececec]/40 block text-[10px] uppercase">Grand Total Charged:</span> {formatRupiah(ord.totalAmount)}</p>
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

      {/* Toast Notification */}
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