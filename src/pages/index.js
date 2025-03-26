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

            setPreviewImage({
              src: isVideo ?
                `/images/folder_${index}/${mediaIndex}-min.mp4` :
                `/images/folder_${index}/${mediaIndex}-min.jpg`,
              type: isVideo ? 'video' : 'image'
            });
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

  // The function is named getMediaElement
  const getMediaElement = (index, i) => {
    const imagePath = `/images/folder_${index}/${i}-min.jpg`;
    const videoPath = `/images/folder_${index}/${i}-min.mp4`;

    return (
      <Image
        key={`img-${index}-${i}`}
        src={imagePath}
        alt={`Image ${i} from project ${index}`}
        width={1280}
        priority={index === 0} // Only first image uses priority
        loading="eager"
        height={720}
        className="w-full object-contain photo"
        style={{ height: 'auto' }}
        onLoad={onMediaLoad}
        onError={(e) => {
          const video = document.createElement('video');
          video.src = videoPath;
          video.autoplay = true;
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.className = 'w-full object-contain';
          video.style.height = 'auto';
          video.onloadeddata = onMediaLoad;

          if (e.target.parentNode) {
            e.target.parentNode.replaceChild(video, e.target);
          }
        }}
      />
    );
  };

  useGSAP(() => {

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
      <div className="progress-bar fixed top-0 left-0 md:left-auto md:right-0 w-[8px] h-[100dvh] bg-[var(--color-black)] origin-top z-50"
        style={{ transform: 'scaleY(0)' }}></div>


      <div ref={container} className="fixed top-0">
        <div className="h-[100dvh] w-[100dvw] fixed top-0 pt-[45dvh] p-[2rem] grid auto-cols-fr gap-4"
          style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>

          {/* Mobile project names */}
          <div className="md:hidden h-full relative"
            style={{ gridColumnStart: 16, gridColumnEnd: 17 }}>
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
                    className={`small-text pb-[0.9rem] block text-right ${activeProjectIndex === i || hoveredIndex === i ? 'opacity-[1]' : 'opacity-[0.32]'
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
              <div className="text-left z-[40]">
                {PROJECT_NAMES.map((name, i) => (
                  <h2
                    key={i}
                    className={`small-text pb-[0.2rem] ${activeProjectIndex === i || hoveredIndex === i ? 'opacity-[1]' : 'opacity-[0.32]'
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
      {/*preview*/}
      <div className="hidden md:grid pointer-events-none fixed z-[0] top-0 left-0 w-[100dvw] h-[100dvh] p-[2rem] gap-4 z-[5]"
        style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
        <div className="h-[70dvh] absolute bottom-[2rem] right-[0]" style={{ gridColumn: '9 / span 8' }}>
          <div className="w-full h-full flex items-end justify-end">
            {previewImage?.type === 'video' ? (
              <video
                src={previewImage.src}
                className="h-full object-contain"
                style={{
                  maxWidth: '100%',
                  objectPosition: 'right bottom',
                }}
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
                style={{
                  width: 'auto',
                  height: '100%',
                  objectPosition: 'right bottom',
                }}
              />
            )}
          </div>
        </div>
        <div className='small-text pointer-events-auto flex justify-between'
          style={{ gridColumn: '9/ span 8' }}>
          <span className='overflow-hidden'>
            <p id='description'>{PROJECT_DESCRIPTIONS[descriptionIndex]}</p>
          </span>

          {PROJECT_LINKS[descriptionIndex] && (
            <span className="overflow-hidden">
  <a
    href={PROJECT_LINKS[descriptionIndex]}
    target="_blank"
    rel="noopener noreferrer"
    className=" flex items-center group"
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
</span>          )}
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
              id={`project-section-${index}`}
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
                    {getMediaElement(index, i)}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className='h-[50dvh]' style={{ gridColumn: '1/5' }}></div>


        </div>
      </div>
    </>
  );
}
