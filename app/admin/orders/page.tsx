"use client";

import React, { useEffect, useState } from "react";
import {
  Truck,
  CreditCard,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Eye,
  Save,
  Trash2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchOrders = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Order ID copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdate = async (id: string, currentData: any) => {
    if (currentData.status === "SHIPPED" && !currentData.trackingNumber?.trim()) {
      showToast("Peringatan: Harap isi nomor resi saat status SHIPPED.", "error");
      return;
    }

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
        fetchOrders(false);
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
        fetchOrders(false);
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
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-semibold whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" /> PAID
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/60 font-semibold whitespace-nowrap">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      case "EXPIRED":
      case "CANCELLED":
      case "CANCELED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/60 font-semibold whitespace-nowrap">
            <XCircle className="w-3 h-3" /> {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-700 whitespace-nowrap">
            {status || "UNKNOWN"}
          </span>
        );
    }
  };

  // Quick metrics
  const totalOrdersCount = orders.length;
  const paidCount = orders.filter((o) => o.paymentStatus === "PAID").length;
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;

  if (loading) {
    return (
      <div className="p-8 text-[#ececec] bg-[#050505] min-h-screen font-mono text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
        Loading orders...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#050505] text-[#ececec] min-h-screen w-full">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-serif tracking-widest uppercase">
            Order Management
          </h1>
          <p className="text-xs text-[#ececec]/50 font-mono mt-1">
            Midtrans Snap Payment & Biteship Logistics Gateway
          </p>
        </div>

        {/* Search & Refresh Bar */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#ececec]/40" />
            <input
              type="text"
              placeholder="Search Order, Name, Tracking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl pl-9 pr-4 py-2 text-xs text-[#ececec] focus:outline-none focus:border-[#ececec]/60 font-mono uppercase placeholder:normal-case placeholder:text-[#ececec]/30"
            />
          </div>

          <button
            onClick={() => fetchOrders(false)}
            disabled={isRefreshing}
            className="p-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-[#ececec]/70 hover:text-white hover:border-[#333333] transition-all cursor-pointer shrink-0"
            title="Refresh Orders"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-emerald-400")} />
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono">
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-xl">
          <span className="text-[10px] uppercase tracking-wider text-[#ececec]/40 block">Total Orders</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{totalOrdersCount}</span>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-xl">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400/70 block">Paid Orders</span>
          <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{paidCount}</span>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-xl">
          <span className="text-[10px] uppercase tracking-wider text-sky-400/70 block">Shipped (In Transit)</span>
          <span className="text-lg font-bold text-sky-400 mt-0.5 block">{shippedCount}</span>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-3 rounded-xl">
          <span className="text-[10px] uppercase tracking-wider text-purple-400/70 block">Completed</span>
          <span className="text-lg font-bold text-purple-400 mt-0.5 block">{completedCount}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE RESPONSIVE ORDER CARDS (Visible on mobile screens < md)           */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-[#ececec]/50 font-mono text-xs uppercase tracking-widest bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl">
            No orders found.
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-4 space-y-4 shadow-xl"
            >
              {/* Header: Reference + Date + Payment Status Badge */}
              <div className="flex items-start justify-between border-b border-[#1f1f1f] pb-3">
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                    <span className="tracking-wider">{ord.orderNumber || ord.id.substring(0, 8)}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(ord.orderNumber || ord.id, ord.id)}
                      className="p-1 text-[#ececec]/50 hover:text-white"
                      title="Copy Reference"
                    >
                      {copiedId === ord.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-[#ececec]/40 font-mono block mt-0.5">
                    {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div>{getPaymentBadge(ord.paymentStatus || "PENDING")}</div>
              </div>

              {/* Customer & Total Details */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase text-[#ececec]/40 block">Customer</span>
                  <span className="text-white font-medium block truncate">
                    {ord.recipientName || ord.user?.name || "Customer"}
                  </span>
                  <span className="text-[10px] text-[#ececec]/50 truncate block mt-0.5">
                    {ord.phone || ord.email || "No Contact"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-[#ececec]/40 block">Grand Total</span>
                  <span className="text-emerald-400 font-bold text-sm block">
                    {formatRupiah(ord.totalAmount)}
                  </span>
                  {ord.shippingCost > 0 && (
                    <span className="text-[10px] text-[#ececec]/40 block">
                      Ship: {formatRupiah(ord.shippingCost)}
                    </span>
                  )}
                </div>
              </div>

              {/* Order Status & Payment Dropdowns */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div>
                  <label className="text-[10px] uppercase text-[#ececec]/50 block mb-1">
                    Order Status
                  </label>
                  <select
                    value={ord.status}
                    onChange={(e) => handleInputChange(ord.id, "status", e.target.value)}
                    className="w-full bg-[#111111] border border-[#222222] rounded-xl px-2.5 py-2 text-xs text-[#ececec] focus:outline-none focus:border-emerald-400 font-mono"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELED">CANCELED</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[#ececec]/50 block mb-1">
                    Payment Status
                  </label>
                  <select
                    value={ord.paymentStatus || "PENDING"}
                    onChange={(e) => handleInputChange(ord.id, "paymentStatus", e.target.value)}
                    className="w-full bg-[#111111] border border-[#222222] rounded-xl px-2.5 py-2 text-xs text-[#ececec] focus:outline-none focus:border-emerald-400 font-mono"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Courier & Tracking Number Input */}
              <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] uppercase text-[#ececec]/50 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" /> Courier
                  </span>
                  <span className="font-bold text-white uppercase">
                    {ord.shippingCourier || ord.courier || "N/A"}{" "}
                    {ord.shippingService ? `(${ord.shippingService})` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#ececec]/50 block mb-1 font-mono">
                    Tracking Number (Resi)
                  </span>
                  {ord.status === "SHIPPED" || ord.status === "COMPLETED" ? (
                    <input
                      type="text"
                      placeholder="Enter waybill / resi..."
                      value={ord.trackingNumber || ""}
                      onChange={(e) => handleInputChange(ord.id, "trackingNumber", e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-[#ececec] font-mono focus:outline-none focus:border-emerald-400 uppercase"
                    />
                  ) : (
                    <div className="bg-[#0a0a0a]/50 border border-[#1f1f1f] rounded-lg px-3 py-2 text-xs text-zinc-600 font-mono text-center select-none">
                      Only SHIPPED Status
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Action Buttons: DETAILS & SAVE & DELETE */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => toggleExpand(ord.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-[#2a2a2a] bg-[#111111] hover:bg-[#1c1c1c] text-[#ececec] text-xs font-mono uppercase tracking-wider py-2.5 rounded-xl cursor-pointer transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{expandedId === ord.id ? "Hide Details" : "Details"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdate(ord.id, ord)}
                  disabled={savingId === ord.id}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-950/40 disabled:opacity-50"
                >
                  {savingId === ord.id ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Order</span>
                    </>
                  )}
                </button>

                {ord.status === "CANCELED" && (
                  <button
                    type="button"
                    onClick={() => handleDelete(ord.id)}
                    disabled={deletingId === ord.id}
                    className="p-2.5 border border-red-500/40 text-red-400 bg-red-950/30 hover:bg-red-900/40 rounded-xl cursor-pointer"
                    title="Delete Canceled Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Mobile Expanded Details */}
              {expandedId === ord.id && (
                <div className="border-t border-[#1f1f1f] pt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Ordered Items */}
                  <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-3">
                    <h4 className="text-[10px] uppercase font-mono tracking-wider text-[#ececec]/50 mb-2 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-emerald-400" /> Ordered Items ({ord.items?.length || 0})
                    </h4>
                    <ul className="space-y-2">
                      {ord.items?.map((item: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-start text-xs text-[#ececec]">
                          <div>
                            <span className="font-medium">{item.name || item.product?.name || "Product"}</span>
                            <div className="text-[10px] text-[#ececec]/50 font-mono">
                              Qty: {item.quantity} {item.size ? `• ${item.size}` : ""} {item.color ? `• ${item.color}` : ""}
                            </div>
                          </div>
                          <span className="font-mono text-emerald-400 shrink-0">
                            {formatRupiah(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-3 text-xs font-mono space-y-1">
                    <span className="text-[10px] uppercase text-[#ececec]/50 block">Shipping Destination:</span>
                    <p className="text-[#ececec]/80 leading-relaxed">{ord.address || "N/A"}</p>
                  </div>

                  {/* Midtrans Info */}
                  <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-3 text-xs font-mono space-y-1">
                    <span className="text-[10px] uppercase text-[#ececec]/50 block">Midtrans Token:</span>
                    <p className="text-[#ececec]/60 text-[10px] break-all">{ord.snapToken || "N/A"}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP FULL TABLE VIEW (Visible on tablet & desktop >= md)             */}
      {/* ========================================================================= */}
      <div className="hidden md:block w-full overflow-x-auto border border-[#1f1f1f] rounded-2xl bg-[#080808] shadow-2xl">
        <table className="w-full min-w-[1300px] text-left text-sm text-[#ececec]/80 border-collapse">
          <thead className="bg-[#0e0e0e] uppercase text-[11px] tracking-wider text-[#ececec]/50 border-b border-[#1f1f1f] font-mono">
            <tr>
              <th className="p-4 min-w-[170px]">Order Reference</th>
              <th className="p-4 min-w-[180px]">Customer Details</th>
              <th className="p-4 min-w-[140px]">Grand Total</th>
              <th className="p-4 min-w-[140px]">Payment (Midtrans)</th>
              <th className="p-4 min-w-[140px]">Order Status</th>
              <th className="p-4 min-w-[160px]">Courier (Biteship)</th>
              <th className="p-4 min-w-[190px]">Tracking Number</th>
              {/* Sticky Actions Header */}
              <th className="p-4 min-w-[210px] text-right sticky right-0 bg-[#0e0e0e] z-20 border-l border-[#1f1f1f] shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.6)] whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-[#ececec]/50 font-mono text-xs uppercase tracking-widest">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <React.Fragment key={ord.id}>
                  {/* MAIN ROW */}
                  <tr className="hover:bg-[#111111]/80 transition-colors group">
                    {/* Order ID */}
                    <td className="p-4 font-mono text-xs text-[#ececec]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold tracking-wider">{ord.orderNumber || ord.id.substring(0, 8)}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ord.orderNumber || ord.id, ord.id)}
                          className="p-1 hover:bg-[#222222] text-[#ececec]/50 hover:text-white rounded transition-colors cursor-pointer"
                          title="Copy Order Reference"
                        >
                          {copiedId === ord.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-[#ececec]/40 mt-1">
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
                        <div className="text-[10px] text-[#ececec]/40 mt-0.5">
                          (Shipping: {formatRupiah(ord.shippingCost)})
                        </div>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <div>{getPaymentBadge(ord.paymentStatus || "PENDING")}</div>
                        <select
                          value={ord.paymentStatus || "PENDING"}
                          onChange={(e) => handleInputChange(ord.id, "paymentStatus", e.target.value)}
                          className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-2 py-1 text-[10px] text-[#ececec]/80 focus:outline-none focus:border-emerald-400 font-mono cursor-pointer"
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
                        className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-2.5 py-1.5 text-xs text-[#ececec] focus:outline-none focus:border-emerald-400 font-mono cursor-pointer"
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
                      {ord.status === "SHIPPED" || ord.status === "COMPLETED" ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="Input No. Resi..."
                            value={ord.trackingNumber || ""}
                            onChange={(e) => handleInputChange(ord.id, "trackingNumber", e.target.value)}
                            className="bg-[#0a0a0a] border border-emerald-500/50 rounded-lg px-3 py-1.5 text-xs text-[#ececec] w-40 font-mono focus:outline-none focus:border-emerald-400 uppercase placeholder:normal-case placeholder:text-zinc-600"
                          />
                          {!ord.trackingNumber && ord.status === "SHIPPED" && (
                            <span className="text-[9px] font-mono text-amber-400 block">
                              * Resi diperlukan
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          className="bg-[#0a0a0a]/50 border border-[#1a1a1a] rounded-lg px-3 py-1.5 text-xs text-zinc-600 w-40 font-mono flex items-center justify-between cursor-not-allowed select-none"
                          title="Nomor resi hanya dapat diisi saat status pesanan SHIPPED atau COMPLETED"
                        >
                          <span className="text-[10px] text-zinc-500 truncate">
                            {ord.trackingNumber ? ord.trackingNumber : "Only SHIPPED Status"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Sticky Action Buttons Column */}
                    <td className="p-4 text-right sticky right-0 bg-[#080808] group-hover:bg-[#111111] z-10 border-l border-[#1f1f1f] shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.6)] whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Details Button */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(ord.id)}
                          className={cn(
                            "flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer",
                            expandedId === ord.id
                              ? "bg-[#222222] border-[#444444] text-white shadow-sm"
                              : "bg-[#111111] border-[#222222] text-[#ececec]/70 hover:bg-[#1c1c1c] hover:text-white"
                          )}
                          title="View order item details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{expandedId === ord.id ? "Close" : "Details"}</span>
                        </button>

                        {/* Save Button */}
                        <button
                          type="button"
                          onClick={() => handleUpdate(ord.id, ord)}
                          disabled={savingId === ord.id}
                          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] uppercase font-mono tracking-wider px-3.5 py-1.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-950/40"
                          title="Save status & tracking number"
                        >
                          {savingId === ord.id ? (
                            <>
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </>
                          )}
                        </button>

                        {/* Delete Button (Only active for Canceled orders) */}
                        {ord.status === "CANCELED" && (
                          <button
                            type="button"
                            onClick={() => handleDelete(ord.id)}
                            disabled={deletingId === ord.id}
                            className="flex items-center gap-1.5 border border-red-500/40 text-red-400 bg-red-950/30 hover:bg-red-900/40 hover:border-red-500 font-bold text-[10px] uppercase font-mono tracking-wider px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                            title="Delete canceled order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{deletingId === ord.id ? "..." : "Delete"}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED DETAILS */}
                  {expandedId === ord.id && (
                    <tr className="bg-[#0a0a0a]/90">
                      <td colSpan={8} className="p-6 border-b border-[#1f1f1f]">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Col 1: Purchased Items */}
                          <div className="bg-[#080808] border border-[#1f1f1f] rounded-xl p-4">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#ececec]/50 mb-3 border-b border-[#1f1f1f] pb-2 flex items-center gap-1.5 font-mono">
                              <Package className="w-3.5 h-3.5 text-emerald-400" /> Ordered Items ({ord.items?.length || 0})
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
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#ececec]/50 mb-3 border-b border-[#1f1f1f] pb-2 flex items-center gap-1.5 font-mono">
                              <Truck className="w-3.5 h-3.5 text-emerald-400" /> Shipping Details (Biteship)
                            </h4>
                            <div className="text-xs text-[#ececec]/80 space-y-2 font-mono leading-relaxed">
                              <p>
                                <span className="text-[#ececec]/40 block text-[10px] uppercase">Destination Address:</span>{" "}
                                {ord.address || "N/A"}
                              </p>
                              <p>
                                <span className="text-[#ececec]/40 block text-[10px] uppercase">Courier & Service:</span>{" "}
                                {ord.shippingCourier || ord.courier || "-"} ({ord.shippingService || "Standard"})
                              </p>
                              <p>
                                <span className="text-[#ececec]/40 block text-[10px] uppercase">Shipping Cost:</span>{" "}
                                {formatRupiah(ord.shippingCost)}
                              </p>
                              <p>
                                <span className="text-[#ececec]/40 block text-[10px] uppercase">Tracking Number:</span>{" "}
                                {ord.trackingNumber ? (
                                  <span className="text-emerald-400 font-bold">{ord.trackingNumber}</span>
                                ) : (
                                  "Pending Dispatch"
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Col 3: Midtrans Payment Info */}
                          <div className="bg-[#080808] border border-[#1f1f1f] rounded-xl p-4">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#ececec]/50 mb-3 border-b border-[#1f1f1f] pb-2 flex items-center gap-1.5 font-mono">
                              <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Midtrans Transaction
                            </h4>
                            <div className="text-xs text-[#ececec]/80 space-y-2 font-mono leading-relaxed">
                              <p>
                                <span className="text-[#ececec]/40 block text-[10px] uppercase">Payment Status:</span>{" "}
                                {ord.paymentStatus || "PENDING"}
                              </p>
                              <p>
                                <span className="text-[#ececec]/40 block text-[10px] uppercase">Snap Token:</span>{" "}
                                <span className="text-[10px] break-all text-[#ececec]/60">{ord.snapToken || "N/A"}</span>
                              </p>
                              <p>
                                <span className="text-[#ececec]/40 block text-[10px] uppercase">Grand Total Charged:</span>{" "}
                                <span className="text-emerald-400 font-bold">{formatRupiah(ord.totalAmount)}</span>
                              </p>
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
          className={cn(
            "fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-xl shadow-2xl border text-[10px] uppercase tracking-widest transition-all duration-300 transform flex items-center gap-3 font-mono",
            toast.type === "success"
              ? "bg-[#0a0a0a] border-emerald-500/40 text-emerald-400 translate-y-0 opacity-100 shadow-emerald-950/40"
              : "bg-[#0a0a0a] border-red-500/40 text-red-400 translate-y-0 opacity-100 shadow-red-950/40"
          )}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              toast.type === "success" ? "bg-emerald-400" : "bg-red-400"
            )}
          />
          {toast.message}
        </div>
      )}
    </div>
  );
}