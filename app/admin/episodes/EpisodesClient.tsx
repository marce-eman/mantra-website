"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { saveEpisodeAction, deleteEpisodeAction } from "@/app/actions/episode";

export default function EpisodesClient({ initialEpisodes }: { initialEpisodes: any[] }) {
  const [episodes, setEpisodes] = useState(initialEpisodes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    episodeNo: "",
    title: "",
    isActive: true,
  });

  const handleOpenModal = (episode?: any) => {
    if (episode) {
      setFormData({
        id: episode.id,
        episodeNo: episode.episodeNo || "",
        title: episode.title || "",
        isActive: episode.isActive ?? true,
      });
    } else {
      setFormData({
        id: "",
        episodeNo: "",
        title: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await saveEpisodeAction(formData);

    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this episode?");
    if (!confirm) return;

    const result = await deleteEpisodeAction(id);
    if (result.success) {
      setEpisodes(episodes.filter((ep) => ep.id !== id));
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live CMS Info Banner */}
      <div className="bg-[#111111]/70 border border-pink-500/30 rounded-2xl p-4 md:p-5 flex items-start gap-3.5 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
        <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-pink-300 mb-1">
            Visual Live CMS Enabled
          </h4>
          <p className="text-xs text-[#ececec]/60 leading-relaxed font-mono">
            Story paragraphs, YouTube video embeds, and episode banner images can now be edited
            directly on the public Home page using the Live In-Place Editor.
          </p>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-4">
        <div>
          <h2 className="text-xl font-light uppercase tracking-widest text-[#ececec]">
            Manage Episodes
          </h2>
          <p className="text-xs text-[#ececec]/40 uppercase tracking-widest font-mono mt-0.5">
            Core episode list & status
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-[#ececec] text-[#050505] px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center gap-2 cursor-pointer font-mono"
        >
          <Plus className="w-4 h-4" /> Add New Episode
        </button>
      </div>

      {/* Episode Table */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden font-mono">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#ececec]">
            <thead className="bg-[#111111] border-b border-[#1f1f1f] text-[10px] uppercase tracking-widest text-[#ececec]/60">
              <tr>
                <th className="px-6 py-4">No.</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {episodes.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-xs text-[#ececec]/40 uppercase tracking-widest"
                  >
                    No episode records found.
                  </td>
                </tr>
              ) : (
                episodes.map((ep) => (
                  <tr
                    key={ep.id}
                    className="border-b border-[#1f1f1f] hover:bg-[#111111]/50 transition-colors text-xs"
                  >
                    <td className="px-6 py-4 font-mono text-pink-400 font-bold">
                      EP {ep.episodeNo}
                    </td>
                    <td className="px-6 py-4 uppercase tracking-widest font-bold">
                      {ep.title}
                    </td>
                    <td className="px-6 py-4">
                      {ep.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 text-[10px] uppercase tracking-widest border border-emerald-900/50">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/40 text-red-400 text-[10px] uppercase tracking-widest border border-red-900/50">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleOpenModal(ep)}
                        className="text-[#ececec]/50 hover:text-white transition-colors cursor-pointer"
                        title="Edit Episode"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(ep.id)}
                        className="text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Episode"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simplified Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-base font-bold uppercase tracking-widest mb-6 text-white">
              {formData.id ? "Edit Episode Meta" : "New Episode"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1.5">
                  Episode Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="01"
                  value={formData.episodeNo}
                  onChange={(e) => setFormData({ ...formData, episodeNo: e.target.value })}
                  className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-[#ececec] rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1.5">
                  Episode Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="OPUS ARCANUM"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-[#ececec] rounded-xl focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 bg-[#111111] border-[#1f1f1f] rounded cursor-pointer"
                />
                <label htmlFor="isActive" className="text-[#ececec]/80 uppercase tracking-widest cursor-pointer text-xs">
                  Active (Display on Home Page)
                </label>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 border border-[#1f1f1f] py-3 uppercase tracking-widest font-bold rounded-xl hover:bg-[#111111] transition-colors cursor-pointer text-[#ececec]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-[#ececec] text-[#050505] py-3 uppercase tracking-widest font-bold rounded-xl hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Episode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}