"use client";

import React, { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fungsi mengubah role (Admin/User)
  const handleRoleChange = async (id: string, newRole: string) => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });

      if (res.ok) {
        showToast("User role updated!", "success");
        fetchUsers();
      } else {
        showToast("Failed to update role.", "error");
      }
    } catch (err) {
      showToast("Error updating user.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Fungsi menghapus user
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action is irreversible.`)) {
      return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("User deleted from the void.", "success");
        fetchUsers();
      } else {
        showToast("Failed to delete user.", "error");
      }
    } catch (err) {
      showToast("Error deleting user.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-[#ececec] bg-[#050505] min-h-screen font-mono text-sm uppercase tracking-widest">Loading users...</div>;
  }

  return (
    <div className="p-8 bg-[#050505] text-[#ececec] min-h-screen relative overflow-hidden">
      <h1 className="text-2xl font-serif tracking-widest uppercase mb-6">User Management</h1>

      <div className="overflow-x-auto border border-[#1f1f1f] rounded-lg">
        <table className="w-full text-left text-sm text-[#ececec]/80">
          <thead className="bg-[#0a0a0a] uppercase text-xs tracking-wider text-[#ececec]/50 border-b border-[#1f1f1f]">
            <tr>
              <th className="p-4">Name / ID</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-[#ececec]/50 font-mono text-xs uppercase tracking-widest">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-[#111111] transition-colors">
                  <td className="p-4">
                    <div className="font-bold">{user.name || "Unknown"}</div>
                    <div className="text-[10px] font-mono text-[#ececec]/40 mt-1">{user.id}</div>
                  </td>
                  <td className="p-4 text-xs">{user.email}</td>
                  <td className="p-4">
                    <select
                    value={user.role || "CUSTOMER"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={processingId === user.id}
                    className={`bg-[#0a0a0a] border rounded px-2 py-1.5 text-xs focus:outline-none transition-colors ${
                        user.role === "ADMIN" 
                        ? "border-emerald-500/50 text-emerald-400" 
                        : "border-[#1f1f1f] text-[#ececec]"
                    }`}
                    >
                    <option value="CUSTOMER">CUSTOMER</option> {/* Pastikan value-nya "CUSTOMER" */}
                    <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-4 flex justify-end">
                    <button
                      onClick={() => handleDelete(user.id, user.name || "Unknown")}
                      disabled={processingId === user.id}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {processingId === user.id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Komponen Toast Notification */}
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