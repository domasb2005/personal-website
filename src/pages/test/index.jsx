import Image from 'next/image';
import gsap from 'gsap';
import { useRef, useEffect, useState } from 'react';

const PROJECT_FOLDERS = {
  0: 5,
  1: 2,
  2: 6,
  3: 4,
  4: 6,
  5: 6,
};

const TOTAL_PROJECTS = Object.keys(PROJECT_FOLDERS).length;

export default function Gallery() {
  const [fileTypesByFolder, setFileTypesByFolder] = useState({});

  useEffect(() => {
    const checkTypes = async () => {
      const result = {};
      await Promise.all(
        Object.entries(PROJECT_FOLDERS).map(async ([folderIndex, count]) => {
          result[folderIndex] = [];
          for (let i = 0; i < count; i++) {
            try {
              const response = await fetch(`/images/folder_${folderIndex}/${i}.mp4`, { method: 'HEAD' });
              result[folderIndex][i] = response.ok ? 'video' : 'image';
            } catch {
              result[folderIndex][i] = 'image';
            }
          }
        })
      );
      setFileTypesByFolder(result);
    };

    checkTypes();
  }, []);

  useEffect(() => {
    // Animate images on load
    const images = document.querySelectorAll('.image');
    gsap.fromTo(
      images,
      { y: '60vh', opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out',
      }
    );
  }, [fileTypesByFolder]);

  return (
    <div className="bg-bg-100 min-h-screen p-8 grid grid-cols-4 gap-x-4 gap-y-12">
      {[...Array(TOTAL_PROJECTS)].map((_, folderIndex) => (
        <div key={folderIndex} className="col-span-2 flex flex-col gap-y-4">
          {[...Array(PROJECT_FOLDERS[folderIndex])].map((_, fileIndex) => {
            const type = fileTypesByFolder?.[folderIndex]?.[fileIndex] || 'image';
            const src = `/images/folder_${folderIndex}/${fileIndex}.${type === 'video' ? 'mp4' : 'webp'}`;

            return (
              <div key={fileIndex} className="image relative overflow-hidden">
                {type === 'video' ? (
                  <video
                    src={src}
                    className="w-full object-contain"
                    style={{ height: 'auto' }}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <Image
                    src={src}
                    alt={`Image ${fileIndex} from project ${folderIndex}`}
                    width={1000}
                    height={600}
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}