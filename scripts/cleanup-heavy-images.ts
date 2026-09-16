import fs from "fs";
import path from "path";

const imagesDir = path.join(process.cwd(), "public", "images");

// Files to keep locally for favicon or tiny static fallback
const KEEP_FILES = new Set([
  "ICON CHROME 1.png",
  "WORDMARK CHROME 1.png",
]);

function cleanupImages() {
  if (!fs.existsSync(imagesDir)) {
    console.log("public/images directory does not exist.");
    return;
  }

  const files = fs.readdirSync(imagesDir);
  let deletedCount = 0;
  let savedBytes = 0;

  for (const file of files) {
    if (KEEP_FILES.has(file)) {
      console.log(`Preserving local file: ${file}`);
      continue;
    }

    const fullPath = path.join(imagesDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isFile()) {
      savedBytes += stat.size;
      fs.unlinkSync(fullPath);
      console.log(`Deleted raw asset: ${file} (${Math.round(stat.size / 1024)} KB)`);
      deletedCount++;
    }
  }

  console.log(`\nCleanup complete! Deleted ${deletedCount} heavy raw files.`);
  console.log(`Total bundle size saved: ${(savedBytes / (1024 * 1024)).toFixed(2)} MB`);
}

cleanupImages();
