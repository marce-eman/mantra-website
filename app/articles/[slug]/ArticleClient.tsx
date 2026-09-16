"use client";

import { useRef, useState } from "react";
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
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
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
    article?.storyIntro ||
    (isDummy
      ? "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit."
      : "");
  const leftBody =
    article?.storyLeft ||
    (isDummy
      ? "sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit."
      : "");
  const rightBody =
    article?.storyRight ||
    (isDummy
      ? "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
      : "");

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
      article?.editorialBody ||
      (isDummy
        ? "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dita sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur."
        : ""),
    bodyRight:
      article?.editorialBodyRight ||
      (isDummy
        ? "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
        : ""),
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
      value: nextGallery,
    });
  };

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

          <div className="flex justify-center items-center gap-8 mt-6">
            <button
              onClick={() => scrollCarousel("left")}
              className="text-[#111]/50 hover:text-[#111] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-[#111]"></span>
              <span className="w-2 h-2 rounded-full bg-[#111]/30"></span>
              <span className="w-2 h-2 rounded-full bg-[#111]/30"></span>
              <span className="w-2 h-2 rounded-full bg-[#111]/30"></span>
            </div>
            <button
              onClick={() => scrollCarousel("right")}
              className="text-[#111]/50 hover:text-[#111] transition-colors cursor-pointer"
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
          const epItems =
            recommendedEpisode.articles && recommendedEpisode.articles.length > 0
              ? recommendedEpisode.articles.map((art: any, idx: number) => ({
                  id: art.id,
                  slug: art.slug,
                  image: getAssetUrl(art.heroImage || art.images?.[0] || "/images/placeholder.jpg"),
                  title: art.name || art.articleTitle,
                  articleNo: art.articleNo || `00${idx + 1}`,
                }))
              : [];

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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {epItems.map((item: any) => {
                    const isRealRecArt = Boolean(item?.id && !item.id.match(/^\d+$/));

                    return (
                      <Link
                        key={item.id}
                        href={`/articles/${item.slug}`}
                        className="relative overflow-hidden rounded-2xl border border-[#1f1f1f]/80 group aspect-[3/4] bg-black/30 block cursor-pointer transition-all duration-500 hover:-translate-y-2"
                      >
                        {isRealRecArt ? (
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
                              className="object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 rounded-2xl"
                            />
                          </InlineEditableImage>
                        ) : (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 rounded-2xl"
                          />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl z-10 pointer-events-none" />

                        <div className="absolute bottom-6 left-4 right-4 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-20 pointer-events-none">
                          <div className="bg-black/80 backdrop-blur-md border border-[#1f1f1f] p-4 rounded-xl shadow-xl pointer-events-auto">
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

                            <h3 className="text-[#ececec] text-sm font-light tracking-wide mb-2 truncate">
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
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })()}
    </div>
  );
}