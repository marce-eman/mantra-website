"use client";

import ImageUpload from "@/components/ImageUpload";
import { useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { saveEpisodeAction, deleteEpisodeAction } from "@/app/actions/episode";

export default function EpisodesClient({ initialEpisodes }: { initialEpisodes: any[] }) {
  const [episodes, setEpisodes] = useState(initialEpisodes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State form ditambahkan videoUrl
  const [formData, setFormData] = useState({
    id: "",
    episodeNo: "",
    title: "",
    descriptionLeft: "",
    descriptionRight: "",
    heroImage: "",
    videoUrl: "", // <--- STATE BARU UNTUK LINK VIDEO
    isActive: true,
  });

  const handleOpenModal = (episode?: any) => {
    if (episode) {
      setFormData({
        ...episode,
        videoUrl: episode.videoUrl || "", // Pastikan terisi jika ada data
      });
    } else {
      setFormData({
        id: "",
        episodeNo: "",
        title: "",
        descriptionLeft: "",
        descriptionRight: "",
        heroImage: "",
        videoUrl: "", // Reset untuk form baru
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
    const confirm = window.confirm("Yakin ingin menghapus episode ini?");
    if (!confirm) return;

    const result = await deleteEpisodeAction(id);
    if (result.success) {
      setEpisodes(episodes.filter((ep) => ep.id !== id));
    } else {
      alert(result.error);
    }
  };

  return (
    <div>
      {/* Header Aksi */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#ececec] text-[#050505] px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Episode
        </button>
      </div>

      {/* Tabel Daftar Episode */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
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
                  <td colSpan={4} className="px-6 py-8 text-center text-xs text-[#ececec]/40 uppercase tracking-widest">
                    Belum ada data episode.
                  </td>
                </tr>
              ) : (
                episodes.map((ep) => (
                  <tr key={ep.id} className="border-b border-[#1f1f1f] hover:bg-[#111111]/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-emerald-400">EP {ep.episodeNo}</td>
                    <td className="px-6 py-4 uppercase tracking-widest font-bold">{ep.title}</td>
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
                      <button onClick={() => handleOpenModal(ep)} className="text-[#ececec]/50 hover:text-white transition-colors cursor-pointer">
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(ep.id)} className="text-red-400/70 hover:text-red-400 transition-colors cursor-pointer">
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

      {/* Modal Form Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-bold uppercase tracking-widest mb-6 font-serif">
              {formData.id ? "Edit Episode" : "New Episode"}
            </h3>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1.5">Nomor Episode</label>
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
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1.5">Judul (Title)</label>
                  <input
                    type="text"
                    required
                    placeholder="OPUS ARCANUM"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-[#ececec] rounded-xl focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* INPUT GAMBAR & VIDEO BERSEBELAHAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1.5">Background Image (Home)</label>
                  <ImageUpload
                    value={formData.heroImage}
                    onChange={(url) => setFormData({ ...formData, heroImage: url })}
                  />
                </div>
                <div>
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1.5">Link Video (Youtube/Vimeo)</label>
                  <input
                    type="url"
                    value={formData.videoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-[#ececec] rounded-xl focus:outline-none focus:border-white transition-colors"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1.5">Story (Left Paragraph)</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.descriptionLeft}
                    onChange={(e) => setFormData({ ...formData, descriptionLeft: e.target.value })}
                    className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-[#ececec] rounded-xl focus:outline-none focus:border-white transition-colors resize-none leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-[#ececec]/60 uppercase tracking-widest mb-1.5">Story (Right Paragraph)</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.descriptionRight}
                    onChange={(e) => setFormData({ ...formData, descriptionRight: e.target.value })}
                    className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-[#ececec] rounded-xl focus:outline-none focus:border-white transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 bg-[#111111] border-[#1f1f1f] rounded cursor-pointer"
                />
                <label htmlFor="isActive" className="text-[#ececec]/80 uppercase tracking-widest cursor-pointer">
                  Tampilkan Episode ini di Halaman Utama (Active)
                </label>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 border border-[#1f1f1f] py-3.5 uppercase tracking-widest font-bold rounded-xl hover:bg-[#111111] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-[#ececec] text-[#050505] py-3.5 uppercase tracking-widest font-bold rounded-xl hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
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