import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const PROJECT_FOLDERS = {
  0: 5,
  1: 2,
  2: 6,
  3: 4,
  4: 6,
  5: 6,
};

export default function LoadingScreen({ onLoadComplete }) {
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const totalAssets = Object.values(PROJECT_FOLDERS).reduce((a, b) => a + b, 0) * 2;
    let loaded = 0;

    const preloadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        // Set high resolution
        img.width = 1280;
        img.height = 720;
        
        img.onload = () => {
          // Force browser to keep in memory
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL()); // Cache in memory
        };
        img.onerror = () => resolve();
      });
    };

    const preloadVideo = (url) => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.autoplay = false;
        video.muted = true;
        video.src = url;
        
        video.onloadeddata = () => {
          // Force video preload
          video.play().then(() => {
            video.pause();
            video.currentTime = 0;
            resolve();
          }).catch(() => resolve());
        };
        
        video.onerror = () => resolve();
      });
    };

    const loadAssets = async () => {
      const promises = [];
      const cache = {};

      Object.entries(PROJECT_FOLDERS).forEach(([projectIndex, count]) => {
        for (let i = 0; i < count; i++) {
          const imageUrl = `/images/folder_${projectIndex}/${i}.webp`;
          const videoUrl = `/images/folder_${projectIndex}/${i}.mp4`;

          promises.push(
            preloadImage(imageUrl).then((dataUrl) => {
              if (dataUrl) cache[imageUrl] = dataUrl;
              loaded++;
              setProgress((loaded / totalAssets) * 100);
              setAssetsLoaded(loaded);
            })
          );

          promises.push(
            preloadVideo(videoUrl).then(() => {
              loaded++;
              setProgress((loaded / totalAssets) * 100);
              setAssetsLoaded(loaded);
            })
          );
        }
      });

      await Promise.all(promises);
      // Store cache in window for global access
      window.__assetCache = cache;
      onLoadComplete();
    };

    loadAssets();
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-4">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold">Loading</h2>
          <p className="text-gray-600">{Math.round(progress)}%</p>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}