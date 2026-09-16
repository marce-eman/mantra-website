import fs from "fs";
import path from "path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xcorxezfhjmncyxegrvi.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_2yaLa9FQgFmfQs2kQ320bA_qLPPmwEt";
const BUCKET_NAME = "site-assets";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const prisma = new PrismaClient();

const imagesDir = path.join(process.cwd(), "public", "images");

// Clean filename generator
function sanitizeFileName(filename: string): string {
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);
  
  let cleanName = nameWithoutExt
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
    
  if (cleanName === "pexels-wendelmoretti-1925630background-mata-untuk-jam") {
    cleanName = "background-mata-jam";
  } else if (cleanName === "bacground-jam1") {
    cleanName = "background-jam1";
  }
  
  return `${cleanName}.webp`;
}

async function ensureBucket() {
  console.log(`Ensuring bucket '${BUCKET_NAME}' via direct PostgreSQL connection...`);
  try {
    // 1. Insert bucket in storage.buckets
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('${BUCKET_NAME}', '${BUCKET_NAME}', true, 10485760, ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/jpg'])
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log(`Bucket '${BUCKET_NAME}' created / verified in storage.buckets!`);

    // 2. Ensure RLS policies for public select, insert, update
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE policyname = 'Public Access site-assets'
          ) THEN
            CREATE POLICY "Public Access site-assets" ON storage.objects FOR SELECT USING (bucket_id = '${BUCKET_NAME}');
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE policyname = 'Public Insert site-assets'
          ) THEN
            CREATE POLICY "Public Insert site-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = '${BUCKET_NAME}');
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE policyname = 'Public Update site-assets'
          ) THEN
            CREATE POLICY "Public Update site-assets" ON storage.objects FOR UPDATE USING (bucket_id = '${BUCKET_NAME}');
          END IF;
        END $$;
      `);
      console.log("Storage RLS policies verified successfully!");
    } catch (policyErr: any) {
      console.log("Policy check info:", policyErr.message);
    }
  } catch (err: any) {
    console.error("Error creating bucket via SQL:", err.message);
  }
}

async function migrateImages() {
  await ensureBucket();

  if (!fs.existsSync(imagesDir)) {
    console.error("public/images directory not found!");
    return;
  }

  const files = fs.readdirSync(imagesDir);
  const urlMap: Record<string, string> = {};

  console.log(`Found ${files.length} items in public/images. Starting compression & upload...`);

  for (const file of files) {
    const fullPath = path.join(imagesDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) continue;
    if (file.endsWith(".mp4")) {
      console.log(`Skipping video file: ${file}`);
      continue;
    }

    const ext = path.extname(file).toLowerCase();
    if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
      continue;
    }

    const originalSizeKb = Math.round(stat.size / 1024);
    const targetFileName = sanitizeFileName(file);

    console.log(`Processing '${file}' (${originalSizeKb} KB) -> '${targetFileName}'...`);

    try {
      // 1. Convert to WebP & resize if necessary (< 200KB target)
      let imagePipeline = sharp(fullPath);
      const metadata = await imagePipeline.metadata();

      if (metadata.width && metadata.width > 1920) {
        imagePipeline = imagePipeline.resize({ width: 1920, withoutEnlargement: true });
      }

      let webpBuffer = await imagePipeline
        .webp({ quality: 80, effort: 5 })
        .toBuffer();

      // If still over 200KB, apply stronger compression
      if (webpBuffer.length > 200 * 1024) {
        console.log(`  File is ${Math.round(webpBuffer.length / 1024)} KB, recompressing with q=72...`);
        webpBuffer = await sharp(fullPath)
          .resize({ width: Math.min(metadata.width || 1920, 1600), withoutEnlargement: true })
          .webp({ quality: 72, effort: 6 })
          .toBuffer();
      }

      const compressedSizeKb = Math.round(webpBuffer.length / 1024);
      console.log(`  Compressed size: ${compressedSizeKb} KB (${Math.round((1 - compressedSizeKb / originalSizeKb) * 100)}% reduction)`);

      // 2. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(targetFileName, webpBuffer, {
          contentType: "image/webp",
          upsert: true,
          cacheControl: "31536000",
        });

      if (uploadError) {
        console.error(`  Upload failed for ${targetFileName}:`, uploadError.message);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(targetFileName);

        const publicUrl = publicUrlData.publicUrl;
        console.log(`  Uploaded successfully: ${publicUrl}`);

        urlMap[`/images/${file}`] = publicUrl;
        urlMap[file] = publicUrl;
      }
    } catch (err: any) {
      console.error(`  Error processing ${file}:`, err.message);
    }
  }

  // 3. Write asset mapping file
  console.log("\nGenerating lib/assetUrls.ts...");
  const mappingContent = `// Auto-generated mapping of static images to Supabase Storage URLs
export const SUPABASE_ASSETS: Record<string, string> = ${JSON.stringify(urlMap, null, 2)};

export function getAssetUrl(pathOrName: string, fallback = "/images/placeholder.jpg"): string {
  if (!pathOrName) return fallback;
  if (pathOrName.startsWith("http://") || pathOrName.startsWith("https://")) {
    return pathOrName;
  }
  return SUPABASE_ASSETS[pathOrName] || SUPABASE_ASSETS[\`/images/\${pathOrName.replace(/^\\//, "")}\`] || pathOrName;
}
`;

  fs.writeFileSync(path.join(process.cwd(), "lib", "assetUrls.ts"), mappingContent, "utf-8");
  console.log("Created lib/assetUrls.ts successfully!");

  // 4. Update Database records
  console.log("\nSynchronizing database records to Supabase asset URLs...");

  // Helper to replace local url with supabase url
  const mapUrl = (val: string | null | undefined): string | null | undefined => {
    if (!val) return val;
    return urlMap[val] || urlMap[`/images/${val.replace(/^\/images\//, "")}`] || val;
  };

  const mapArray = (arr: string[] | undefined): string[] => {
    if (!arr) return [];
    return arr.map((item) => urlMap[item] || urlMap[`/images/${item.replace(/^\/images\//, "")}`] || item);
  };

  // Update Episodes
  const episodes = await prisma.episode.findMany();
  for (const ep of episodes) {
    const newHero = mapUrl(ep.heroImage);
    if (newHero && newHero !== ep.heroImage) {
      await prisma.episode.update({
        where: { id: ep.id },
        data: { heroImage: newHero },
      });
      console.log(`Updated Episode [${ep.episodeNo}] heroImage -> ${newHero}`);
    }
  }

  // Update Products / Articles
  const products = await prisma.product.findMany();
  for (const prod of products) {
    const newImages = mapArray(prod.images);
    const newHero = mapUrl(prod.heroImage);
    const newEditorial = mapUrl(prod.editorialImage);
    const newEditorialRight = mapUrl(prod.editorialImageRight);
    const newVideoThumb = mapUrl(prod.videoThumb);
    const newGallery = mapArray(prod.galleryImages);

    await prisma.product.update({
      where: { id: prod.id },
      data: {
        images: newImages,
        heroImage: newHero || undefined,
        editorialImage: newEditorial || undefined,
        editorialImageRight: newEditorialRight || undefined,
        videoThumb: newVideoThumb || undefined,
        galleryImages: newGallery,
      },
    });
    console.log(`Updated Product [${prod.slug}] images & media.`);
  }

  console.log("\nMigration completed successfully!");
}

migrateImages()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
