const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../public/images');

const result = {};

// Scan the base directory
fs.readdirSync(baseDir).forEach(folder => {
  if (folder.startsWith('folder_')) {
    const folderPath = path.join(baseDir, folder);
    const files = fs.readdirSync(folderPath);
    
    // Group files by type
    const mediaFiles = {
      images: [],
      videos: []
    };
    
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.webp', '.png'].includes(ext)) {
        mediaFiles.images.push(file);
      } else if (['.mp4', '.webm'].includes(ext)) {
        mediaFiles.videos.push(file);
      }
    });
    
    // Extract folder index (e.g., "folder_0" -> "0")
    const folderIndex = folder.split('_')[1];
    result[folderIndex] = mediaFiles;
  }
});

// Write the result to a JSON file
fs.writeFileSync(
  path.join(__dirname, '../public/mediaMap.json'),
  JSON.stringify(result, null, 2)
);

console.log('✅ Media map generated.');