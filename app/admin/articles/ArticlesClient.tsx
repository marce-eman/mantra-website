"use client";

import ImageUpload from "@/components/ImageUpload";
import { useState } from "react";
import { Plus, Edit2, Trash2, Sparkles, Layers } from "lucide-react";
import { saveArticleAction, deleteArticleAction } from "@/app/actions/article";
import { formatRupiah } from "@/lib/utils";

export default function ArticlesClient({
  initialEpisodes,
  initialUnassigned,
  availableEpisodes,
}: {
  initialEpisodes: any[];
  initialUnassigned: any[];
  availableEpisodes: any[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    price: 0,
    stock: 0,
    sizes: "M, L, XL",
    images: "",
    episodeId: "",
    isArticle: true,
    articleNo: "",
  });

  const handleOpenModal = (article?: any) => {
    if (article) {
      setFormData({
        id: article.id,
        name: article.name || "",
        slug: article.slug || "",
        description: article.description || "",
        price: article.price || 0,
        stock: article.stock || 0,
        sizes: article.sizes ? (Array.isArray(article.sizes) ? article.sizes.join(", ") : article.sizes) : "M, L, XL",
        images: article.images ? (Array.isArray(article.images) ? article.images.join(", ") : article.images) : "",
        episodeId: article.episodeId || "",
        isArticle: article.isArticle ?? true,
        articleNo: article.articleNo || "",
      });
    } else {
      setFormData({
        id: "",
        name: "",
        slug: "",
        description: "",
        price: 0,
        stock: 0,
        sizes: "M, L, XL",
        images: "",
        episodeId: "",
        isArticle: true,
        articleNo: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await saveArticleAction(formData);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    const result = await deleteArticleAction(id);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Failed to delete article");
    }
  };

  return (
    <div className="space-y-10 font-mono">
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
            Story text, subtitles, intro paragraphs, gallery carousels, editorial photos, and YouTube video embeds can be edited directly on the live Story &amp; Article pages via In-Place Live CMS.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-4">
        <div>
          <h1 className="text-xl font-light uppercase tracking-widest text-[#ececec]">
            Manage Articles &amp; Products
          </h1>
          <p className="text-xs text-[#ececec]/50 uppercase tracking-widest font-mono mt-0.5">
            Organized by episodes
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#ececec] text-[#050505] px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center gap-2 cursor-pointer font-mono"
        >
          <Plus className="w-4 h-4" /> Add New Article
        </button>
      </div>

      {/* List by Episodes */}
      <div className="space-y-12">
        {initialEpisodes.map((ep) => (
          <div key={ep.id} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#1f1f1f] pb-2">
              <span className="text-pink-400 font-mono text-xs uppercase tracking-widest font-bold">
                EPISODE {ep.episodeNo || "0X"}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
                {ep.title}
              </h2>
              <span className="text-xs text-[#ececec]/40 font-mono ml-auto">
                ({ep.articles.length} Items)
              </span>
            </div>

            {ep.articles.length === 0 ? (
              <p className="text-xs text-[#ececec]/30 uppercase tracking-widest font-mono py-2">
                No articles attached to this episode.
              </p>
            ) : (
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#ececec]">
                    <thead className="bg-[#111111] border-b border-[#1f1f1f] text-[10px] uppercase tracking-widest text-[#ececec]/60">
                      <tr>
                        <th className="px-6 py-4">Item (Catalogue)</th>
                        <th className="px-6 py-4">Price / Stock</th>
                        <th className="px-6 py-4">Article No.</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.articles.map((art: any) => (
                        <tr
                          key={art.id}
                          className="border-b border-[#1f1f1f] hover:bg-[#111111]/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-bold uppercase tracking-widest text-white">
                              {art.name}
                            </div>
                            <div className="text-[10px] text-[#ececec]/50 font-mono mt-0.5">
                              /{art.slug}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono">
                            <span className="text-emerald-400 font-bold">{formatRupiah(art.price)}</span>
                            <br />
                            <span className="text-[#ececec]/50 text-[10px]">Stock: {art.stock}</span>
                          </td>
                          <td className="px-6 py-4 text-pink-400 font-mono text-xs">
                            {art.articleNo ? `Art.${art.articleNo}` : "-"}
                          </td>
                          <td className="px-6 py-4 text-right space-x-3">
                            <button
                              onClick={() => handleOpenModal(art)}
                              className="text-[#ececec]/50 hover:text-white cursor-pointer"
                              title="Edit Article"
                            >
                              <Edit2 className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={() => handleDelete(art.id)}
                              className="text-red-400/70 hover:text-red-400 cursor-pointer"
                              title="Delete Article"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Unassigned Articles */}
        {initialUnassigned && initialUnassigned.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#1f1f1f]">
            <div className="flex items-center gap-3 border-b border-[#1f1f1f] pb-2">
              <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-bold">
                UNASSIGNED ARTICLES
              </span>
              <span className="text-xs text-[#ececec]/40 font-mono ml-auto">
                ({initialUnassigned.length} Items)
              </span>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#ececec]">
                  <thead className="bg-[#111111] border-b border-[#1f1f1f] text-[10px] uppercase tracking-widest text-[#ececec]/60">
                    <tr>
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4">Price / Stock</th>
                      <th className="px-6 py-4">Article No.</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialUnassigned.map((art: any) => (
                      <tr
                        key={art.id}
                        className="border-b border-[#1f1f1f] hover:bg-[#111111]/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold uppercase tracking-widest text-white">
                            {art.name}
                          </div>
                          <div className="text-[10px] text-[#ececec]/50 font-mono mt-0.5">
                            /{art.slug}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <span className="text-emerald-400 font-bold">{formatRupiah(art.price)}</span>
                          <br />
                          <span className="text-[#ececec]/50 text-[10px]">Stock: {art.stock}</span>
                        </td>
                        <td className="px-6 py-4 text-pink-400 font-mono text-xs">
                          {art.articleNo ? `Art.${art.articleNo}` : "-"}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button
                            onClick={() => handleOpenModal(art)}
                            className="text-[#ececec]/50 hover:text-white cursor-pointer"
                            title="Edit Article"
                          >
                            <Edit2 className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(art.id)}
                            className="text-red-400/70 hover:text-red-400 cursor-pointer"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simplified Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col shadow-2xl">
            <div className="p-6 border-b border-[#1f1f1f] flex justify-between items-center bg-[#111]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                {formData.id ? "Edit Article / Product" : "New Article / Product"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#888] hover:text-white cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase tracking-wider">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white focus:outline-none focus:border-white"
                    placeholder="Fluere Nabulam"
                  />
                </div>
                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase tracking-wider">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white focus:outline-none focus:border-white"
                    placeholder="fluere-nabulam"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase tracking-wider">
                    Price (IDR Rp)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase tracking-wider">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase tracking-wider">
                    Article No.
                  </label>
                  <input
                    type="text"
                    value={formData.articleNo || ""}
                    onChange={(e) => setFormData({ ...formData, articleNo: e.target.value })}
                    className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white focus:outline-none focus:border-white"
                    placeholder="001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#ececec]/60 mb-1.5 uppercase tracking-wider">
                  Available Sizes
                </label>
                <input
                  type="text"
                  required
                  value={formData.sizes || ""}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white focus:outline-none focus:border-white"
                  placeholder="S, M, L, XL"
                />
              </div>

              <div>
                <label className="block text-[#ececec]/60 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white resize-none focus:outline-none focus:border-white"
                  placeholder="Product description for catalogue..."
                />
              </div>

              <div>
                <label className="block text-[#ececec]/60 mb-1.5 uppercase tracking-wider">
                  Catalogue Photos
                </label>
                <ImageUpload
                  multiple
                  value={formData.images || ""}
                  onChange={(url) => setFormData({ ...formData, images: url })}
                />
              </div>

              <div>
                <label className="block text-[#ececec]/60 mb-1.5 uppercase tracking-wider">
                  Assign to Episode
                </label>
                <select
                  value={formData.episodeId || ""}
                  onChange={(e) => setFormData({ ...formData, episodeId: e.target.value })}
                  className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white focus:outline-none focus:border-white"
                >
                  <option value="">-- No Episode (Unassigned) --</option>
                  {availableEpisodes &&
                    availableEpisodes.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        EP {ep.episodeNo}: {ep.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-4 flex gap-4 border-t border-[#1f1f1f]">
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
                  {loading ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}