import { useContext, useRef, useEffect, useState } from 'react';
import { TransitionContext } from '@/context/TransitionContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';

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

  const [fileTypes, setFileTypes] = useState({});
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Detect file types for each item (video or image)
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

  // Track scroll to determine active project
  useEffect(() => {
    const handleScroll = () => {
    const projectElements = Array.from(document.querySelectorAll('.projectMedia'))
      .filter(el => el.offsetParent !== null); // filters out display: none elements
      const middleY = window.innerHeight * 0.45;

      projectElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= middleY && rect.bottom >= middleY) {
          setActiveProjectIndex(index);
          console.log('Active Project Index:', index); // Added logging
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getMediaType = (index, i) => {
    const key = `${index}-${i}`;
    const type = fileTypes[key];
    const videoPath = `/images/folder_${index}/${i}.mp4`;
    const imagePath = `/images/folder_${index}/${i}.webp`;

    if (!type) return null;

    return type === 'video' ? (
      <video
        key={`v-${index}-${i}`}
        className="w-full object-contain"
        style={{ height: 'auto' }}
        autoPlay
        loop
        muted
        playsInline
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
        className="w-full object-contain"
        style={{ height: 'auto' }}
      />
    );
  };

  useGSAP(() => {
    const targets = gsap.utils.toArray(['div']);
    gsap.fromTo(
      targets,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05 }
    );
    timeline.add(
      gsap.to(targets, {
        y: 30,
        opacity: 0,
      })
    );
  }, { scope: container });

  return (
    <>
      <div ref={container} className="fixed top-0">
        <div
          className="h-[100dvh] w-[100dvw] fixed top-0 pt-[45dvh] p-[2rem] grid auto-cols-fr gap-4"
          style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
        >
          {[...Array(16)].map((_, index) => (
            <div key={index} className="h-full bg-blue-500 relative">
              {/* Mobile project names */}
              <div className="md:hidden h-full">
                {index === 15 && (
                  <div className="whitespace-nowrap absolute bottom-0 right-0">
                    {PROJECT_NAMES.map((name, i) => (
                      <h2
                        key={i}
                        className={`small-text !leading-[2.5rem] block text-right transition-opacity duration-200 ${
                          activeProjectIndex === i || hoveredIndex === i ? 'opacity-[1]' : 'opacity-[0.32]'
                        }`}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {name}
                      </h2>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop project names */}
              <div className="hidden md:block">
                {index === 5 && (
                  <div className="whitespace-nowrap text-left">
                    {PROJECT_NAMES.map((name, i) => (
                      <h2
                        key={i}
                        className={`small-text !leading-[1.8rem] transition-opacity duration-200 ${
                          activeProjectIndex === i || hoveredIndex === i ? 'opacity-[1]' : 'opacity-[0.32]'
                        }`}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {name}
                      </h2>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
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