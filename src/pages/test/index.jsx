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
  2: 7,
  3: 4,
  4: 6,
  5: 6,
};

const PROJECT_NAMES = ['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'];
const PROJECT_DESCRIPTIONS = [
  "A landing page for tutoring maths.",
  "A landing page for a hackhaton startup.",
  "An Android app that uses AI to generate events in your calendar from selected text.",
  "An interactive nuclear power plant control room simulator for the Energy and Technology Museum. My work involved programming microcontrollers, wiring them with buttons, switches, display modules, and motors, and integrating everything into a Debian system.",
  "A Tesla coil designed to be harmless to touch, low-noise, and long-lasting for the Energy and Technology Museum. It features a dual-resonant solid-state design and was fine-tuned by hand.",
  "A racing minigame for the Energy and Technology Museum using remote-controlled cars and a first-person video feed. Built with custom circuit boards and real-time control over wifi."
];

const PROJECT_LINKS = [
  "https://example.com/algebra",
  "https://example.com/urbanear",
  "https://github.com/domasb2005/eventAI",
  null,
  null,
  null
];

export default function Home() {
  const { timeline } = useContext(TransitionContext);
  const container = useRef(null);
  const sectionRefs = useRef([]); // Keep this for desktop
  const mobileSectionRefs = useRef([]); // Add this for mobile
  const lenisRef = useRef(null);

  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [previewImage, setPreviewImage] = useState({
    src: '/images/folder_0/0-min.jpg',
    type: 'image'
  });
  const [descriptionIndex, setDescriptionIndex] = useState(0);

  const lastScrollY = useRef(0);
  const [scrollDirection, setScrollDirection] = useState(0);

useEffect(() => {
  const handleScrollDirection = () => {
    const currentScrollY = window.scrollY;
    setScrollDirection(currentScrollY > lastScrollY.current ? 1 : -1);
    lastScrollY.current = currentScrollY;
  };

  window.addEventListener('scroll', handleScrollDirection);
  return () => window.removeEventListener('scroll', handleScrollDirection);
}, []);

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
    const handleScroll = () => {
      const projectElements = Array.from(document.querySelectorAll('.projectMedia')).filter(el => el.offsetParent !== null);
      const middleY = window.innerHeight * 0.45;

      projectElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= middleY && rect.bottom >= middleY) {
          setActiveProjectIndex(index);
          setDescriptionIndex(index);

          // Get all media elements in the current project section
          const mediaElements = el.querySelectorAll('img, video');

          // Find the media element that most recently crossed the middle line
          let recentlyCrossedMedia = null;
          let smallestDistance = Infinity;

          mediaElements.forEach(media => {
            const mediaRect = media.getBoundingClientRect();
            const distanceFromMiddle = Math.abs(mediaRect.top - middleY);

            if (mediaRect.top <= middleY && distanceFromMiddle < smallestDistance) {
              smallestDistance = distanceFromMiddle;
              recentlyCrossedMedia = media;
            }
          });

          if (recentlyCrossedMedia) {
            const isVideo = recentlyCrossedMedia.tagName.toLowerCase() === 'video';
            const mediaIndex = Array.from(mediaElements).indexOf(recentlyCrossedMedia);
            
            // Use the media map to get the correct file path
            if (typeof window !== 'undefined' && window.__mediaMap) {
              const mediaMap = window.__mediaMap;
              const folderMedia = mediaMap[index] || { images: [], videos: [] };
              
              if (isVideo) {
                // Find the actual video file that matches this index
                const matchingVideos = folderMedia.videos?.filter(filename => 
                  filename.startsWith(`${mediaIndex}-min.`) || filename === `${mediaIndex}.mp4`
                );
                
                if (matchingVideos && matchingVideos.length > 0) {
                  setPreviewImage({
                    src: `/images/folder_${index}/${matchingVideos[0]}`,
                    type: 'video'
                  });
                } else {
                  console.warn(`No matching video found for project ${index}, media ${mediaIndex}`);
                }
              } else {
                // Find the actual image file that matches this index
                const matchingImages = folderMedia.images?.filter(filename => 
                  filename.startsWith(`${mediaIndex}-min.`) || filename === `${mediaIndex}.jpg` || filename === `${mediaIndex}.png`
                );
                
                if (matchingImages && matchingImages.length > 0) {
                  setPreviewImage({
                    src: `/images/folder_${index}/${matchingImages[0]}`,
                    type: 'image'
                  });
                } else {
                  console.warn(`No matching image found for project ${index}, media ${mediaIndex}`);
                }
              }
            } else {
              // Fallback to original behavior if media map is not available
              setPreviewImage({
                src: isVideo ?
                  `/images/folder_${index}/${mediaIndex}-min.mp4` :
                  `/images/folder_${index}/${mediaIndex}-min.jpg`,
                type: isVideo ? 'video' : 'image'
              });
            }
          }
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToProject = (index) => {
    const isMobile = window.innerWidth < 768;
    const el = isMobile ? mobileSectionRefs.current[index] : sectionRefs.current[index];
    console.log('🎯 Scroll triggered for index:', index, 'isMobile:', isMobile);
    console.log('📍 Target element:', el);
    console.log('🛹 Lenis instance:', lenisRef.current);

    // Add new debug logs for element state
    console.log('🔍 Element Details:', {
      display: window.getComputedStyle(el).display,
      visibility: window.getComputedStyle(el).visibility,
      height: window.getComputedStyle(el).height,
      offsetParent: el.offsetParent,
      offsetTop: el.offsetTop,
      offsetHeight: el.offsetHeight,
      classList: Array.from(el.classList)
    });

    if (el && lenisRef.current) {
      const rect = el.getBoundingClientRect();
      const offset = window.innerHeight * 0.449;
      const scrollY = window.scrollY + rect.top - offset;

      // Keep existing debug logs
      console.log('📊 Scroll Calculation:', {
        'Element top position (rect.top)': rect.top,
        'Current scroll position (window.scrollY)': window.scrollY,
        'Window height': window.innerHeight,
        'Offset calculation (windowHeight * 0.449)': offset,
        'Final calculation': {
          'scrollY + rect.top': window.scrollY + rect.top,
          'minus offset': `${window.scrollY + rect.top} - ${offset} = ${scrollY}`
        },
        isMobile: window.innerWidth < 768
      });

      // Add new layout debug logs
      console.log('📐 Layout Metrics:', {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        elementPosition: {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          width: rect.width
        },
        isHidden: rect.height === 0 || rect.width === 0
      });

      lenisRef.current.scrollTo(scrollY, {
        duration: 1.2,
        onComplete: () => console.log('✅ Scroll animation completed')
      });
    } else {
      console.error('❌ Scroll failed:', {
        hasElement: !!el,
        hasLenis: !!lenisRef.current,
        refs: sectionRefs.current
      });
    }
  };

  const onMediaLoad = () => {
    // console.log('Media loaded');
  };

  useEffect(() => {
    // ScrollTrigger logic for scroll bar
    const updateProgressBar = () => {
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const scrolled = window.scrollY;
      const progress = scrolled / (fullHeight - windowHeight);

      gsap.set(".progress-bar", {
        scaleY: Math.min(progress, 1), // clamp to max 1
      });
    };

    // Initial update
    updateProgressBar();

    // Listen to scroll and resize
    window.addEventListener('scroll', updateProgressBar);
    window.addEventListener('resize', updateProgressBar);

    return () => {
      window.removeEventListener('scroll', updateProgressBar);
      window.removeEventListener('resize', updateProgressBar);
    };
  }, []);

  // Import useEffect at the top of the file (already there)
  
  // Add this state to track if media map is loaded
  const [mediaMapLoaded, setMediaMapLoaded] = useState(false);
  
  // Add this effect to load the media map
  useEffect(() => {
    // Fetch the media map if it's not already in window
    if (typeof window !== 'undefined' && !window.__mediaMap) {
      fetch('/mediaMap.json')
        .then(response => {
          if (!response.ok) throw new Error('Failed to load media map');
          return response.json();
        })
        .then(data => {
          window.__mediaMap = data;
          setMediaMapLoaded(true);
          console.log('📦 Media map loaded:', data);
        })
        .catch(error => {
          console.error('❌ Error loading media map:', error);
          // Create empty map as fallback
          window.__mediaMap = Object.fromEntries(
            Object.keys(PROJECT_FOLDERS).map(key => [key, { images: [], videos: [] }])
          );
          setMediaMapLoaded(true);
        });
    } else if (typeof window !== 'undefined' && window.__mediaMap) {
      setMediaMapLoaded(true);
    }
  }, []);

  // The function is named getMediaElement
  const getMediaElement = (index, i) => {
    if (typeof window === 'undefined' || !window.__mediaMap) return null;
  
    const mediaMap = window.__mediaMap;
    const folderMedia = mediaMap[index] || { images: [], videos: [] };
  
    const matchingImage = folderMedia.images.find(filename =>
      filename.startsWith(`${i}-min.`) || filename === `${i}.jpg` || filename === `${i}.png`
    );
  
    const matchingVideo = folderMedia.videos.find(filename =>
      filename.startsWith(`${i}-min.`) || filename === `${i}.mp4`
    );
  
    if (matchingVideo) {
      return (
        <video
          key={`video-${index}-${i}`}
          src={`/images/folder_${index}/${matchingVideo}`}
          autoPlay
          loop
          muted
          playsInline
          className="w-full object-contain photo"
          style={{ height: 'auto' }}
          onLoadedData={onMediaLoad}
        />
      );
    }
  
    if (matchingImage) {
      return (
        <Image
          key={`img-${index}-${i}`}
          src={`/images/folder_${index}/${matchingImage}`}
          alt={`Image ${i} from project ${index}`}
          width={1280}
          height={720}
          priority={index === 0}
          loading="eager"
          className="w-full object-contain photo"
          style={{ height: 'auto' }}
          onLoad={onMediaLoad}
        />
      );
    }
  
    return null; // Strict: don't return anything if it's not in the map
  };  // Add this useEffect for the number animation
  // Add this state at the top of your component with other states
  const [raisedNumbers, setRaisedNumbers] = useState(new Set());
  
  // Modify the animation logic
  useEffect(() => {
    const handleNumberAnimation = () => {
      const numberElements = document.querySelectorAll('.number-text');
      
      numberElements.forEach((el, index) => {
        // Skip if already animated
        if (raisedNumbers.has(index)) {
          console.log(`⏭️ Skipping animation for ${index} - already raised`);
          return;
        }
  
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementPositionDVH = (rect.top / viewportHeight) * 100;
        
        const numholdElement = document.querySelector(`.numhold${index}`);
        const firstNumber = numholdElement?.querySelector('.number1');
        const secondNumber = numholdElement?.querySelector('.number2');
  
        if (elementPositionDVH >= 58 && elementPositionDVH <= 62 && scrollDirection === 1) {
          console.log(`🎬 Attempting animation UP for element ${index}`);
          if (firstNumber && secondNumber) {
            // Mark this index as raised before starting animation
            setRaisedNumbers(prev => new Set([...prev, index]));
            
            gsap.to(firstNumber, {
              y: '-10dvh',
              duration: 0.4,
              ease: 'power2.out',
              onStart: () => console.log(`✨ Started first number animation for ${index}`),
              onComplete: () => console.log(`✅ Completed first number animation for ${index}`),
            });
      
            gsap.to(secondNumber, {
              y: '-10dvh',
              duration: 0.4,
              delay: 0.1,
              ease: 'power2.out',
              onStart: () => console.log(`✨ Started second number animation for ${index}`),
              onComplete: () => console.log(`✅ Completed second number animation for ${index}`),
            });
          }
        }
      });
    };
  
    window.addEventListener('scroll', handleNumberAnimation);
    return () => window.removeEventListener('scroll', handleNumberAnimation);
  }, [scrollDirection, raisedNumbers]); // Add raisedNumbers to dependencies


  

  useGSAP(() => {
    if (!mediaMapLoaded) return;

    setTimeout(() => {
      const mediaItems = gsap.utils.toArray('.photo');
      const projectTitles = gsap.utils.toArray('h2.small-text');

      if (!mediaItems.length) {
        console.warn('🚫 No media items found even after delay');
        return;
      }

      // Entry animation – slide in from below
      gsap.fromTo(
        mediaItems,
        { y: '100vh', autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: ANIMATION_DURATION.xlong,
          ease: 'power2.out',
          stagger: 0.03
        }
      );


      timeline.add(
        gsap.to(mediaItems, {
          opacity: 0,
          duration: ANIMATION_DURATION.short,
          ease: 'power1.out'
        })
      );

      // Also add project titles to exit animation
      timeline.add(
        gsap.to(projectTitles, {
          opacity: 1,
          duration: ANIMATION_DURATION.short,
          ease: 'power1.out'
        }),
        "<" // Start at the same time as the previous animation
      );
    }, 1);
  }, { scope: container });

  return (
    <>
      {/* Progress Bar */}
      <div className="progress-bar fixed top-0 left-0 md:left-auto md:right-0 w-[8px] h-[100dvh] bg-[var(--color-black)] origin-top z-50" style={{ transform: 'scaleY(0)' }} />
  
      {/* FIXED OVERLAY - Titles and Indicator */}
      <div ref={container} className="fixed top-0">
        <div className="h-[100dvh] w-[100dvw] fixed top-0 pt-[45dvh] p-[2rem] grid auto-cols-fr gap-4" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
          {/* Mobile Titles */}
          <div className="md:hidden h-full relative" style={{ gridColumnStart: 16, gridColumnEnd: 17 }}>
            <div className="whitespace-nowrap absolute bottom-0 right-0 flex justify-end gap-4">
              <div
                className="w-3 h-3 mt-1.5"
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
                    className={`small-text pb-[0.9rem] block text-right ${activeProjectIndex === i || hoveredIndex === i ? 'opacity-[1]' : 'opacity-[0.32]'}`}
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
  
          {/* Desktop Titles */}
          <div className="hidden md:block" style={{ gridColumnStart: 6, gridColumnEnd: 8 }}>
            <div className="whitespace-nowrap flex justify-between">
              <div className="text-left z-[40]">
                {PROJECT_NAMES.map((name, i) => (
                  <h2
                    key={i}
                    className={`small-text pb-[0.2rem] ${activeProjectIndex === i || hoveredIndex === i ? 'opacity-[1]' : 'opacity-[0.32]'}`}
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
                className="w-3 h-3 ml-8 mt-1"
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
  
      {/* FIXED OVERLAY - Preview + Description */}
      <div className="hidden md:grid pointer-events-none fixed top-0 left-0 w-[100dvw] h-[100dvh] p-[2rem] gap-4 z-[5]" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
        <div className="h-[70dvh] absolute bottom-[2rem] right-[0]" style={{ gridColumn: '9 / span 8' }}>
          <div className="w-full h-full flex items-end justify-end">
            {previewImage?.type === 'video' ? (
              <video
                src={previewImage.src}
                className="h-full object-contain"
                style={{ maxWidth: '100%', objectPosition: 'right bottom' }}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                src={previewImage.src}
                alt="Current preview"
                width={1280}
                height={720}
                className="object-contain"
                style={{ width: 'auto', height: '100%', objectPosition: 'right bottom' }}
              />
            )}
          </div>
        </div>
  
        <div className="small-text pointer-events-auto flex justify-between" style={{ gridColumn: '9 / span 8' }}>
          <span className="overflow-hidden">
            <p id="description">{PROJECT_DESCRIPTIONS[descriptionIndex]}</p>
          </span>
          {PROJECT_LINKS[descriptionIndex] && (
            <span className="overflow-hidden">
              <a
                href={PROJECT_LINKS[descriptionIndex]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center group"
              >
                Visit
                <span className="svg-wrapper ml-2 relative my-[1px] w-[10px] h-[10px] overflow-hidden inline-block">
                  <span className="block w-full transition-transform duration-500 ease-out delay-100 group-hover:translate-x-full group-hover:-translate-y-full group-hover:delay-0">
                    <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M3 0H10V7L7.12208 4.12208L1.06066 10.1835L0 9.12284L6.06142 3.06142L3 0Z" fill="var(--color-black)" />
                    </svg>
                  </span>
                  <span className="absolute block top-0 left-0 w-full -translate-x-full translate-y-full transition-transform duration-500 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:delay-100">
                    <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M3 0H10V7L7.12208 4.12208L1.06066 10.1835L0 9.12284L6.06142 3.06142L3 0Z" fill="var(--color-black)" />
                    </svg>
                  </span>
                </span>
              </a>
            </span>
          )}
        </div>
      </div>
  
      {/* MAIN SCROLLABLE SECTION */}
      <div className="mt-[calc(45dvh-2rem)] z-[60]">
        {/* Mobile Version */}
        <div className="w-[100dvw] p-[2rem] grid md:hidden gap-y-[10dvh] gap-x-4" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
          {[...Array(PROJECT_COUNT)].map((_, index) => (
            <div
              key={index}
              ref={el => mobileSectionRefs.current[index] = el}
              className="bg-red-500 h-full projectMedia flex flex-col gap-4"
              style={{ gridColumn: '1 / 12' }}
            >
              {[...Array(PROJECT_FOLDERS[index])].map((_, i) => (
                <div key={i} className="w-full">
                  {getMediaElement(index, i)}
                </div>
              ))}
            </div>
          ))}
        </div>
  
        {/* Desktop Version */}
        <div className="w-[100dvw] hidden md:grid p-[2rem] gap-y-[10dvh] gap-x-4" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
        {[...Array(PROJECT_COUNT)].map((_, index) => (
          <div
            key={index}
            ref={el => sectionRefs.current[index] = el}
            className="projectMedia h-auto grid gap-4"
            style={{
              gridColumn: '1 / 5',
              gridTemplateColumns: 'repeat(4, 1fr)',
            }}
          >
            {/* Numbers container */}
            <div className="col-span-2 min-h-[30dvh]"> {/* Increased height to ensure sticky behavior */}
              <div className={`sticky number-text numhold${index} ${index === 0 ? 'top-[45dvh]' : 'top-[55dvh]'}`}>
                  <span className="number1 inline-block">0</span>
                  <span className="number2 inline-block">{index + 1}</span>
              </div>
            </div>

            {/* Images container */}
            <div className="col-start-3 col-span-2 flex flex-col gap-4">
              {[...Array(PROJECT_FOLDERS[index])].map((_, i) => (
                <div key={i} className="w-full">
                  {getMediaElement(index, i)}
                </div>
              ))}
            </div>
          </div>
        ))}
          <div className="h-[50dvh]" style={{ gridColumn: '1/5' }}></div>
        </div>
      </div>
    </>
  );
}

