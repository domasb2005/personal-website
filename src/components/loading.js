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
    const totalAssets = Object.values(PROJECT_FOLDERS).reduce((a, b) => a + b, 0) * 2; // Both .webp and .mp4
    let loaded = 0;

    const preloadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Still resolve on error to continue loading
      });
    };

    const preloadVideo = (url) => {
      return new Promise((resolve) => {
        fetch(url, { method: 'HEAD' })
          .then(() => resolve())
          .catch(() => resolve()); // Still resolve on error
      });
    };

    const loadAssets = async () => {
      const promises = [];

      // Preload all project assets
      Object.entries(PROJECT_FOLDERS).forEach(([projectIndex, count]) => {
        for (let i = 0; i < count; i++) {
          const imageUrl = `/images/folder_${projectIndex}/${i}.webp`;
          const videoUrl = `/images/folder_${projectIndex}/${i}.mp4`;

          promises.push(
            preloadImage(imageUrl).then(() => {
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