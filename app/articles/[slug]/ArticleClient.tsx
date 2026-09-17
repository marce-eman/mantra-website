"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, PlayCircle, XCircle } from "lucide-react";
import {
  InlineEditableText,
  InlineEditableImage,
  InlineEditableVideo,
} from "@/components/inline-edit";
import { updateInlineContentAction } from "@/app/actions/inlineEdit";
import { getAssetUrl } from "@/lib/assetUrls";

export default function ArticleClient({
  article,
  recommendedEpisode,
}: {
  article: any;
  recommendedEpisode: any;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const recommendedGridRef = useRef<HTMLDivElement>(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState<number>(0);
  const [activeRecCardId, setActiveRecCardId] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const scrollToGalleryIndex = (idx: number) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const children = Array.from(container.children) as HTMLElement[];
    if (children[idx]) {
      const child = children[idx];
      const targetLeft =
        child.offsetLeft - (container.clientWidth - child.clientWidth) / 2;
      container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    }
  };

  const handlePrevGallery = () => {
    const newIdx = Math.max(0, activeGalleryIdx - 1);
    scrollToGalleryIndex(newIdx);
  };

  const handleNextGallery = () => {
    const newIdx = Math.min(galleryImagesState.length - 1, activeGalleryIdx + 1);
    scrollToGalleryIndex(newIdx);
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

  const isReal = Boolean(article?.id);
  const isDummy = !article;

  const no = article?.articleNo || "001";
  const title =
    article?.articleTitle || article?.name || (isDummy ? "The Architecture of Shadows" : "");
  const subtitle = article?.articleSubtitle || `Opus Arcanum — Article No.${no}`;
  const heroImage = getAssetUrl(
    article?.heroImage || article?.images?.[0] || "/images/ARTICLES STORIES.png"
  );
  const introBody =
    article?.storyIntro?.trim() ||
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.";
  const leftBody =
    article?.storyLeft?.trim() ||
    "sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.";
  const rightBody =
    article?.storyRight?.trim() ||
    "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";

  const [galleryImagesState, setGalleryImagesState] = useState<string[]>(
    article?.galleryImages && article.galleryImages.length > 0
      ? article.galleryImages.map((img: string) => getAssetUrl(img))
      : [
          getAssetUrl("/images/Group 351.png"),
          getAssetUrl("/images/Rectangle 33.png"),
          getAssetUrl("/images/Rectangle 31.png"),
          getAssetUrl("/images/Rectangle 35.png"),
        ]
  );

  const videoThumb = getAssetUrl(article?.videoThumb || "/images/vid art1.png");
  const videoUrl = article?.videoUrl || "#";
  const embedUrl = getEmbedUrl(videoUrl);

  const blockData = {
    image: getAssetUrl(article?.editorialImage || "/images/Rectangle 31.png"),
    caption: article?.editorialCaption || "+ Headline",
    body:
      article?.editorialBody?.trim() ||
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dita sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.",
    bodyRight:
      article?.editorialBodyRight?.trim() ||
      "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
    imageRight: getAssetUrl(article?.editorialImageRight || "/images/Rectangle 33.png"),
  };

  const episodeTitle = article?.episode?.title || "OPUS ARCANUM";
  const episodeNo = article?.episode?.episodeNo || "01";

  // Helper to update one image inside the galleryImages array
  const handleUpdateGalleryItem = async (index: number, newImageUrl: string) => {
    if (!isReal) return;
    const nextGallery = [...galleryImagesState];
    nextGallery[index] = newImageUrl;
    setGalleryImagesState(nextGallery);

    await updateInlineContentAction({
      type: "article",
      id: article.id,
      field: "galleryImages",
      value: JSON.stringify(nextGallery),
    });
  };

  // Synchronize active gallery slide indicator with carousel scroll
  const updateActiveGallerySlide = useCallback(() => {
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

    setActiveGalleryIdx(closestIdx);
  }, []);

  useEffect(() => {
    updateActiveGallerySlide();
    const container = carouselRef.current;
    if (!container) return;

    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveGallerySlide);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [updateActiveGallerySlide, galleryImagesState]);

  // Dynamic Center Viewport Detection for Recommended Articles (Single-Focus Title on mobile)
  const updateRecCenterFocus = useCallback(() => {
    if (!recommendedGridRef.current) return;
    const cards = recommendedGridRef.current.querySelectorAll<HTMLElement>("[data-rec-card]");
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
        closestId = card.getAttribute("data-rec-card");
      }
    });

    if (minDistance < window.innerHeight * 0.45) {
      setActiveRecCardId(closestId);
    } else {
      setActiveRecCardId(null);
    }
  }, []);

  useEffect(() => {
    if (!recommendedEpisode) return;

    updateRecCenterFocus();

    let rafId: number;
    const handleScrollRaf = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateRecCenterFocus);
    };

    window.addEventListener("scroll", handleScrollRaf, { passive: true });
    window.addEventListener("resize", handleScrollRaf, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScrollRaf);
      window.removeEventListener("resize", handleScrollRaf);
    };
  }, [recommendedEpisode, updateRecCenterFocus]);

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

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <VideoModal />

      {/* ─────────────────────────────────────────
          1. HERO SECTION
      ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center pt-32 pb-12 overflow-hidden">
        {/* Background Banner Hero */}
        <div className="absolute inset-0 z-0">
          {isReal ? (
            <InlineEditableImage
              type="article"
              id={article.id}
              field="heroImage"
              label="Article Banner Image"
              value={heroImage}
              className="w-full h-full"
            >
              <Image
                src={heroImage}
                alt={title}
                fill
                className="object-cover opacity-40 grayscale"
                priority
              />
            </InlineEditableImage>
          ) : (
            <Image
              src={heroImage}
              alt={title}
              fill
              className="object-cover opacity-40 grayscale"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505] pointer-events-none" />
        </div>

        {/* Hero Text */}
        <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start mt-12 gap-8">
          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl text-[#ececec] font-light mb-2 font-serif tracking-wide leading-tight">
              {isReal ? (
                <InlineEditableText
                  type="article"
                  id={article.id}
                  field="articleTitle"
                  label="Article Title"
                  value={title}
                  as="span"
                >
                  <span>{title}</span>
                </InlineEditableText>
              ) : (
                title
              )}
            </h1>

            <div className="text-[#ececec]/60 text-[10px] uppercase tracking-widest mb-4">
              {isReal ? (
                <InlineEditableText
                  type="article"
                  id={article.id}
                  field="articleSubtitle"
                  label="Article Subtitle"
                  value={subtitle}
                  as="div"
                >
                  <p>{subtitle}</p>
                </InlineEditableText>
              ) : (
                <p>{subtitle}</p>
              )}
            </div>

            <div className="text-[#ececec]/60 text-[10px] leading-relaxed text-justify whitespace-pre-line">
              {isReal ? (
                <InlineEditableText
                  type="article"
                  id={article.id}
                  field="storyIntro"
                  label="Story Intro"
                  value={introBody}
                  multiline
                  rows={4}
                  as="div"
                >
                  <p>{introBody}</p>
                </InlineEditableText>
              ) : (
                <p>{introBody}</p>
              )}
            </div>
          </div>

          <div className="text-[#ececec]/60 text-[10px] uppercase tracking-widest flex items-center gap-2">
            {isReal ? (
              <InlineEditableText
                type="article"
                id={article.id}
                field="articleNo"
                label="Article Number"
                value={no}
                as="span"
              >
                <span>Article {no}</span>
              </InlineEditableText>
            ) : (
              <span>Article {no}</span>
            )}
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* --- HERO VIDEO PLAY BUTTON --- */}
        <div className="relative z-10 mt-16 md:mt-24 w-full max-w-3xl mx-6">
          {isReal ? (
            <InlineEditableVideo
              type="article"
              id={article.id}
              field="videoUrl"
              label="Hero Video URL"
              value={videoUrl}
            >
              <div
                onClick={() => (embedUrl ? setIsVideoOpen(true) : null)}
                className="relative block w-full aspect-[16/9] md:aspect-[21/9] bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden group cursor-pointer shadow-2xl"
              >
                <Image
                  src={videoThumb}
                  alt="Video Cover"
                  fill
                  className="object-cover opacity-50 grayscale group-hover:opacity-75 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-[#ececec]/70 group-hover:text-white transition-colors duration-300 stroke-1" />
                </div>
              </div>
            </InlineEditableVideo>
          ) : (
            <div
              onClick={() => (embedUrl ? setIsVideoOpen(true) : null)}
              className="relative block w-full aspect-[16/9] md:aspect-[21/9] bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden group cursor-pointer shadow-2xl"
            >
              <Image
                src={videoThumb}
                alt="Video Cover"
                fill
                className="object-cover opacity-50 grayscale group-hover:opacity-75 group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-[#ececec]/70 group-hover:text-white transition-colors duration-300 stroke-1" />
              </div>
            </div>
          )}

          {/* Edit Video Cover Thumbnail */}
          {isReal && (
            <div className="mt-2 flex justify-end">
              <InlineEditableImage
                type="article"
                id={article.id}
                field="videoThumb"
                label="Video Cover"
                value={videoThumb}
                buttonOnly
              />
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────
          2. SCROLLING MARQUEE DIVIDER
      ───────────────────────────────────────── */}
      <div className="border-y border-[#1f1f1f] bg-[#0a0a0a] py-3 overflow-hidden relative z-10">
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

      {/* ─────────────────────────────────────────
          3. OPUS ARCANUM SECTION (Light Background)
      ───────────────────────────────────────── */}
      <section className="bg-[#b3b3b3] text-[#111] py-24 relative z-10">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="mb-12">
            <span className="text-[#111]/60 text-[9px] uppercase tracking-[0.2em] font-bold block mb-2">
              Episode {episodeNo}
            </span>
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              <h2 className="text-3xl md:text-5xl font-light tracking-[0.15em] font-serif uppercase">
                {article?.episode?.id ? (
                  <InlineEditableText
                    type="episode"
                    id={article.episode.id}
                    field="title"
                    label="Episode Title"
                    value={episodeTitle}
                    as="span"
                  >
                    <span>{episodeTitle}</span>
                  </InlineEditableText>
                ) : (
                  episodeTitle
                )}
              </h2>
              <span className="text-[#111]/60 text-[9px] uppercase tracking-[0.2em] md:pb-2">
                ARTICLE NO.{no}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="text-[#111]/80 text-[10px] leading-relaxed font-medium text-justify whitespace-pre-line">
              {isReal ? (
                <InlineEditableText
                  type="article"
                  id={article.id}
                  field="storyLeft"
                  label="Story Left Paragraph"
                  value={leftBody}
                  multiline
                  rows={4}
                  as="div"
                >
                  <p>{leftBody}</p>
                </InlineEditableText>
              ) : (
                <p>{leftBody}</p>
              )}
            </div>

            <div className="text-[#111]/80 text-[10px] leading-relaxed font-medium text-justify whitespace-pre-line">
              {isReal ? (
                <InlineEditableText
                  type="article"
                  id={article.id}
                  field="storyRight"
                  label="Story Right Paragraph"
                  value={rightBody}
                  multiline
                  rows={4}
                  as="div"
                >
                  <p>{rightBody}</p>
                </InlineEditableText>
              ) : (
                <p>{rightBody}</p>
              )}
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 items-stretch"
          >
            {galleryImagesState.map((img: string, index: number) => (
              <div
                key={index}
                className={`shrink-0 ${
                  index === 0 ? "w-[280px] md:w-[320px]" : "w-[240px] md:w-[280px]"
                } aspect-[4/5] bg-[#050505] rounded-xl relative overflow-hidden snap-center group`}
              >
                {isReal ? (
                  <InlineEditableImage
                    type="article"
                    id={article.id}
                    field="galleryImages"
                    label={`Gallery Image ${index + 1}`}
                    value={img}
                    className="w-full h-full"
                    onSaveSuccess={(newUrl) => handleUpdateGalleryItem(index, newUrl)}
                  >
                    <Image
                      src={img}
                      fill
                      className={`object-cover ${
                        index === 0
                          ? "opacity-80 group-hover:opacity-100 transition-opacity"
                          : "opacity-80"
                      }`}
                      alt={`Gallery Image ${index + 1}`}
                    />
                  </InlineEditableImage>
                ) : (
                  <Image
                    src={img}
                    fill
                    className={`object-cover ${
                      index === 0
                        ? "opacity-80 group-hover:opacity-100 transition-opacity"
                        : "opacity-80"
                    }`}
                    alt={`Gallery Image ${index + 1}`}
                  />
                )}

                {index === 0 && (
                  <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-[#333] pointer-events-none">
                    <p className="text-[#ececec] text-xs font-serif tracking-widest">
                      + {title}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-6 sm:gap-8 mt-6">
            <button
              type="button"
              onClick={handlePrevGallery}
              disabled={activeGalleryIdx === 0}
              className="text-[#111]/60 hover:text-[#111] transition-all disabled:opacity-20 disabled:hover:text-[#111]/60 cursor-pointer p-1"
              aria-label="Previous gallery image"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2.5 items-center">
              {galleryImagesState.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToGalleryIndex(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    activeGalleryIdx === idx
                      ? "w-6 h-2 bg-[#111]"
                      : "w-2 h-2 bg-[#111]/30 hover:bg-[#111]/70"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextGallery}
              disabled={activeGalleryIdx === galleryImagesState.length - 1}
              className="text-[#111]/60 hover:text-[#111] transition-all disabled:opacity-20 disabled:hover:text-[#111]/60 cursor-pointer p-1"
              aria-label="Next gallery image"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <div className="border-y border-[#1f1f1f] bg-[#0a0a0a] py-3 overflow-hidden relative z-10">
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

      {/* ─────────────────────────────────────────
          4. ZIG-ZAG DETAILS & VIDEO
      ───────────────────────────────────────── */}
      <section className="bg-[#050505] py-24 px-6 md:px-12 relative z-10">
        <div className="max-w-screen-xl mx-auto space-y-24 md:space-y-32">
          {/* Row 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
              <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-xl overflow-hidden border border-[#1f1f1f]">
                {isReal ? (
                  <InlineEditableImage
                    type="article"
                    id={article.id}
                    field="editorialImage"
                    label="Editorial Left Image"
                    value={blockData.image}
                    className="w-full h-full"
                  >
                    <Image
                      src={blockData.image}
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                      alt="Zigzag Left"
                    />
                  </InlineEditableImage>
                ) : (
                  <Image
                    src={blockData.image}
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    alt="Zigzag Left"
                  />
                )}
              </div>
            </div>

            <div className="w-full md:w-1/2 max-w-md">
              <div className="text-[#ececec] text-[11px] uppercase tracking-[0.2em] font-bold mb-6">
                {isReal ? (
                  <InlineEditableText
                    type="article"
                    id={article.id}
                    field="editorialCaption"
                    label="Editorial Headline"
                    value={blockData.caption}
                    as="div"
                  >
                    <h3>{blockData.caption}</h3>
                  </InlineEditableText>
                ) : (
                  <h3>{blockData.caption}</h3>
                )}
              </div>

              <div className="text-[#ececec]/60 text-[10px] leading-relaxed text-justify mb-4 whitespace-pre-line">
                {isReal ? (
                  <InlineEditableText
                    type="article"
                    id={article.id}
                    field="editorialBody"
                    label="Editorial Left Body"
                    value={blockData.body}
                    multiline
                    rows={4}
                    as="div"
                  >
                    <p>{blockData.body}</p>
                  </InlineEditableText>
                ) : (
                  <p>{blockData.body}</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
            <div className="w-full md:w-1/2 max-w-md md:text-right order-2 md:order-1 flex flex-col items-end ml-auto">
              <div className="text-[#ececec] text-[11px] uppercase tracking-[0.2em] font-bold mb-6">
                {isReal ? (
                  <InlineEditableText
                    type="article"
                    id={article.id}
                    field="editorialCaption"
                    label="Editorial Headline"
                    value={blockData.caption}
                    as="div"
                  >
                    <h3>{blockData.caption}</h3>
                  </InlineEditableText>
                ) : (
                  <h3>{blockData.caption}</h3>
                )}
              </div>

              <div className="text-[#ececec]/60 text-[10px] leading-relaxed text-justify md:text-right mb-4 whitespace-pre-line">
                {isReal ? (
                  <InlineEditableText
                    type="article"
                    id={article.id}
                    field="editorialBodyRight"
                    label="Editorial Right Body"
                    value={blockData.bodyRight}
                    multiline
                    rows={4}
                    as="div"
                  >
                    <p>{blockData.bodyRight}</p>
                  </InlineEditableText>
                ) : (
                  <p>{blockData.bodyRight}</p>
                )}
              </div>
            </div>

            <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-start">
              <div className="relative w-full max-w-[500px] aspect-[16/10] rounded-xl overflow-hidden border border-[#1f1f1f]">
                {isReal ? (
                  <InlineEditableImage
                    type="article"
                    id={article.id}
                    field="editorialImageRight"
                    label="Editorial Right Image"
                    value={blockData.imageRight}
                    className="w-full h-full"
                  >
                    <Image
                      src={blockData.imageRight}
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                      alt="Zigzag Right"
                    />
                  </InlineEditableImage>
                ) : (
                  <Image
                    src={blockData.imageRight}
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    alt="Zigzag Right"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Row 3 - Secondary Video Player */}
          <div className="flex flex-col items-center pt-12">
            <div className="w-full max-w-4xl">
              {isReal ? (
                <InlineEditableVideo
                  type="article"
                  id={article.id}
                  field="videoUrl"
                  label="Story Video URL"
                  value={videoUrl}
                >
                  <div
                    onClick={() => (embedUrl ? setIsVideoOpen(true) : null)}
                    className="relative block w-full aspect-[21/9] bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden group cursor-pointer shadow-2xl"
                  >
                    <Image
                      src={videoThumb}
                      alt="Secondary Video Cover"
                      fill
                      className="object-cover opacity-40 grayscale group-hover:opacity-70 group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-[#ececec]/70 group-hover:text-white transition-colors duration-300 stroke-1" />
                    </div>
                    <div className="absolute bottom-4 left-4 -rotate-90 origin-bottom-left text-[#ececec]/30 text-[7px] tracking-widest uppercase pointer-events-none">
                      MANTRA
                    </div>
                    <div className="absolute bottom-4 right-4 -rotate-90 origin-bottom-right text-[#ececec]/30 text-[7px] tracking-widest uppercase pointer-events-none">
                      CHROME
                    </div>
                  </div>
                </InlineEditableVideo>
              ) : (
                <div
                  onClick={() => (embedUrl ? setIsVideoOpen(true) : null)}
                  className="relative block w-full aspect-[21/9] bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden group cursor-pointer shadow-2xl"
                >
                  <Image
                    src={videoThumb}
                    alt="Secondary Video Cover"
                    fill
                    className="object-cover opacity-40 grayscale group-hover:opacity-70 group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-[#ececec]/70 group-hover:text-white transition-colors duration-300 stroke-1" />
                  </div>
                  <div className="absolute bottom-4 left-4 -rotate-90 origin-bottom-left text-[#ececec]/30 text-[7px] tracking-widest uppercase">
                    MANTRA
                  </div>
                  <div className="absolute bottom-4 right-4 -rotate-90 origin-bottom-right text-[#ececec]/30 text-[7px] tracking-widest uppercase">
                    CHROME
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-[#1f1f1f] bg-[#0a0a0a] py-3 overflow-hidden relative z-10">
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

      {/* ─────────────────────────────────────────
          5. DINAMIC RECOMMENDATION NEXT 1 EPISODE
      ───────────────────────────────────────── */}
      {recommendedEpisode &&
        (() => {
          const rawEpItems =
            recommendedEpisode.articles && recommendedEpisode.articles.length > 0
              ? recommendedEpisode.articles.map((art: any, idx: number) => ({
                  id: art.id,
                  slug: art.slug,
                  image: getAssetUrl(art.heroImage || art.images?.[0] || "/images/placeholder.jpg"),
                  title: art.name || art.articleTitle,
                  articleNo: art.articleNo || `00${idx + 1}`,
                }))
              : [];

          const epItems = [...rawEpItems].sort((a: any, b: any) =>
            (a.articleNo || "").localeCompare(b.articleNo || "", undefined, { numeric: true })
          );

          if (epItems.length === 0) return null;

          return (
            <section className="relative z-20 bg-[#050505] pt-24 pb-24 border-b border-[#1f1f1f]">
              <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
                <div className="flex justify-end items-end mb-12">
                  <div className="text-right">
                    <span className="text-[#ececec]/40 text-[9px] uppercase tracking-[0.3em] block mb-1">
                      NEXT EPISODE — {recommendedEpisode.episodeNo || "02"}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-light text-[#ececec] tracking-[0.2em] font-serif uppercase">
                      {recommendedEpisode.title}
                    </h2>
                  </div>
                </div>

                <div ref={recommendedGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {epItems.map((item: any) => (
                    <RecommendedArticleCard
                      key={item.id}
                      item={item}
                      isFocused={activeRecCardId === item.id}
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        })()}
    </div>
  );
}

function RecommendedArticleCard({
  item,
  isFocused = false,
}: {
  item: any;
  isFocused?: boolean;
}) {
  const isRealRecArt = Boolean(item?.id && !item.id.match(/^\d+$/));

  return (
    <div
      data-rec-card={item.id}
      className="relative group transition-all duration-300 ease-out"
    >
      <Link
        href={`/articles/${item.slug}`}
        className={`relative overflow-hidden rounded-2xl border border-transparent hover:border-[#1f1f1f] group aspect-[3/4] bg-black/30 block cursor-pointer transition-all duration-500 hover:-translate-y-2 ${
          isFocused ? "shadow-[0_0_35px_rgba(0,0,0,0.9)]" : ""
        }`}
      >
        {isRealRecArt ? (
          <InlineEditableImage
            type="article"
            id={item.id}
            field="heroImage"
            label="Article Photo"
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
          <div className="bg-black/85 backdrop-blur-md border border-[#1f1f1f] p-3.5 sm:p-4 rounded-xl shadow-xl pointer-events-auto">
            <div className="text-[#ececec]/60 text-[9px] uppercase tracking-widest mb-1">
              <span className="text-[#ececec] font-bold mr-1">+</span>
              {isRealRecArt ? (
                <InlineEditableText
                  type="article"
                  id={item.id}
                  field="articleNo"
                  label="Article Number"
                  value={item.articleNo}
                  as="span"
                >
                  <span>Article No.{item.articleNo}</span>
                </InlineEditableText>
              ) : (
                <span>Article No.{item.articleNo}</span>
              )}
            </div>

            <h3 className="text-[#ececec] text-sm font-light tracking-wide mb-1.5 sm:mb-2 truncate">
              {isRealRecArt ? (
                <InlineEditableText
                  type="article"
                  id={item.id}
                  field="name"
                  label="Article Title"
                  value={item.title}
                  as="span"
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
}