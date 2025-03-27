import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const PROJECT_FOLDERS = {
  0: 5,
  1: 2,
  2: 7,
  3: 4,
  4: 6,
  5: 6,
};

export default function LoadingScreen({ onLoadComplete }) {
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(0);
  const [mediaMap, setMediaMap] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log('🚀 Loading screen mounted');

    const fetchMediaMap = async () => {
      console.log('📡 Fetching media map...');
      try {
        const response = await fetch('/mediaMap.json');
        if (!response.ok) throw new Error('Failed to load media map');
        const data = await response.json();
        console.log('✅ Media map fetched successfully:', data);
        return data;
      } catch (error) {
        console.error('❌ Error loading media map:', error);
        return Object.fromEntries(
          Object.keys(PROJECT_FOLDERS).map(key => [key, { images: [], videos: [] }])
        );
      }
    };

    const preloadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.width = 1280;
        img.height = 720;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL());
        };
        img.onerror = () => {
          resolve(null);
        }
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
          video.play().then(() => {
            video.pause();
            video.currentTime = 0;
            resolve(true);
          }).catch((error) => {
            resolve(false);
          });
        };
        
        video.onerror = () => {
          resolve(false);
        }
      });
    };

    const loadAssets = async () => {
      console.log('🎬 Starting asset loading process');
      const map = await fetchMediaMap();
      setMediaMap(map);
      window.__mediaMap = map;
      
      const promises = [];
      const cache = {};
      let totalAssets = 0;
      let loaded = 0;
      
      Object.entries(map).forEach(([folderIndex, { images, videos }]) => {
        totalAssets += images.length + videos.length;
      });
      
      console.log(`📊 Total assets to load: ${totalAssets}`);
      
      if (totalAssets === 0) {
        console.warn('⚠️ No media assets found in the map');
        onLoadComplete();
        return;
      }
      
      Object.entries(map).forEach(([folderIndex, { images, videos }]) => {
        
        images.forEach(filename => {
          const imageUrl = `/images/folder_${folderIndex}/${filename}`;
          promises.push(
            preloadImage(imageUrl).then((dataUrl) => {
              if (dataUrl) cache[imageUrl] = dataUrl;
              loaded++;
              const currentProgress = (loaded / totalAssets) * 100;
              setProgress(currentProgress);
              setAssetsLoaded(loaded);
            })
          );
        });
        
        videos.forEach(filename => {
          const videoUrl = `/images/folder_${folderIndex}/${filename}`;
          promises.push(
            preloadVideo(videoUrl).then((success) => {
              loaded++;
              const currentProgress = (loaded / totalAssets) * 100;
              setProgress(currentProgress);
              setAssetsLoaded(loaded);
            })
          );
        });
      });

      console.log('⏳ Waiting for all assets to load...');
      await Promise.all(promises);
      window.__assetCache = cache;
      console.log('🎉 All assets loaded successfully!');
      console.log('💾 Cache size:', Object.keys(cache).length);
      onLoadComplete();
    };

    loadAssets();
    
    return () => {
      console.log('🧹 Cleaning up loading screen');
    };
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