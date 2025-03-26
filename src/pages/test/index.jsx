'use client';

import { useContext, useRef, useEffect, useState } from 'react';
import { TransitionContext } from '@/context/TransitionContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import Lenis from '@studio-freight/lenis';
import { ANIMATION_DURATION } from '@/constants/animation';


const PROJECT_COUNT = 6;
const PROJECT_FOLDERS = {
  0: 5,
  1: 2,
  2: 6,
  3: 4,
  4: 6,
  5: 6,
};

const PROJECT_NAMES = ['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'];

export default function Home() {
  const { timeline } = useContext(TransitionContext);
  const container = useRef(null);
  const sectionRefs = useRef([]);
  const lenisRef = useRef(null);

  const [fileTypes, setFileTypes] = useState({});
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    lenisRef.current = new Lenis();
    function raf(time) {
      lenisRef.current.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenisRef.current?.destroy();
  }, []);

  useEffect(() => {
    const types = {};
    Object.entries(PROJECT_FOLDERS).forEach(([projectIndex, count]) => {
      for (let i = 0; i < count; i++) {
        const videoUrl = `/images/folder_${projectIndex}/${i}.mp4`;
        const key = `${projectIndex}-${i}`;
        fetch(videoUrl, { method: 'HEAD' })
          .then(res => {
            types[key] = res.ok ? 'video' : 'image';
            setFileTypes(prev => ({ ...prev, [key]: types[key] }));
          })
          .catch(() => {
            types[key] = 'image';
            setFileTypes(prev => ({ ...prev, [key]: 'image' }));
          });
      }
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const projectElements = Array.from(document.querySelectorAll('.projectMedia'))
        .filter(el => el.offsetParent !== null);
      const middleY = window.innerHeight * 0.45;

      projectElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= middleY && rect.bottom >= middleY) {
          setActiveProjectIndex(index);
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToProject = (index) => {
    const el = sectionRefs.current[index];
    if (el && lenisRef.current) {
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY + rect.top - window.innerHeight * 0.449;
      lenisRef.current.scrollTo(scrollY, { duration: 1.2 });
    }
  };

  // Add these state variables after the existing useState declarations
  const [loadedAssets, setLoadedAssets] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);

  // Modify the useEffect that handles file types
  useEffect(() => {
    const types = {};
    let total = 0;
    let loaded = 0;

    // Calculate total assets
    Object.entries(PROJECT_FOLDERS).forEach(([_, count]) => {
      total += count;
    });
    setTotalAssets(total);

    // Check each asset
    Object.entries(PROJECT_FOLDERS).forEach(([projectIndex, count]) => {
      for (let i = 0; i < count; i++) {
        const videoUrl = `/images/folder_${projectIndex}/${i}.mp4`;
        const imageUrl = `/images/folder_${projectIndex}/${i}.webp`;
        const key = `${projectIndex}-${i}`;

        fetch(videoUrl, { method: 'HEAD' })
          .then(res => {
            types[key] = res.ok ? 'video' : 'image';
            setFileTypes(prev => ({ ...prev, [key]: types[key] }));
            loaded++;
            setLoadedAssets(loaded);
            console.log(`Loading progress: ${loaded}/${total} assets`);
          })
          .catch(() => {
            types[key] = 'image';
            setFileTypes(prev => ({ ...prev, [key]: 'image' }));
            loaded++;
            setLoadedAssets(loaded);
            console.log(`Loading progress: ${loaded}/${total} assets`);
          });
      }
    });
  }, []);

  // Add this after the imports to track individual media loading
  const onMediaLoad = () => {
    setLoadedAssets(prev => {
      const newCount = prev + 1;
      console.log(`Media loaded: ${newCount}/${totalAssets}`);
      return newCount;
    });
  };

  // Modify the getMediaType function to add onLoad handlers
  const getMediaType = (index, i) => {
    const key = `${index}-${i}`;
    const type = fileTypes[key];
    const videoPath = `/images/folder_${index}/${i}.mp4`;
    const imagePath = `/images/folder_${index}/${i}.webp`;

    if (!type) return null;

    return type === 'video' ? (
      <video
        key={`v-${index}-${i}`}
        className="w-full object-contain photo"
        style={{ height: 'auto' }}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={onMediaLoad}
      >
        <source src={videoPath} type="video/mp4" />
      </video>
    ) : (
      <Image
        key={`img-${index}-${i}`}
        src={imagePath}
        alt={`Image ${i} from project ${index}`}
        width={1920}
        height={1080}
        className="w-full object-contain photo"
        style={{ height: 'auto' }}
        onLoad={onMediaLoad}
      />
    );
  };

  useGSAP(() => {
  
    setTimeout(() => {
      const mediaItems = gsap.utils.toArray('.photo');
      console.log('⏱️ Media items after delay:', mediaItems);
  
      if (!mediaItems.length) {
        console.warn('🚫 No media items found even after delay');
        return;
      }
  
      // Entry animation – slide in from below
      gsap.fromTo(
        mediaItems,
        { y: '100vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: ANIMATION_DURATION.xlong,  // Changed from 1 to short duration
          ease: 'power2.out',
          stagger: 0.03
        }
      );
  
      // Exit animation – fade out
      timeline.add(
        gsap.to(mediaItems, {
          opacity: 0,
          duration: ANIMATION_DURATION.short,  // Changed from 0.8 to short duration
          ease: 'power1.out'
        })
      );
    }, 1000); 
  }, { scope: container });  

  return (
    <>
      <div ref={container} className="fixed top-0">
        <div className="h-[100dvh] w-[100dvw] fixed top-0 pt-[45dvh] p-[2rem] grid auto-cols-fr gap-4"
          style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
          
          {/* Mobile project names */}
          <div className="md:hidden h-full relative"
            style={{ gridColumnStart: 16, gridColumnEnd: 17 }}>
            <div className="whitespace-nowrap absolute bottom-0 right-0 flex justify-end gap-4">
              <div
                className="w-3 h-3 mt-3"
                style={{
                  backgroundColor: 'var(--color-black)',
                  clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)',
                  transform: `translateY(calc(${activeProjectIndex} * 2.5rem))`,
                  transition: 'transform 0.2s ease-out'
                }}
              />
              <div>
                {PROJECT_NAMES.map((name, i) => (
                  <h2
                    key={i}
                    className={`small-text !leading-[2.5rem] block text-right ${
                      activeProjectIndex === i || hoveredIndex === i ? 'opacity-[1]' : 'opacity-[0.32]'
                    }`}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => scrollToProject(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    {name}
                  </h2>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop project names */}
          <div className="hidden md:block"
            style={{ gridColumnStart: 6, gridColumnEnd: 8 }}>
            <div className="whitespace-nowrap flex justify-between">
              <div className="text-left">
                {PROJECT_NAMES.map((name, i) => (
                  <h2
                    key={i}
                    className={`small-text !leading-[1.8rem] ${
                      activeProjectIndex === i || hoveredIndex === i ? 'opacity-[1]' : 'opacity-[0.32]'
                    }`}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => scrollToProject(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    {name}
                  </h2>
                ))}
              </div>
              <div
                className="w-3 h-3 ml-8 mt-2"
                style={{
                  backgroundColor: 'var(--color-black)',
                  clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)',
                  transform: `translateY(calc(${activeProjectIndex} * 1.8rem))`,
                  transition: 'transform 0.2s ease-out'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mt-[calc(45dvh-2rem)]">
        {/* Mobile Grid */}
        <div
          className="w-[100dvw] p-[2rem] grid md:hidden gap-y-[10dvh] gap-x-4"
          style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
        >
          {[...Array(PROJECT_COUNT)].map((_, index) => (
            <div
              key={index}
              ref={el => sectionRefs.current[index] = el}
              className="bg-red-500 h-full projectMedia flex flex-col gap-4"
              style={{ gridColumn: '1 / 12' }}
            >
              {[...Array(PROJECT_FOLDERS[index])].map((_, i) => (
                <div key={i} className="w-full">
                  {getMediaType(index, i)}
                </div>
              ))}
            </div>
          ))}
        </div>

{/* Desktop Grid */}
<div
  className="w-[100dvw] hidden md:grid p-[2rem] gap-y-[10dvh] gap-x-4"
  style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
>
  {[...Array(PROJECT_COUNT)].map((_, index) => (
    <div
      key={index}
      ref={el => sectionRefs.current[index] = el}
      className="projectMedia bg-red-500 h-auto grid gap-4"
      style={{
        gridColumn: '1 / 5',
        gridTemplateColumns: 'repeat(4, 1fr)',
      }}
    >
      <span className="col-span-2 text-white p-2">Project {index + 1}</span>
      <div className="bg-green-500 col-start-3 col-span-2 flex flex-col gap-4">
        {[...Array(PROJECT_FOLDERS[index])].map((_, i) => (
          <div key={i} className="w-full">
            {getMediaType(index, i)}
          </div>
        ))}
      </div>
    </div>
  ))}
</div>      </div>
    </>
  );
}