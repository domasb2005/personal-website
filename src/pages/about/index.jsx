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
        duration: ANIMATION_DURATION.long,
        ease: 'power2.inOut',
        delay: index * 0.1
      });
    });
  };

  const animateParagraphLines = (containerRef) => {
    const lines = Array.from(containerRef.querySelectorAll('p > span'));
    gsap.from(lines, {
      yPercent: 100,
      opacity: 0,
      duration: 0.8,
      ease: 'power4.out',
      stagger: 0.1,
      delay: ANIMATION_DURATION.short
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

  useGSAP(() => {
    requestAnimationFrame(() => {
      setupParagraph(paragraphRef.current, originalText);
      animateParagraphLines(paragraphRef.current);
      animateH2s(paragraphRef.current, projectRefs.current);

      setupParagraph(mobileParagraphRef.current, originalText);
      animateParagraphLines(mobileParagraphRef.current);
      animateH2s(mobileParagraphRef.current, mobileProjectRefs.current);
    });
  }, { scope: container });

  return (
    <div ref={container} className="fixed top-0 w-full">
      <div id="fixed" className="h-[100dvh] w-full fixed top-0 pt-[11rem] md:pt-[45dvh] p-[2rem]">

        {/* Mobile View */}
        <div className="md:hidden w-full">
          <div className="relative w-full">
            <div className="whitespace-nowrap text-left relative w-full">
              {projectNames.map((name, i) => (
                <h2 key={i} ref={el => mobileProjectRefs.current[i] = el} className="small-text">
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
        </div>

        <div className="hidden md:grid auto-cols-fr gap-4" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
          {/* Fill all 16 columns */}
          {[...Array(16)].map((_, index) => (
            <div key={index} className="h-full" />
          ))}

          {/* Content spanning from column 6 to 16 */}
<div className="col-start-6 col-span-11 relative w-full">
  {/* H2s are absolutely positioned inside this wrapper */}
  <div className="absolute top-0 left-0 w-full whitespace-nowrap text-left">
    {projectNames.map((name, i) => (
      <h2 key={i} ref={el => projectRefs.current[i] = el} className="small-text">
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