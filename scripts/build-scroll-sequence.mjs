import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const videoPath = path.resolve("Real_estate_video_tour_1080p_20260918151312.mp4");
const outBase = path.resolve("public/sequence");
const desktopDir = path.join(outBase, "desktop");
const mobileDir = path.join(outBase, "mobile");
const photoDir = path.resolve("public/photography");

console.log("=== Mastiha Luxury Suites: Media Preparation Pipeline ===");

if (!fs.existsSync(videoPath)) {
  console.error(`Error: Video not found at ${videoPath}`);
  process.exit(1);
}

// Clean and create output directories
[desktopDir, mobileDir, photoDir].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

console.log("1. Inspecting source video...");
const probeRaw = execSync(
  `ffprobe -v error -show_entries stream=width,height,r_frame_rate,duration,nb_frames -of json "${videoPath}"`
).toString();
const probeData = JSON.parse(probeRaw);
const videoStream = probeData.streams.find((s) => s.width && s.height);
console.log(
  `   Dimensions: ${videoStream.width}x${videoStream.height}, Duration: ${videoStream.duration}s, Frame rate: ${videoStream.r_frame_rate}`
);

// High-resolution photography stills extraction (1920x1080)
console.log("2. Extracting high-resolution genuine property photography stills...");
const photoKeyframes = [
  { time: "00:00:00.600", name: "living-room.webp" },
  { time: "00:00:02.800", name: "master-bedroom.webp" },
  { time: "00:00:04.200", name: "second-bedroom.webp" },
  { time: "00:00:06.200", name: "bathroom.webp" },
  { time: "00:00:07.400", name: "terrace.webp" },
  { time: "00:00:07.400", name: "hero.webp" },
];

for (const photo of photoKeyframes) {
  const dest = path.join(photoDir, photo.name);
  execSync(
    `ffmpeg -y -ss ${photo.time} -i "${videoPath}" -frames:v 1 -c:v libwebp -quality 88 -lossless 0 "${dest}"`,
    { stdio: "pipe" }
  );
  const stat = fs.statSync(dest);
  console.log(`   Created ${photo.name}: ${(stat.size / 1024).toFixed(1)} KB`);
}

// Generate Poster Image for Scroll Sequence
const posterPath = path.join(outBase, "poster.webp");
execSync(
  `ffmpeg -y -ss 00:00:00.000 -i "${videoPath}" -frames:v 1 -vf "scale=1440:-1" -c:v libwebp -quality 82 "${posterPath}"`,
  { stdio: "pipe" }
);
console.log(`3. Created scroll sequence poster: ${(fs.statSync(posterPath).size / 1024).toFixed(1)} KB`);

// Extract Desktop sequence (15 fps over 8s = 120 frames at 1440px wide)
console.log("4. Encoding Desktop AVIF sequence (1440px, 15fps)...");
const tempDesktopDir = path.join(outBase, "temp_desktop");
fs.mkdirSync(tempDesktopDir, { recursive: true });

// Extract raw frames first for precise numbering
execSync(
  `ffmpeg -y -i "${videoPath}" -vf "fps=15,scale=1440:-1" -q:v 2 "${tempDesktopDir}/raw-%04d.png"`,
  { stdio: "pipe" }
);

const rawDesktopFiles = fs.readdirSync(tempDesktopDir).filter((f) => f.endsWith(".png")).sort();
console.log(`   Extracted ${rawDesktopFiles.length} raw desktop frames. Converting to AVIF...`);

let desktopTotalBytes = 0;
for (let i = 0; i < rawDesktopFiles.length; i++) {
  const src = path.join(tempDesktopDir, rawDesktopFiles[i]);
  const frameNum = String(i + 1).padStart(4, "0");
  const dest = path.join(desktopDir, `frame-${frameNum}.avif`);
  
  // Use SVT-AV1 with CRF 32 for optimal size/quality ratio
  execSync(
    `ffmpeg -y -i "${src}" -c:v libsvtav1 -crf 32 -pix_fmt yuv420p "${dest}"`,
    { stdio: "pipe" }
  );
  desktopTotalBytes += fs.statSync(dest).size;
}

// Clean temp directory
fs.rmSync(tempDesktopDir, { recursive: true, force: true });
console.log(`   Desktop AVIF Sequence Complete: ${rawDesktopFiles.length} frames, ${(desktopTotalBytes / (1024 * 1024)).toFixed(2)} MB total (avg ${(desktopTotalBytes / rawDesktopFiles.length / 1024).toFixed(1)} KB/frame)`);

// Extract Mobile sequence (10 fps over 8s = 80 frames at 864px wide)
console.log("5. Encoding Mobile AVIF sequence (864px, 10fps)...");
const tempMobileDir = path.join(outBase, "temp_mobile");
fs.mkdirSync(tempMobileDir, { recursive: true });

execSync(
  `ffmpeg -y -i "${videoPath}" -vf "fps=10,scale=864:-1" -q:v 2 "${tempMobileDir}/raw-%04d.png"`,
  { stdio: "pipe" }
);

const rawMobileFiles = fs.readdirSync(tempMobileDir).filter((f) => f.endsWith(".png")).sort();
console.log(`   Extracted ${rawMobileFiles.length} raw mobile frames. Converting to AVIF...`);

let mobileTotalBytes = 0;
for (let i = 0; i < rawMobileFiles.length; i++) {
  const src = path.join(tempMobileDir, rawMobileFiles[i]);
  const frameNum = String(i + 1).padStart(4, "0");
  const dest = path.join(mobileDir, `frame-${frameNum}.avif`);
  
  execSync(
    `ffmpeg -y -i "${src}" -c:v libsvtav1 -crf 34 -pix_fmt yuv420p "${dest}"`,
    { stdio: "pipe" }
  );
  mobileTotalBytes += fs.statSync(dest).size;
}

fs.rmSync(tempMobileDir, { recursive: true, force: true });
console.log(`   Mobile AVIF Sequence Complete: ${rawMobileFiles.length} frames, ${(mobileTotalBytes / (1024 * 1024)).toFixed(2)} MB total (avg ${(mobileTotalBytes / rawMobileFiles.length / 1024).toFixed(1)} KB/frame)`);

// Generate sequence manifest
console.log("6. Writing sequence-manifest.json...");
const manifest = {
  version: "1.0",
  aspectRatio: 16 / 9,
  poster: "/sequence/poster.webp",
  desktop: {
    frameCount: rawDesktopFiles.length,
    width: 1440,
    height: 810,
    format: "avif",
    basePath: "/sequence/desktop",
    filePattern: "frame-%04d.avif",
    totalBytes: desktopTotalBytes,
    avgFrameBytes: Math.round(desktopTotalBytes / rawDesktopFiles.length),
  },
  mobile: {
    frameCount: rawMobileFiles.length,
    width: 864,
    height: 486,
    format: "avif",
    basePath: "/sequence/mobile",
    filePattern: "frame-%04d.avif",
    totalBytes: mobileTotalBytes,
    avgFrameBytes: Math.round(mobileTotalBytes / rawMobileFiles.length),
  },
};

fs.writeFileSync(
  path.join(outBase, "sequence-manifest.json"),
  JSON.stringify(manifest, null, 2)
);

console.log("=== Media Pipeline Completed Successfully ===");
