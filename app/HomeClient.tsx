"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, XCircle } from "lucide-react";
import {
  InlineEditableText,
  InlineEditableImage,
  InlineEditableVideo,
} from "@/components/inline-edit";
import { getAssetUrl } from "@/lib/assetUrls";

// --- KOMPONEN BANTUAN UNTUK KARTU GRID (EPISODE GENAP) ---
const GridCard = ({
  item,
  aspect,
  isFocused = false,
}: {
  item: any;
  aspect: string;
  isFocused?: boolean;
}) => {
  const isRealItem = Boolean(item?.id && !item.id.match(/^\d+$/));

  return (
    <div
      data-article-card={item.id}
      className="relative group transition-all duration-300 ease-out"
    >
      <Link
        href={`/articles/${item.slug}`}
        className={`relative overflow-hidden rounded-2xl border border-transparent hover:border-[#1f1f1f] group ${aspect} bg-black/30 block cursor-pointer transition-all duration-500 hover:-translate-y-2 ${
          isFocused ? "shadow-[0_0_35px_rgba(0,0,0,0.9)]" : ""
        }`}
      >
        {isRealItem ? (
          <InlineEditableImage
            type="article"
            id={item.id}
            field="heroImage"
            label="Article Thumbnail"
            value={item.image}
            className="w-full h-full"
            isFocused={isFocused}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className={`object-cover transition-all duration-500 rounded-2xl ${
                isFocused ? "grayscale-0 opacity-100" : "grayscale opacity-75"
              } md:grayscale md:opacity-75 md:group-hover:grayscale-0 md:group-hover:opacity-100 md:group-hover:scale-105`}
            />
          </InlineEditableImage>
        ) : (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className={`object-cover transition-all duration-500 rounded-2xl ${
              isFocused ? "grayscale-0 opacity-100" : "grayscale opacity-75"
            } md:grayscale md:opacity-75 md:group-hover:grayscale-0 md:group-hover:opacity-100 md:group-hover:scale-105`}
          />
        )}

        {/* Soft Dark Gradient: Visible when isFocused on mobile, Hover on desktop */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 rounded-2xl z-10 pointer-events-none ${
            isFocused ? "opacity-100" : "opacity-0"
          } md:opacity-0 md:group-hover:opacity-100`}
        />

        {/* Dynamic Center Viewport Title Box: Slides up & visible on focused card in mobile, Hover on desktop */}
        <div
          className={`absolute bottom-4 left-3 right-3 sm:bottom-6 sm:left-4 sm:right-4 transition-all duration-300 ease-out z-20 ${
            isFocused
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          } md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto`}
        >
          <div className="bg-black/85 backdrop-blur-md border border-[#1f1f1f] p-3.5 sm:p-4 md:p-5 rounded-xl shadow-xl pointer-events-auto">
            <div className="text-[#ececec]/60 text-[9px] uppercase tracking-widest mb-1">
              <span className="text-[#ececec] font-bold mr-1">+</span>
              {isRealItem ? (
                <InlineEditableText
                  type="article"
                  id={item.id}
                  field="articleNo"
                  label="Article Number"
                  value={item.articleNo}
                  className="inline-block"
                >
                  <span>Article No.{item.articleNo}</span>
                </InlineEditableText>
              ) : (
                <span>Article No.{item.articleNo}</span>
              )}
            </div>

            <h3 className="text-[#ececec] text-sm md:text-lg font-light tracking-wide mb-1.5 md:mb-3 truncate">
              {isRealItem ? (
                <InlineEditableText
                  type="article"
                  id={item.id}
                  field="name"
                  label="Article Title"
                  value={item.title}
                >
                  <span>{item.title}</span>
                </InlineEditableText>
              ) : (
                item.title
              )}
            </h3>

            <div className="text-[#ececec]/60 text-[9px] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
              Learn more <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

// --- KOMPONEN UTAMA SETIAP EPISODE ---
function EpisodeBlock({ episode, index }: { episode: any; index: number }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const evenGridRef = useRef<HTMLDivElement>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [activeGridCardId, setActiveGridCardId] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const isRealEpisode = Boolean(episode?.id);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Convert YouTube URL to Embed URL
  const getEmbedUrl = (url: string) => {
    if (!url || url === "#") return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : null;
  };

  const embedUrl = getEmbedUrl(episode.videoUrl);

  const defaultItems = [
    { id: "1", slug: "1", image: getAssetUrl("/images/Group 351.png"), title: "Fluere Nabulam", articleNo: "001" },
    { id: "2", slug: "2", image: getAssetUrl("/images/Group 361.png"), title: "Nocturne Cargo", articleNo: "002" },
    { id: "3", slug: "3", image: getAssetUrl("/images/Group 37-1.png"), title: "Void Heavyweight", articleNo: "003" },
    { id: "4", slug: "4", image: getAssetUrl("/images/Group 381.jpeg"), title: "Arcanum Jacket", articleNo: "004" },
  ];

  const rawItems =
    episode.articles && episode.articles.length > 0
      ? episode.articles.map((art: any, idx: number) => ({
          id: art.id,
          slug: art.slug,
          image: getAssetUrl(art.heroImage || art.images?.[0] || "/images/placeholder.jpg"),
          title: art.name || art.articleTitle,
          articleNo: art.articleNo || `00${idx + 1}`,
        }))
      : defaultItems;

  const episodeItems = [...rawItems].sort((a, b) =>
    (a.articleNo || "").localeCompare(b.articleNo || "", undefined, { numeric: true })
  );

  const isEvenEpisode = index % 2 !== 0;

  // Active slide detection on mobile based on center alignment (Odd episodes carousel)
  const updateActiveSlide = useCallback(() => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;

    let closestIdx = 0;
    let minDistance = Infinity;

    children.forEach((child, idx) => {
      const rect = child.getBoundingClientRect();
      const childCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    setActiveSlideIdx(closestIdx);
  }, []);

  // Dynamic Center Viewport Detection for Even Episodes (Vertical Layout on mobile)
  const updateGridCenterFocus = useCallback(() => {
    if (!evenGridRef.current) return;
    const cards = evenGridRef.current.querySelectorAll<HTMLElement>("[data-article-card]");
    if (cards.length === 0) return;

    const viewportCenterY = window.innerHeight / 2;
    let closestId: string | null = null;
    let minDistance = Infinity;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenterY = rect.top + rect.height / 2;
      const distance = Math.abs(viewportCenterY - cardCenterY);

      if (distance < minDistance) {
        minDistance = distance;
        closestId = card.getAttribute("data-article-card");
      }
    });

    // If the closest card is reasonably near the center
    if (minDistance < window.innerHeight * 0.45) {
      setActiveGridCardId(closestId);
    } else {
      setActiveGridCardId(null);
    }
  }, []);

  useEffect(() => {
    updateActiveSlide();
    const container = carouselRef.current;
    if (!container) return;

    let rafId: number;
    const handleScrollRaf = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveSlide);
    };

    container.addEventListener("scroll", handleScrollRaf, { passive: true });
    window.addEventListener("resize", handleScrollRaf, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", handleScrollRaf);
      window.removeEventListener("resize", handleScrollRaf);
    };
  }, [updateActiveSlide, episodeItems]);

  useEffect(() => {
    if (!isEvenEpisode) return;

    updateGridCenterFocus();

    let rafId: number;
    const handleScrollRaf = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateGridCenterFocus);
    };

    window.addEventListener("scroll", handleScrollRaf, { passive: true });
    window.addEventListener("resize", handleScrollRaf, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScrollRaf);
      window.removeEventListener("resize", handleScrollRaf);
    };
  }, [isEvenEpisode, updateGridCenterFocus, episodeItems]);

  // Video Modal
  const VideoModal = () =>
    isVideoOpen && embedUrl ? (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12 animate-in fade-in duration-300">
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#1f1f1f]">
          <button
            onClick={() => setIsVideoOpen(false)}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 hover:bg-red-900/80 border border-[#1f1f1f] text-[#ececec] px-4 py-2 rounded-full text-[10px] uppercase tracking-widest transition-colors cursor-pointer backdrop-blur-md"
          >
            <XCircle className="w-4 h-4 text-red-400" /> Close Video
          </button>

          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    ) : null;

  // Video Preview Block
  const VideoPreviewBlock = () => (
    <div className="relative w-full max-w-[340px]">
      {isRealEpisode ? (
        <InlineEditableVideo
          type="episode"
          id={episode.id}
          field="videoUrl"
          label="Episode YouTube Video"
          value={episode.videoUrl || ""}
        >
          <div
            onClick={() => (embedUrl ? setIsVideoOpen(true) : null)}
            className="relative block w-full aspect-[16/10] bg-black/60 backdrop-blur-md border border-[#1f1f1f]/80 rounded-2xl overflow-hidden group shadow-2xl cursor-pointer"
          >
            <Image
              src={getAssetUrl(episode.heroImage || "/images/ARTICLES STORIES.png")}
              alt="Episode Preview"
              fill
              className="object-cover opacity-75 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full border border-[#ececec]/50 flex items-center justify-center backdrop-blur-md bg-black/40 transition-transform group-hover:scale-110">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-[#ececec] border-b-[8px] border-b-transparent ml-1" />
              </div>
            </div>
          </div>
        </InlineEditableVideo>
      ) : (
        <div
          onClick={() => (embedUrl ? setIsVideoOpen(true) : null)}
          className="relative block w-full aspect-[16/10] bg-black/60 backdrop-blur-md border border-[#1f1f1f]/80 rounded-2xl overflow-hidden group shadow-2xl cursor-pointer"
        >
          <Image
            src={getAssetUrl(episode.heroImage || "/images/ARTICLES STORIES.png")}
            alt="Episode Preview"
            fill
            className="object-cover opacity-75 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border border-[#ececec]/50 flex items-center justify-center backdrop-blur-md bg-black/40 transition-transform group-hover:scale-110">
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-[#ececec] border-b-[8px] border-b-transparent ml-1" />
            </div>
          </div>
        </div>
      )}

      {/* Edit Episode Banner Link */}
      {isRealEpisode && (
        <div className="mt-2 flex justify-end">
          <InlineEditableImage
            type="episode"
            id={episode.id}
            field="heroImage"
            label="Banner Image"
            value={getAssetUrl(episode.heroImage || "/images/ARTICLES STORIES.png")}
            buttonOnly
          />
        </div>
      )}
    </div>
  );

  // ==========================================
  // LAYOUT B: EPISODE GENAP (GRID STYLE)
  // ==========================================
  if (isEvenEpisode) {
    return (
      <section className="relative z-20 bg-[#050505] pt-16 pb-24 border-b border-[#1f1f1f]">
        <VideoModal />

        <div className="flex">
          <div className="hidden md:flex flex-col items-center justify-between w-16 shrink-0 border-r border-[#1f1f1f] py-12 px-4">
            <div className="flex flex-col gap-6 items-center text-[#ececec]/60"></div>
            <div className="-rotate-90 text-[#ececec]/30 text-[9px] uppercase tracking-[0.25em] whitespace-nowrap select-none mt-24">
              DISCOVER OUR STORIES
            </div>
          </div>

          <div className="flex-1 px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-16">
              {/* LEFT: VIDEO THUMBNAIL */}
              <div className="md:col-span-5 flex justify-start">
                <VideoPreviewBlock />
              </div>

              {/* RIGHT: EPISODE TITLE & STORY */}
              <div className="md:col-span-7 flex flex-col items-end text-right">
                <span className="text-[#ececec]/50 text-[10px] uppercase tracking-widest block mb-3">
                  {isRealEpisode ? (
                    <InlineEditableText
                      type="episode"
                      id={episode.id}
                      field="episodeNo"
                      label="Episode Number"
                      value={episode.episodeNo || `0${index + 1}`}
                      className="inline-block"
                    >
                      <span>Episode {episode.episodeNo || `0${index + 1}`}</span>
                    </InlineEditableText>
                  ) : (
                    `Episode ${episode.episodeNo || `0${index + 1}`}`
                  )}
                </span>

                <h2 className="text-3xl md:text-5xl font-light text-[#ececec] tracking-[0.15em] mb-6 leading-none whitespace-pre-line uppercase w-full">
                  {isRealEpisode ? (
                    <InlineEditableText
                      type="episode"
                      id={episode.id}
                      field="title"
                      label="Episode Title"
                      value={episode.title || "LEARN THE CHANTS"}
                      className="inline-block w-full"
                    >
                      <span>{episode.title || "LEARN THE CHANTS"}</span>
                    </InlineEditableText>
                  ) : (
                    episode.title || "LEARN THE CHANTS"
                  )}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mt-2">
                  <div className="text-[#ececec]/60 text-xs leading-relaxed whitespace-pre-line">
                    {isRealEpisode ? (
                      <InlineEditableText
                        type="episode"
                        id={episode.id}
                        field="descriptionLeft"
                        label="Episode Left Description"
                        value={episode.descriptionLeft || ""}
                        multiline
                        rows={4}
                        as="div"
                        className="w-full h-full"
                      >
                        <p>{episode.descriptionLeft || "No left description available."}</p>
                      </InlineEditableText>
                    ) : (
                      <p>{episode.descriptionLeft || ""}</p>
                    )}
                  </div>

                  <div className="text-[#ececec]/60 text-xs leading-relaxed whitespace-pre-line">
                    {isRealEpisode ? (
                      <InlineEditableText
                        type="episode"
                        id={episode.id}
                        field="descriptionRight"
                        label="Episode Right Description"
                        value={episode.descriptionRight || ""}
                        multiline
                        rows={4}
                        as="div"
                        className="w-full h-full"
                      >
                        <p>{episode.descriptionRight || "No right description available."}</p>
                      </InlineEditableText>
                    ) : (
                      <p>{episode.descriptionRight || ""}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div ref={evenGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {(episodeItems[0] || episodeItems[1]) && (
                <div className="flex flex-col gap-6">
                  {episodeItems[0] && (
                    <GridCard
                      item={episodeItems[0]}
                      aspect="aspect-[4/3]"
                      isFocused={activeGridCardId === episodeItems[0].id}
                    />
                  )}
                  {episodeItems[1] && (
                    <GridCard
                      item={episodeItems[1]}
                      aspect="aspect-[4/3]"
                      isFocused={activeGridCardId === episodeItems[1].id}
                    />
                  )}
                </div>
              )}
              {episodeItems[2] && (
                <GridCard
                  item={episodeItems[2]}
                  aspect="aspect-[3/4]"
                  isFocused={activeGridCardId === episodeItems[2].id}
                />
              )}
              {episodeItems[3] && (
                <GridCard
                  item={episodeItems[3]}
                  aspect="aspect-[3/4]"
                  isFocused={activeGridCardId === episodeItems[3].id}
                />
              )}
              {episodeItems.slice(4).map((item: any) => (
                <GridCard
                  key={item.id}
                  item={item}
                  aspect="aspect-[3/4]"
                  isFocused={activeGridCardId === item.id}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // LAYOUT A: EPISODE GANJIL (CAROUSEL STYLE)
  // ==========================================
  return (
    <section className="relative z-20 pt-24 pb-16 bg-[#050505] overflow-hidden border-b border-[#1f1f1f]">
      <VideoModal />

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <span className="text-[#ececec]/50 text-[10px] uppercase tracking-widest block mb-3">
              {isRealEpisode ? (
                <InlineEditableText
                  type="episode"
                  id={episode.id}
                  field="episodeNo"
                  label="Episode Number"
                  value={episode.episodeNo || `0${index + 1}`}
                  className="inline-block"
                >
                  <span>Episode {episode.episodeNo || `0${index + 1}`}</span>
                </InlineEditableText>
              ) : (
                `Episode ${episode.episodeNo || `0${index + 1}`}`
              )}
            </span>

            <h2 className="text-3xl md:text-5xl font-light text-[#ececec] tracking-[0.15em] mb-6 leading-none whitespace-pre-line uppercase">
              {isRealEpisode ? (
                <InlineEditableText
                  type="episode"
                  id={episode.id}
                  field="title"
                  label="Episode Title"
                  value={episode.title || "OPUS ARCANUM"}
                  className="inline-block"
                >
                  <span>{episode.title || "OPUS ARCANUM"}</span>
                </InlineEditableText>
              ) : (
                episode.title || "OPUS ARCANUM"
              )}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-[#ececec]/60 text-xs leading-relaxed whitespace-pre-line">
                {isRealEpisode ? (
                  <InlineEditableText
                    type="episode"
                    id={episode.id}
                    field="descriptionLeft"
                    label="Episode Left Description"
                    value={episode.descriptionLeft || ""}
                    multiline
                    rows={4}
                    as="div"
                    className="w-full h-full"
                  >
                    <p>{episode.descriptionLeft || "No left description available."}</p>
                  </InlineEditableText>
                ) : (
                  <p>{episode.descriptionLeft || "No description."}</p>
                )}
              </div>

              <div className="text-[#ececec]/60 text-xs leading-relaxed whitespace-pre-line">
                {isRealEpisode ? (
                  <InlineEditableText
                    type="episode"
                    id={episode.id}
                    field="descriptionRight"
                    label="Episode Right Description"
                    value={episode.descriptionRight || ""}
                    multiline
                    rows={4}
                    as="div"
                    className="w-full h-full"
                  >
                    <p>{episode.descriptionRight || "No right description available."}</p>
                  </InlineEditableText>
                ) : (
                  <p>{episode.descriptionRight || ""}</p>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-end">
            <VideoPreviewBlock />
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={() => scrollCarousel("left")}
            className="w-10 h-10 border border-[#1f1f1f] bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#ececec]/60 hover:text-white hover:bg-[#1f1f1f] transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={() => scrollCarousel("right")}
            className="w-10 h-10 border border-[#1f1f1f] bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#ececec]/60 hover:text-white hover:bg-[#1f1f1f] transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pl-16 pr-16 md:pl-24 md:pr-24 space-x-6 pb-8 items-stretch"
        >
          {episodeItems.map((item: any, idx: number) => {
            const isRealArt = Boolean(item?.id && !item.id.match(/^\d+$/));
            const isActive = activeSlideIdx === idx;

            return (
              <div key={item.id} className="shrink-0 flex items-center gap-4 snap-center group">
                <div className="hidden md:flex -rotate-90 text-[#ececec]/30 text-[9px] uppercase tracking-widest whitespace-nowrap select-none">
                  {isRealArt ? (
                    <InlineEditableText
                      type="article"
                      id={item.id}
                      field="articleNo"
                      label="Article Number"
                      value={item.articleNo}
                    >
                      <span>Article NO.{item.articleNo}</span>
                    </InlineEditableText>
                  ) : (
                    <span>Article NO.{item.articleNo}</span>
                  )}
                </div>

                <Link
                  href={`/articles/${item.slug}`}
                  className={`relative w-[260px] h-[360px] md:w-[340px] md:h-[460px] rounded-2xl border border-transparent hover:border-[#1f1f1f] bg-transparent overflow-hidden block transition-all duration-500 hover:-translate-y-3 ${
                    isActive ? "shadow-[0_0_30px_rgba(0,0,0,0.8)]" : ""
                  }`}
                >
                  {isRealArt ? (
                    <InlineEditableImage
                      type="article"
                      id={item.id}
                      field="heroImage"
                      label="Article Photo"
                      value={item.image}
                      className="w-full h-full"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className={`object-cover p-2 transition-all duration-700 md:group-hover:scale-105 rounded-2xl ${
                          isActive ? "grayscale-0 opacity-100" : "grayscale opacity-75"
                        } md:grayscale md:opacity-75 md:group-hover:grayscale-0 md:group-hover:opacity-100`}
                      />
                    </InlineEditableImage>
                  ) : (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className={`object-cover p-2 transition-all duration-700 md:group-hover:scale-105 rounded-2xl ${
                        isActive ? "grayscale-0 opacity-100" : "grayscale opacity-75"
                      } md:grayscale md:opacity-75 md:group-hover:grayscale-0 md:group-hover:opacity-100`}
                    />
                  )}

                  {/* Active-Slide Auto Title Card Reveal on Mobile / Hover on Desktop */}
                  <div
                    className={`absolute bottom-4 left-3 right-3 sm:bottom-8 sm:left-4 sm:right-4 transition-all duration-300 z-20 ${
                      isActive
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    } md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto`}
                  >
                    <div className="bg-black/85 backdrop-blur-md border border-[#1f1f1f] p-4 sm:p-5 rounded-xl shadow-xl pointer-events-auto">
                      <div className="text-[#ececec]/60 text-[9px] uppercase tracking-widest mb-1">
                        <span className="text-[#ececec] font-bold mr-1">+</span>
                        {item.title}
                      </div>
                      <h3 className="text-[#ececec] text-sm md:text-lg font-light tracking-wide mb-2 md:mb-3 truncate">
                        {isRealArt ? (
                          <InlineEditableText
                            type="article"
                            id={item.id}
                            field="name"
                            label="Article Title"
                            value={item.title}
                          >
                            <span>{item.title}</span>
                          </InlineEditableText>
                        ) : (
                          item.title
                        )}
                      </h3>
                      <div className="text-[#ececec]/60 text-[9px] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                        Learn more <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Active-Slide Soft Gradient Reveal on Mobile / Hover on Desktop */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300 z-10 rounded-2xl pointer-events-none ${
                      isActive ? "opacity-100" : "opacity-0"
                    } md:opacity-0 md:group-hover:opacity-100`}
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function HomeClient({
  episodes,
  heroManifesto,
}: {
  episodes: any[];
  heroManifesto?: string;
}) {
  const safeEpisodes = episodes && episodes.length > 0 ? episodes : [];
  const defaultManifesto =
    "A manifestation born from the shadows. Where silence meets brutalist form, and identity transcends time. Crafted for those who walk through the void and seek truth within the dark.";
  const manifesto = heroManifesto || defaultManifesto;

  return (
    <div className="flex flex-col min-h-screen">
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none md:hidden">
          <div className="relative w-[150vw] aspect-square flex items-center justify-center">
            <Image
              src={getAssetUrl("/images/pexels-wendelmoretti-1925630(background mata untuk jam).png")}
              alt="Mantra Eye Background"
              fill
              className="object-cover object-center grayscale opacity-100 brightness-100 scale-140 translate-y-13"
              priority
            />
            <Image
              src={getAssetUrl("/images/MASK.png")}
              alt="Mantra Clock Hero"
              fill
              className="object-contain mix-blend-screen opacity-45 contrast-125 scale-120 -translate-y-1"
              priority
            />
          </div>
        </div>

        <div className="hidden md:flex absolute inset-0 z-0 items-center justify-center pointer-events-none">
          <Image
            src={getAssetUrl("/images/pexels-wendelmoretti-1925630(background mata untuk jam).png")}
            alt="Mantra Eye Background"
            fill
            className="object-cover object-[center_17%] scale-100 grayscale opacity-100 brightness-100"
            priority
          />
        </div>

        <div className="hidden md:flex absolute inset-0 z-10 items-center justify-center pointer-events-none">
          <div className="relative w-full h-full max-w-[400vh] aspect-square">
            <Image
              src={getAssetUrl("/images/MASK.png")}
              alt="Mantra Clock Hero"
              fill
              className="object-contain mix-blend-screen opacity-45 contrast-125 scale-120 translate-y-10"
              priority
            />
          </div>
        </div>

        <div className="relative z-20 text-center flex flex-col items-center max-w-[420px] px-4">
          <div className="mb-4 flex justify-center mt-6">
            <Image
              alt="Mantra Wordmark Hero"
              className="object-contain opacity-90 drop-shadow-md"
              height={24}
              priority
              src={getAssetUrl("/images/WORDMARK CHROME 1.png")}
              width={140}
            />
          </div>

          {/* Editable Hero Manifesto */}
          <InlineEditableText
            type="setting"
            id="hero_manifesto"
            field="hero_manifesto"
            label="Hero Manifesto"
            value={manifesto}
            multiline
            rows={4}
            as="div"
            className="mb-6 w-full"
          >
            <p className="text-[#ececec] text-[7px] uppercase tracking-[0.25em] leading-[2.5] font-medium text-center drop-shadow-md">
              {manifesto}
            </p>
          </InlineEditableText>

          <Link
            className="border border-[#4a4a4a] bg-[#050505]/70 backdrop-blur-md text-[#ececec] px-6 py-2 uppercase tracking-[0.2em] text-[7px] font-bold hover:bg-white hover:text-black transition-all duration-300 rounded-full flex items-center gap-2"
            href="/#collection"
          >
            Learn More
            <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </section>

      <div id="collection" className="border-y border-[#1f1f1f] bg-[#0a0a0a] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee-slow">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="flex items-center space-x-8 mx-6 text-[#ececec]/30 text-[10px] uppercase tracking-[0.3em] font-mono"
            >
              <span>MANTRA</span>
              <span className="w-1 h-1 rounded-full bg-current inline-block" />
              <Image
                src="/images/ICON CHROME 1.png"
                alt="icon"
                width={10}
                height={10}
                className="object-contain opacity-50"
              />
              <span className="w-1 h-1 rounded-full bg-current inline-block" />
            </span>
          ))}
        </div>
      </div>

      {safeEpisodes.map((ep, index) => (
        <EpisodeBlock key={ep.id} episode={ep} index={index} />
      ))}

      {safeEpisodes.length === 0 && <EpisodeBlock episode={{}} index={0} />}
    </div>
  );
}