"use client";

import ImageUpload from "@/components/ImageUpload";
import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { saveArticleAction, deleteArticleAction } from "@/app/actions/article";

export default function ArticlesClient({ 
  initialEpisodes, 
  initialUnassigned, 
  availableEpisodes 
}: { 
  initialEpisodes: any[], 
  initialUnassigned: any[], 
  availableEpisodes: any[] 
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
    articleTitle: "",
    articleSubtitle: "",
    heroImage: "",
    storyIntro: "",
    storyLeft: "",
    storyRight: "",
    galleryImages: "",
    editorialCaption: "+ Headline",
    editorialBody: "",
    editorialBodyRight: "",
    editorialImage: "",
    editorialImageRight: "",
    videoThumb: "",
  });

  const handleOpenModal = (article?: any) => {
    if (article) {
      setFormData({
        ...article,
        sizes: article.sizes ? article.sizes.join(", ") : "",
        images: article.images ? article.images.join(", ") : "",
        galleryImages: article.galleryImages ? article.galleryImages.join(", ") : "",
        episodeId: article.episodeId || "",
        storyIntro: article.storyIntro || "", 
      });
    } else {
      setFormData({
        id: "", name: "", slug: "", description: "", price: 0, stock: 0, sizes: "M, L, XL", images: "", episodeId: "",
        isArticle: true, articleNo: "", articleTitle: "", articleSubtitle: "", heroImage: "", storyIntro: "", storyLeft: "", storyRight: "", galleryImages: "", editorialCaption: "+ Headline", editorialBody: "", editorialBodyRight: "", editorialImage: "", editorialImageRight: "", videoThumb: "",
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
    if (!window.confirm("Yakin ingin menghapus artikel ini?")) return;
    const result = await deleteArticleAction(id);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Gagal menghapus artikel");
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Tombol Add */}
      <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-6">
        <div>
          <h1 className="text-2xl font-light uppercase tracking-widest text-[#ececec]">Manage Articles & Products</h1>
          <p className="text-xs text-[#ececec]/50 uppercase tracking-widest font-mono mt-1">Organized by episodes.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#ececec] text-[#050505] px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> Add New Article
        </button>
      </div>

      {/* ─────────────────────────────────────────
          DAFTAR ARTIKEL DIKELOMPOKKAN PER EPISODE
      ───────────────────────────────────────── */}
      <div className="space-y-16">
        
        {/* 1. Berdasarkan Episode yang Ada */}
        {initialEpisodes.map((ep) => (
          <div key={ep.id} className="space-y-6">
            {/* Judul Pembatas Episode */}
            <div className="flex items-center gap-4 border-b border-[#1f1f1f] pb-3">
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest">
                EPISODE {ep.episodeNo || "0X"}
              </span>
              <h2 className="text-lg font-light uppercase tracking-widest text-[#ececec]">
                {ep.title}
              </h2>
              <span className="text-xs text-[#ececec]/40 font-mono ml-auto">
                ({ep.articles.length} Articles)
              </span>
            </div>

            {/* Grid Produk dalam Episode Ini */}
            {ep.articles.length === 0 ? (
              <p className="text-xs text-[#ececec]/30 uppercase tracking-widest font-mono py-2">
                Belum ada artikel di episode ini.
              </p>
            ) : (
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#ececec]">
                    <thead className="bg-[#111111] border-b border-[#1f1f1f] text-[10px] uppercase tracking-widest text-[#ececec]/60">
                      <tr>
                        <th className="px-6 py-4">Item (Katalog)</th>
                        <th className="px-6 py-4">Harga / Stok</th>
                        <th className="px-6 py-4">Story Linked?</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.articles.map((art: any) => (
                        <tr key={art.id} className="border-b border-[#1f1f1f] hover:bg-[#111111]/50">
                          <td className="px-6 py-4">
                            <div className="font-bold uppercase tracking-widest">{art.name}</div>
                            <div className="text-[10px] text-[#ececec]/50 font-mono mt-1">/{art.slug}</div>
                          </td>
                          <td className="px-6 py-4 font-mono">
                            Rp {art.price.toLocaleString("id-ID")} <br/>
                            <span className="text-[#ececec]/50 text-[10px]">Stok: {art.stock}</span>
                          </td>
                          <td className="px-6 py-4 text-emerald-400 font-mono text-[10px]">
                            {art.isArticle ? `YES (Art.${art.articleNo})` : "NO"}
                          </td>
                          <td className="px-6 py-4 text-right space-x-3">
                            <button onClick={() => handleOpenModal(art)} className="text-[#ececec]/50 hover:text-white cursor-pointer">
                              <Edit2 className="w-4 h-4 inline" />
                            </button>
                            <button onClick={() => handleDelete(art.id)} className="text-red-400/70 hover:text-red-400 cursor-pointer">
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

        {/* 2. Produk Unassigned (Belum Masuk Episode Manapun) */}
        {initialUnassigned && initialUnassigned.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-dashed border-[#2a2a2a]">
            <div className="flex items-center gap-4 border-b border-[#1f1f1f] pb-3">
              <span className="text-amber-400 font-mono text-xs uppercase tracking-widest">
                UNASSIGNED PRODUCTS (BELUM ADA EPISODE)
              </span>
              <span className="text-xs text-[#ececec]/40 font-mono ml-auto">
                ({initialUnassigned.length} Articles)
              </span>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#ececec]">
                  <thead className="bg-[#111111] border-b border-[#1f1f1f] text-[10px] uppercase tracking-widest text-[#ececec]/60">
                    <tr>
                      <th className="px-6 py-4">Item (Katalog)</th>
                      <th className="px-6 py-4">Harga / Stok</th>
                      <th className="px-6 py-4">Story Linked?</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialUnassigned.map((art: any) => (
                      <tr key={art.id} className="border-b border-[#1f1f1f] hover:bg-[#111111]/50">
                        <td className="px-6 py-4">
                          <div className="font-bold uppercase tracking-widest">{art.name}</div>
                          <div className="text-[10px] text-[#ececec]/50 font-mono mt-1">/{art.slug}</div>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          Rp {art.price.toLocaleString("id-ID")} <br/>
                          <span className="text-[#ececec]/50 text-[10px]">Stok: {art.stock}</span>
                        </td>
                        <td className="px-6 py-4 text-amber-400 font-mono text-[10px]">
                          {art.isArticle ? `YES (Art.${art.articleNo})` : "NO"}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button onClick={() => handleOpenModal(art)} className="text-[#ececec]/50 hover:text-white cursor-pointer">
                            <Edit2 className="w-4 h-4 inline" />
                          </button>
                          <button onClick={() => handleDelete(art.id)} className="text-red-400/70 hover:text-red-400 cursor-pointer">
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

      {/* ─────────────────────────────────────────
          MODAL RAKSASA (FORM TAMBAH / EDIT)
      ───────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 py-10">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 w-full max-w-4xl h-full overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-bold uppercase tracking-widest mb-6 font-serif border-b border-[#1f1f1f] pb-4 text-[#ececec]">
              {formData.id ? "Edit Article" : "New Article"}
            </h3>

            <form onSubmit={handleSave} className="space-y-8 text-xs">
              
              {/* BAGIAN 1: DATA KATALOG (SHOP) */}
              <div className="space-y-4">
                <h4 className="text-emerald-400 uppercase tracking-widest font-bold">1. Data Katalog (Halaman Shop)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#ececec]/60 mb-1.5 uppercase">Nama Item</label>
                    <input type="text" required value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white" placeholder="Fluere Nabulam" />
                  </div>
                  <div>
                    <label className="block text-[#ececec]/60 mb-1.5 uppercase">Slug URL (tanpa spasi)</label>
                    <input type="text" required value={formData.slug || ""} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white" placeholder="fluere-nabulam" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#ececec]/60 mb-1.5 uppercase">Harga (Rp)</label>
                    <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white" />
                  </div>
                  <div>
                    <label className="block text-[#ececec]/60 mb-1.5 uppercase">Stok</label>
                    <input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase">Sizes (Pisahkan dengan koma)</label>
                  <input type="text" required value={formData.sizes || ""} onChange={(e) => setFormData({...formData, sizes: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white" placeholder="S, M, L, XL" />
                </div>

                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase">Deskripsi Katalog (Checkout)</label>
                  <textarea rows={3} required value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white resize-none" />
                </div>

                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase">Foto Katalog</label>
                  <ImageUpload 
                    multiple 
                    value={formData.images || ""} 
                    onChange={(url) => setFormData({...formData, images: url})} 
                  />
                </div>

                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase">Hubungkan ke Episode (Koleksi)</label>
                  <select value={formData.episodeId || ""} onChange={(e) => setFormData({...formData, episodeId: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white">                    
                    <option value="">-- Pilih Episode --</option>
                    {availableEpisodes && availableEpisodes.map(ep => (
                      <option key={ep.id} value={ep.id}>{ep.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* BAGIAN 2: DATA STORY (EPISODE DETAILS) */}
              <div className="space-y-4 border-t border-[#1f1f1f] pt-8">
                <h4 className="text-emerald-400 uppercase tracking-widest font-bold">2. Data Story (Article Page)</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#ececec]/60 mb-1.5 uppercase">No Artikel</label>
                    <input type="text" value={formData.articleNo || ""} onChange={(e) => setFormData({...formData, articleNo: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white" placeholder="001" />
                  </div>
                  <div>
                    <label className="block text-[#ececec]/60 mb-1.5 uppercase">Judul Story</label>
                    <input type="text" value={formData.articleTitle || ""} onChange={(e) => setFormData({...formData, articleTitle: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white" placeholder="The Architecture of Shadows" />
                  </div>
                  <div>
                    <label className="block text-[#ececec]/60 mb-1.5 uppercase">Sub Judul</label>
                    <input type="text" value={formData.articleSubtitle || ""} onChange={(e) => setFormData({...formData, articleSubtitle: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white" placeholder="Opus Arcanum - Article No.001" />
                  </div>
                </div>

                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase">Hero Image (Background Atas)</label>
                  <ImageUpload 
                    value={formData.heroImage || ""} 
                    onChange={(url) => setFormData({...formData, heroImage: url})} 
                  />
                </div>

{/* FORM TEKS INTRO */}
                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase">Teks Intro (Bawah Sub-judul)</label>
                  <textarea rows={3} value={formData.storyIntro || ""} onChange={(e) => setFormData({...formData, storyIntro: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white resize-none" placeholder="Teks singkat pengantar artikel..." />
                </div>

                {/* FORM PARAGRAF KIRI & KANAN (Pastikan cuma ada 1 Grid ini!) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#ececec]/60 mb-1.5 uppercase">Paragraf Kiri</label>
                    <textarea rows={4} value={formData.storyLeft || ""} onChange={(e) => setFormData({...formData, storyLeft: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white resize-none" />
                  </div>
                  <div>
                    <label className="block text-[#ececec]/60 mb-1.5 uppercase">Paragraf Kanan</label>
                    <textarea rows={4} value={formData.storyRight || ""} onChange={(e) => setFormData({...formData, storyRight: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white resize-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase">Gallery Carousel</label>
                  <ImageUpload 
                    multiple 
                    value={formData.galleryImages || ""} 
                    onChange={(url) => setFormData({...formData, galleryImages: url})} 
                  />
                </div>

                {/* Zigzag Section */}
                <div className="p-4 bg-[#111] rounded-xl border border-[#1f1f1f] space-y-4 mt-6">
                  <h5 className="text-[#ececec] uppercase font-bold tracking-widest">Detail Editorial (Zig-Zag)</h5>
                  <div>
                    <label className="block text-[#ececec]/60 mb-1.5 uppercase">Teks Headline Kecil</label>
                    <input type="text" value={formData.editorialCaption || ""} onChange={(e) => setFormData({...formData, editorialCaption: e.target.value})} className="w-full bg-black border border-[#1f1f1f] p-3 rounded-xl text-white" placeholder="+ Headline" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#ececec]/60 mb-1.5 uppercase">Gambar Kiri</label>
                      <ImageUpload 
                        value={formData.editorialImage || ""} 
                        onChange={(url) => setFormData({...formData, editorialImage: url})} 
                      />
                      <label className="block text-[#ececec]/60 mb-1.5 uppercase mt-3">Teks Kanan</label>
                      <textarea rows={3} value={formData.editorialBody || ""} onChange={(e) => setFormData({...formData, editorialBody: e.target.value})} className="w-full bg-black border border-[#1f1f1f] p-3 rounded-xl text-white resize-none" />
                    </div>
                    <div>
                      <label className="block text-[#ececec]/60 mb-1.5 uppercase">Teks Kiri Bawah</label>
                      <textarea rows={3} value={formData.editorialBodyRight || ""} onChange={(e) => setFormData({...formData, editorialBodyRight: e.target.value})} className="w-full bg-black border border-[#1f1f1f] p-3 rounded-xl text-white resize-none mb-3" />
                      <label className="block text-[#ececec]/60 mb-1.5 uppercase">Gambar Kanan</label>
                      <ImageUpload 
                        value={formData.editorialImageRight || ""} 
                        onChange={(url) => setFormData({...formData, editorialImageRight: url})} 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[#ececec]/60 mb-1.5 uppercase">Video Thumbnail Placeholder</label>
                  <ImageUpload 
                    value={formData.videoThumb || ""} 
                    onChange={(url) => setFormData({...formData, videoThumb: url})} 
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-8 flex gap-4 sticky bottom-0 bg-[#0a0a0a] pb-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 border border-[#1f1f1f] py-3.5 uppercase tracking-widest font-bold rounded-xl hover:bg-[#111111] cursor-pointer text-[#ececec]">Cancel</button>
                <button type="submit" disabled={loading} className="w-1/2 bg-[#ececec] text-[#050505] py-3.5 uppercase tracking-widest font-bold rounded-xl hover:bg-white disabled:opacity-50 cursor-pointer">
                  {loading ? "Saving..." : "Save Article & Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}