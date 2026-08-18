"use client";

import ImageUpload from "@/components/ImageUpload";
import { useState } from "react";
import { Plus, Edit2, Trash2, ArrowRight, PlayCircle, Eye, FileText } from "lucide-react";
import { saveArticleAction, deleteArticleAction } from "@/app/actions/article";
import Image from "next/image";

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
  
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");

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
    videoUrl: "", // STATE BARU UNTUK LINK VIDEO
  });

  const handleOpenModal = (article?: any) => {
    setActiveTab("form"); 
    if (article) {
      setFormData({
        ...article,
        sizes: article.sizes ? article.sizes.join(", ") : "",
        images: article.images ? article.images.join(", ") : "",
        galleryImages: article.galleryImages ? article.galleryImages.join(", ") : "",
        episodeId: article.episodeId || "",
        storyIntro: article.storyIntro || "", 
        videoUrl: article.videoUrl || "", // ISI STATE DARI DATABASE
      });
    } else {
      setFormData({
        id: "", name: "", slug: "", description: "", price: 0, stock: 0, sizes: "M, L, XL", images: "", episodeId: "",
        isArticle: true, articleNo: "", articleTitle: "", articleSubtitle: "", heroImage: "", storyIntro: "", storyLeft: "", storyRight: "", galleryImages: "", editorialCaption: "+ Headline", editorialBody: "", editorialBodyRight: "", editorialImage: "", editorialImageRight: "", videoThumb: "", videoUrl: "",
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

  const getFirstImage = (imgString: string) => {
    if (!imgString) return "/images/placeholder.jpg";
    return imgString.split(",")[0].trim();
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-6">
        <div>
          <h1 className="text-2xl font-light uppercase tracking-widest text-[#ececec]">Manage Articles & Products</h1>
          <p className="text-xs text-[#ececec]/50 uppercase tracking-widest font-mono mt-1">Organized by episodes.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#ececec] text-[#050505] px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> Add New Article
        </button>
      </div>

      <div className="space-y-16">
        {initialEpisodes.map((ep) => (
          <div key={ep.id} className="space-y-6">
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 py-10">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between p-6 border-b border-[#1f1f1f] shrink-0">
              <h3 className="text-lg font-bold uppercase tracking-widest font-serif text-[#ececec]">
                {formData.id ? "Edit Article" : "New Article"}
              </h3>
              
              <div className="flex bg-[#111] border border-[#1f1f1f] rounded-lg p-1">
                <button 
                  onClick={() => setActiveTab("form")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === "form" ? "bg-[#ececec] text-[#050505]" : "text-[#ececec]/50 hover:text-[#ececec]"}`}
                >
                  <FileText className="w-3.5 h-3.5" /> Form Data
                </button>
                <button 
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === "preview" ? "bg-emerald-400 text-[#050505]" : "text-[#ececec]/50 hover:text-[#ececec]"}`}
                >
                  <Eye className="w-3.5 h-3.5" /> Live Preview
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
              
              {activeTab === "form" ? (
                <form id="article-form" onSubmit={handleSave} className="space-y-8 text-xs">
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
                      <ImageUpload multiple value={formData.images || ""} onChange={(url) => setFormData({...formData, images: url})} />
                    </div>
                    <div>
                      <label className="block text-[#ececec]/60 mb-1.5 uppercase">Hubungkan ke Episode</label>
                      <select value={formData.episodeId || ""} onChange={(e) => setFormData({...formData, episodeId: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white">                    
                        <option value="">-- Pilih Episode --</option>
                        {availableEpisodes && availableEpisodes.map(ep => (
                          <option key={ep.id} value={ep.id}>{ep.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                      <ImageUpload value={formData.heroImage || ""} onChange={(url) => setFormData({...formData, heroImage: url})} />
                    </div>
                    <div>
                      <label className="block text-[#ececec]/60 mb-1.5 uppercase">Teks Intro (Bawah Sub-judul)</label>
                      <textarea rows={3} value={formData.storyIntro || ""} onChange={(e) => setFormData({...formData, storyIntro: e.target.value})} className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white resize-none" />
                    </div>
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
                      <ImageUpload multiple value={formData.galleryImages || ""} onChange={(url) => setFormData({...formData, galleryImages: url})} />
                    </div>
                    <div className="p-4 bg-[#111] rounded-xl border border-[#1f1f1f] space-y-4 mt-6">
                      <h5 className="text-[#ececec] uppercase font-bold tracking-widest">Detail Editorial (Zig-Zag)</h5>
                      <div>
                        <label className="block text-[#ececec]/60 mb-1.5 uppercase">Teks Headline Kecil</label>
                        <input type="text" value={formData.editorialCaption || ""} onChange={(e) => setFormData({...formData, editorialCaption: e.target.value})} className="w-full bg-black border border-[#1f1f1f] p-3 rounded-xl text-white" placeholder="+ Headline" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#ececec]/60 mb-1.5 uppercase">Gambar Kiri</label>
                          <ImageUpload value={formData.editorialImage || ""} onChange={(url) => setFormData({...formData, editorialImage: url})} />
                          <label className="block text-[#ececec]/60 mb-1.5 uppercase mt-3">Teks Kanan</label>
                          <textarea rows={3} value={formData.editorialBody || ""} onChange={(e) => setFormData({...formData, editorialBody: e.target.value})} className="w-full bg-black border border-[#1f1f1f] p-3 rounded-xl text-white resize-none" />
                        </div>
                        <div>
                          <label className="block text-[#ececec]/60 mb-1.5 uppercase">Teks Kiri Bawah</label>
                          <textarea rows={3} value={formData.editorialBodyRight || ""} onChange={(e) => setFormData({...formData, editorialBodyRight: e.target.value})} className="w-full bg-black border border-[#1f1f1f] p-3 rounded-xl text-white resize-none mb-3" />
                          <label className="block text-[#ececec]/60 mb-1.5 uppercase">Gambar Kanan</label>
                          <ImageUpload value={formData.editorialImageRight || ""} onChange={(url) => setFormData({...formData, editorialImageRight: url})} />
                        </div>
                      </div>
                    </div>
                    
                    {/* INPUT VIDEO THUMB & VIDEO URL DI SINI */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <label className="block text-[#ececec]/60 mb-1.5 uppercase">Video Thumbnail Placeholder</label>
                        <ImageUpload value={formData.videoThumb || ""} onChange={(url) => setFormData({...formData, videoThumb: url})} />
                      </div>
                      <div>
                        <label className="block text-[#ececec]/60 mb-1.5 uppercase">Link Video (Youtube/Vimeo)</label>
                        <input 
                          type="url" 
                          value={formData.videoUrl || ""} 
                          onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} 
                          className="w-full bg-[#111] border border-[#1f1f1f] p-3 rounded-xl text-white" 
                          placeholder="https://youtube.com/watch?v=..." 
                        />
                      </div>
                    </div>

                  </div>
                </form>
              ) : (
                
                <div className="space-y-16 pointer-events-none select-none">
                  <div>
                    <h4 className="text-emerald-400 uppercase tracking-widest font-bold mb-6 text-xs border-b border-[#1f1f1f] pb-2">1. Preview di Halaman Katalog (Grid)</h4>
                    <div className="relative overflow-hidden rounded-2xl border border-[#1f1f1f] group aspect-[4/3] bg-black/30 block max-w-[300px]">
                      <Image
                        src={getFirstImage(formData.images) || formData.heroImage || "/images/placeholder.jpg"}
                        alt="Preview"
                        fill
                        className="object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-100 rounded-2xl z-10" />
                      <div className="absolute bottom-6 left-4 right-4 z-20">
                        <div className="bg-black/80 backdrop-blur-md border border-[#1f1f1f] p-4 rounded-xl shadow-xl">
                          <p className="text-[#ececec]/60 text-[9px] uppercase tracking-widest mb-1">
                            <span className="text-[#ececec] font-bold mr-1">+</span>
                            Article No.{formData.articleNo || "001"}
                          </p>
                          <h3 className="text-[#ececec] text-sm font-light tracking-wide mb-2 truncate">
                            {formData.name || "Nama Produk"}
                          </h3>
                          <div className="text-[#ececec]/60 text-[9px] uppercase tracking-widest flex items-center gap-2">
                            Learn more <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-emerald-400 uppercase tracking-widest font-bold mb-6 text-xs border-b border-[#1f1f1f] pb-2">2. Preview di Halaman Artikel (Hero)</h4>
                    <section className="relative w-full aspect-[21/9] flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#1f1f1f]">
                      <div className="absolute inset-0 z-0">
                        <Image src={formData.heroImage || getFirstImage(formData.images) || "/images/placeholder.jpg"} alt="Hero" fill className="object-cover opacity-40 grayscale" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]" />
                      </div>
                      <div className="relative z-10 w-full px-8 text-center max-w-2xl">
                        <h1 className="text-3xl text-[#ececec] font-light mb-2 font-serif tracking-wide">
                          {formData.articleTitle || formData.name || "Judul Artikel Story"}
                        </h1>
                        <p className="text-[#ececec]/60 text-[10px] uppercase tracking-widest mb-4">
                          {formData.articleSubtitle || `Opus Arcanum — Article No.${formData.articleNo || "001"}`}
                        </p>
                        <p className="text-[#ececec]/60 text-[10px] leading-relaxed whitespace-pre-line line-clamp-3">
                          {formData.storyIntro || "Teks intro akan muncul di sini..."} 
                        </p>
                      </div>
                    </section>
                  </div>

                  <div>
                    <h4 className="text-emerald-400 uppercase tracking-widest font-bold mb-6 text-xs border-b border-[#1f1f1f] pb-2">3. Preview Editorial (Zig-Zag)</h4>
                    <div className="bg-[#050505] p-8 rounded-2xl border border-[#1f1f1f] space-y-12">
                      <div className="flex items-center gap-8">
                        <div className="w-1/2 flex justify-end">
                          <div className="relative w-full max-w-[200px] aspect-[4/5] rounded-xl overflow-hidden border border-[#1f1f1f]">
                            <Image src={formData.editorialImage || "/images/placeholder.jpg"} fill className="object-cover grayscale" alt="Zigzag Left" />
                          </div>
                        </div>
                        <div className="w-1/2">
                          <h3 className="text-[#ececec] text-[9px] uppercase tracking-[0.2em] font-bold mb-3">
                            {formData.editorialCaption || "+ Headline"}
                          </h3>
                          <p className="text-[#ececec]/60 text-[9px] leading-relaxed text-justify line-clamp-4">
                            {formData.editorialBody || "Paragraf editorial kanan akan muncul di sini..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#1f1f1f] flex gap-4 shrink-0 bg-[#0a0a0a]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 border border-[#1f1f1f] py-3.5 uppercase tracking-widest font-bold rounded-xl hover:bg-[#111111] cursor-pointer text-[#ececec] text-xs">
                Cancel
              </button>
              <button 
                type="submit" 
                form="article-form"
                disabled={loading} 
                className="w-1/2 bg-[#ececec] text-[#050505] py-3.5 uppercase tracking-widest font-bold rounded-xl hover:bg-white disabled:opacity-50 cursor-pointer text-xs"
              >
                {loading ? "Saving..." : "Save Article & Story"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}