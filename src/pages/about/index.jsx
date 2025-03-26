import React, { useRef, useContext } from 'react';
import { TransitionContext } from '@/context/TransitionContext';
import { ANIMATION_DURATION } from '@/constants/animation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';




export default function Index() {
  const { timeline } = useContext(TransitionContext);
  const container = useRef(null);

  const projectRefs = useRef([]);
  const paragraphRef = useRef(null);

  const mobileProjectRefs = useRef([]);
  const mobileParagraphRef = useRef(null);
  const slidingChildren = useRef(null);


  const playExitAnimation = () => {
    const timeline = gsap.timeline();
  
    const paragraphLines = container.current?.querySelectorAll('p > span') || [];
    const slidingChildren = container.current?.querySelectorAll('.slidingChildren > *') || [];
    const allH2s = [...projectRefs.current, ...mobileProjectRefs.current].filter(Boolean);
  
    // Animate paragraph lines
    timeline.to(paragraphLines, {
      y: '-100%',
      opacity: 0,
      duration: ANIMATION_DURATION.short,
      ease: 'power4.in',
      stagger: 0.02,
    }, 0);
  
    // Animate sliding children
    timeline.to(slidingChildren, {
      y: '-100%',
      opacity: 0,
      duration: ANIMATION_DURATION.short,
      ease: 'power4.in',
      stagger: 0.015,
    }, 0);
  
    timeline.to(allH2s, {
    x: 0,
    y: 0,
    duration: ANIMATION_DURATION.short,
    ease: 'power2.inOut',
    stagger: ANIMATION_DURATION.short/allH2s.length,
    onStart: function(i) {
      // does not work
      const element = this.targets()[i];
      if (element && element.classList.contains('text-left')) {
        element.classList.remove('text-left');
        element.classList.add('text-right');
      }
    }
  }, 0.1);

    // Set opacity for all H2s except the first one (ALGEBRA)
    const nonFirstH2s = allH2s.filter((h2, index) => {
      return h2.textContent !== projectNames[0];
    });
    
    timeline.to(nonFirstH2s, {
      opacity: 0.32,
      duration: ANIMATION_DURATION.short,
      ease: 'power2.inOut',
    }, 0.2);
  
    return timeline;
  };
  const projectNames = ['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'];

  const getProcessedHTML = (text) => {
    let html = text;
    projectNames.forEach((name, index) => {
      const span = `<span class="invisible-placeholder" data-placeholder="${index}">${name}</span>`;
      html = html.replace(name, span);
    });
    return html;
  };

  const animateH2s = (containerRef, h2Refs) => {
    if (!containerRef || !h2Refs) return;
    const placeholders = containerRef.querySelectorAll('.invisible-placeholder');
    const h2Rects = h2Refs.map(h2 => {
      const rect = h2.getBoundingClientRect();
      return { element: h2, rect };
    });

    const lineHeight = parseFloat(window.getComputedStyle(containerRef).lineHeight);

    placeholders.forEach((span, index) => {
      const spanRect = span.getBoundingClientRect();
      const h2 = h2Rects[index];
      if (!h2) return;

      const dx = spanRect.left - h2.rect.left;
      const dy = (spanRect.top - h2.rect.top) - (1 * lineHeight);

      gsap.to(h2.element, {
        x: dx,
        y: dy,
        // Remove the text property as it doesn't work this way
        duration: ANIMATION_DURATION.long,
        ease: 'power2.inOut',
        delay: index * 0.1,
        onStart: function() {
          // Directly modify the className to change text alignment
          if (h2.element.classList.contains('text-right')) {
            h2.element.classList.remove('text-right');
            h2.element.classList.add('text-left');
          }
        }
      });
    });
  };

  const animateParagraphLines = (containerRef) => {
    const lines = Array.from(containerRef.querySelectorAll('p > span'));
    const staggerTime = ANIMATION_DURATION.long / lines.length;

    gsap.from(lines, {
      y: '100%',
      opacity: 0,
      duration: ANIMATION_DURATION.short,
      ease: 'power4.out',
      stagger: staggerTime,
      delay: ANIMATION_DURATION.short,
    });
  };

  const getParagraphPixelWidth = (isMobile) => {
    if (isMobile) {
      // 100dvw - 2rem padding (left + right)
      const vw = window.innerWidth;
      const padding = 2 * parseFloat(getComputedStyle(document.documentElement).fontSize); // assuming rem = root font size
      return vw - padding;
    } else {
      // Desktop: calculate based on grid columns (col-start-6 to col-end-17)
      const grid = document.querySelector('.md\\:grid');
      if (!grid) return 600; // fallback width

      const columns = grid.querySelectorAll('div.h-full');
      const startCol = columns[5];  // index 5 = col-start-6
      const endCol = columns[15];   // index 15 = col-end-16

      const left = startCol.getBoundingClientRect().left;
      const right = endCol.getBoundingClientRect().right;

      return right - left;
    }
  };

  const setupParagraph = (ref, originalText) => {
    const html = getProcessedHTML(originalText);
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.whiteSpace = 'pre-wrap';
    const isMobile = window.innerWidth < 768;
    let width;
    if (isMobile) {
      width = getParagraphPixelWidth(isMobile) * 0.70;
    } else {
      width = getParagraphPixelWidth(isMobile) * 0.75;
    }
    console.log('📐 Paragraph width calculation:', {
      isMobile,
      windowWidth: window.innerWidth,
      calculatedWidth: width,
      viewportUnit: `${width}px`
    });
    temp.style.width = `${width}px`;
    document.body.appendChild(temp);

    const range = document.createRange();
    const lines = [];
    let line = '';
    let lastTop = null;

    console.log('🔍 Starting line detection...');

    const walker = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      for (let i = 0; i < node.textContent.length; i++) {
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rect = range.getBoundingClientRect();

        if (lastTop === null) {
          lastTop = rect.top;
          console.log('📏 First line starting at y:', lastTop);
        }

        if (Math.abs(rect.top - lastTop) > 1) {
          console.log('📝 Line complete:', {
            content: line,
            length: line.length,
            previousTop: lastTop,
            newTop: rect.top
          });
          lines.push(line);
          line = '';
          lastTop = rect.top;
        }
        line += node.textContent[i];
      }
    }

    if (line) {
      console.log('📝 Final line:', {
        content: line,
        length: line.length,
        top: lastTop
      });
      lines.push(line);
    }

    console.log('📚 Total lines generated:', lines.length);

    range.detach();
    document.body.removeChild(temp);

    ref.innerHTML = '';
    lines.forEach(line => {
      const p = document.createElement('p');
      p.className = 'overflow-hidden';
      const span = document.createElement('span');
      span.className = 'inline-block';
      span.innerHTML = getProcessedHTML(line);
      p.appendChild(span);
      ref.appendChild(p);
    });
  };

  const originalText = `ALGEBRA is a website for math tutoring services. It's my first-ever website, made with WordPress. URBANEAR served as a landing page for a hackathon startup project. Created within six hours, it was also built with WordPress due to the need for a quick launch. EVENT AI is an Android app that leverages AI to generate calendar events from selected text, made with Kotlin and Jetpack Compose. The nuclear control room SIMULATOR is an interactive installation at the Energy and Technology Museum, my first workplace as an embedded systems developer. The TESLA COIL is a device showcasing electromagnetic induction, a hobby project for the "Upcycling 2023" contest. The CAR GAME is another museum installation featuring remote-controlled cars with a first-person view and a real-time control system.`;


  const animateSlidingChildren = () => {
    const slidingElements = document.querySelectorAll('.slidingChildren');
    const targets = [];

    slidingElements.forEach(el => {
      const children = el.children;
      Array.from(children).forEach(child => {
        // Ensure transforms apply properly
        child.style.display = 'inline-block';
        targets.push(child);
      });
    });

    gsap.fromTo(
      targets,
      { y: '100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: ANIMATION_DURATION.long,
        ease: 'power4.out',
        stagger: ANIMATION_DURATION.long / targets.length,
        delay: ANIMATION_DURATION.short/3
      }
    );
  };

  useGSAP(() => {
    requestAnimationFrame(() => {
      setupParagraph(paragraphRef.current, originalText);
      animateParagraphLines(paragraphRef.current);
      animateH2s(paragraphRef.current, projectRefs.current);
      animateSlidingChildren();
  
      setupParagraph(mobileParagraphRef.current, originalText);
      animateParagraphLines(mobileParagraphRef.current);
      animateH2s(mobileParagraphRef.current, mobileProjectRefs.current);
  
      // ✅ Add exit animation to the transition timeline
      if (timeline) {
        timeline.add(playExitAnimation(), 'exit');
      }
    });
  }, { scope: container });
  return (
    <div ref={container} className="fixed top-0">
      <div id="fixed" className="h-[100dvh] w-[100dvw] fixed top-0 pt-[11rem] md:pt-[calc(45dvh-2.6rem)] p-[2rem]">

        {/* Mobile View */}
        <div className="md:hidden">
          <div className="small-text overflow-hidden slidingChildren uppercase opacity-[0.32]">
            <h2>Bio</h2>
          </div>
          <div className="small-text pt-[1rem] pb-[4rem]">
            <p className="overflow-hidden slidingChildren"><span className="inline-block">I used to work as an embedded systems developer with</span></p>
            <p className="overflow-hidden slidingChildren"><span className="inline-block">a strong electrical engineering background. Studying at</span></p>
            <p className="overflow-hidden slidingChildren"><span className="inline-block">the Technical University Eindhoven. Currently learning</span></p>
            <p className="overflow-hidden slidingChildren"><span className="inline-block">web and mobile app development.</span></p>
          </div>
          <div className="small-text uppercase overflow-hidden slidingChildren opacity-[0.32]">
            <h2>Projects</h2>
          </div>
          <div className="small-text absolute bottom-[2rem] left-[2rem] overflow-hidden slidingChildren">
            <span>domas.berulis@gmail.com</span>
          </div>
          <div className='small-text opacity-[0.32] z-[20] absolute bottom-[2rem] right-[2rem] overflow-hidden slidingChildren'>
            <a href='https://www.linkedin.com/in/domas-berulis-8127b41b9/'>Linked in,</a>{' '}
            <span></span>
            <a href='https://github.com/domasb2005'>Git, </a>{' '}
            <a href='https://x.com/Domas04641249'>X</a>
          </div>
          <div className="whitespace-nowrap text-left absolute bottom-[2rem] right-[2rem]">
            {projectNames.map((name, i) => (
              <h2 key={i} ref={el => mobileProjectRefs.current[i] = el} className=" small-text text-right pb-[0.9rem]">
                {name}
              </h2>
            ))}
          </div>

          <div className="relative w-full mt-4">
            <div
              ref={mobileParagraphRef}
              className="small-text whitespace-pre-wrap"
              style={{
                maxWidth: '100%',
              }}
            />
          </div>

        </div>

        <div className="hidden md:grid auto-cols-fr gap-x-4" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
          {/* Fill all 16 columns */}
          {[...Array(16)].map((_, index) => (
            <div key={index} className="h-full" />
          ))}

<div className="small-text absolute bottom-[2rem] left-[2rem] overflow-hidden slidingChildren">
            <span>domas.berulis@gmail.com</span>
          </div>
          <div className='small-text opacity-[0.32] absolute bottom-[2rem] right-[2rem] overflow-hidden slidingChildren'>
            <a href='https://www.linkedin.com/in/domas-berulis-8127b41b9/'>Linked in,</a>{' '}
            <span></span>
            <a href='https://github.com/domasb2005'>Git, </a>{' '}
            <a href='https://x.com/Domas04641249'>X</a>
          </div>


          <div className='col-start-0 col-span-4'>
            <div className="small-text overflow-hidden slidingChildren uppercase opacity-[0.32]">
              <h2>Bio</h2>
            </div>
            <div className="small-text pt-[1rem] pb-[4rem]">
              <p className="overflow-hidden slidingChildren"><span className="inline-block">I used to work as an embedded systems developer</span></p>
              <p className="overflow-hidden slidingChildren"><span className="inline-block">with a strong electrical engineering background.</span></p>
              <p className="overflow-hidden slidingChildren"><span className="inline-block">Studying at the Technical University Eindhoven.</span></p>
              <p className="overflow-hidden slidingChildren"><span className="inline-block">Currently learning web and mobile app development.</span></p>
            </div>

          </div>

          {/* Content spanning from column 6 to 16 */}
          <div className="col-start-6 col-span-11 relative w-full">
          <div className="small-text uppercase overflow-hidden slidingChildren opacity-[0.32] pb-[1rem]">
            <h2>Projects</h2>
          </div>
            {/* H2s are absolutely positioned inside this wrapper */}
            <div className="absolute top-[2.6rem] left-0 w-full whitespace-nowrap text-left">
              {projectNames.map((name, i) => (
                <h2 key={i} ref={el => projectRefs.current[i] = el} className="small-text pb-[0.2rem]">
                  {name}
                </h2>
              ))}
            </div>

            

            {/* Paragraph respects the 45dvh padding from parent */}
            <div className="relative w-full">
              <div
                ref={paragraphRef}
                className="small-text whitespace-pre-wrap"
                style={{
                  maxWidth: '100%',
                }}
              />
            </div>
          </div>        </div>      </div>
    </div>
  );
}