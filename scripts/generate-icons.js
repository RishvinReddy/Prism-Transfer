const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputImagePath = path.join(__dirname, '../image.png');
const publicDir = path.join(__dirname, '../public');

async function generateIcons() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Copy to public/logo.png for generic use
  fs.copyFileSync(inputImagePath, path.join(publicDir, 'logo.png'));
  
  // Generate 192x192
  await sharp(inputImagePath)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(path.join(publicDir, 'icon-192x192.png'));
    
  // Generate 512x512
  await sharp(inputImagePath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(path.join(publicDir, 'icon-512x512.png'));

  // Generate 180x180 for Apple Touch Icon
  await sharp(inputImagePath)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Generate 32x32 for favicon.ico (We can just use a 32x32 png, Next.js app router supports src/app/icon.png)
  await sharp(inputImagePath)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(path.join(__dirname, '../src/app/icon.png'));
    
  // If there's an existing favicon.ico, we can remove it so Next.js uses icon.png
  const oldFavicon = path.join(__dirname, '../src/app/favicon.ico');
  if (fs.existsSync(oldFavicon)) {
    fs.unlinkSync(oldFavicon);
  }

  console.log('Icons generated successfully.');
}

generateIcons().catch(console.error);
