import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sizes for different favicon versions
const sizes = [
  16, 32, 48, 64, 128, 192, 256, 512
];

// Ensure the favicon directory exists
const faviconDir = path.join(__dirname, '../public/favicon');
if (!fs.existsSync(faviconDir)) {
  fs.mkdirSync(faviconDir, { recursive: true });
}

// Path to the source SVG file
const svgPath = path.join(faviconDir, 'favicon.svg');

// Read SVG file
const svgContent = fs.readFileSync(svgPath);

async function generateFavicons() {
  console.log('Generating favicon PNG files...');
  
  // Generate PNG files for each size
  for (const size of sizes) {
    const outputPath = path.join(faviconDir, `favicon-${size}x${size}.png`);
    
    await sharp(svgContent)
      .resize(size, size)
      .png()
      .toFile(outputPath);
      
    console.log(`Generated ${outputPath}`);
  }
  
  // Create special files with standard names
  await sharp(svgContent)
    .resize(192, 192)
    .png()
    .toFile(path.join(faviconDir, 'android-chrome-192x192.png'));
    
  await sharp(svgContent)
    .resize(512, 512)
    .png()
    .toFile(path.join(faviconDir, 'android-chrome-512x512.png'));
    
  await sharp(svgContent)
    .resize(180, 180)
    .png()
    .toFile(path.join(faviconDir, 'apple-touch-icon.png'));
    
  await sharp(svgContent)
    .resize(16, 16)
    .png()
    .toFile(path.join(faviconDir, 'favicon-16x16.png'));
    
  await sharp(svgContent)
    .resize(32, 32)
    .png()
    .toFile(path.join(faviconDir, 'favicon-32x32.png'));
    
  console.log('Favicon generation complete!');
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
}); 