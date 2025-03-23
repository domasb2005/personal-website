import React, { useRef, useContext } from 'react'
import { TransitionContext } from '@/context/TransitionContext';
import { ANIMATION_DURATION } from '@/constants/animation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
export default function Index() {
  const { timeline } = useContext(TransitionContext);
  const container = useRef(null);
  const image = useRef();
  const projectRefs = useRef([]);
  const paragraphLineRefs = useRef([]);
  const paragraphRef = useRef(null);
  const redParagraphRef = useRef(null);
  const mobileParagraphRef = useRef(null);
  const mobileParagraphLineRefs = useRef([]);
  const mobileProjectRefs = useRef([]);



  const hardcodedPlaceholders = [
    " ", // ALGEBRA
    "                         ", // URBANEAR
    "                     ", // EVENT AI
    "                           ", // SIMULATOR
    "                          ", // TESLA COIL
    "                         ", // CAR GAME
  ];

  const sentences = [
    /^\s+is a website for math/,
    /\.\s+served as a landing page/,
    /\.\s+is an Android app/,
    /control room(\s+)is an interactive/,
    /The\s+is a device showcasing/,
    /The\s+is another museum installation/
  ];

  const findTextNodeAtPosition = (element, position) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let currentPos = 0;
    let node;
    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent.length;
      if (position >= currentPos && position < currentPos + nodeLength) {
        return node;
      }
      currentPos += nodeLength;
    }
    return null;
  };

  const getTextNodePosition = (parent, textNode) => {
    const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
    let position = 0;
    let node;
    while ((node = walker.nextNode()) && node !== textNode) {
      position += node.textContent.length;
    }
    return position;
  };

  useGSAP(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const isMobile = window.innerWidth < 768;
  
        const activeParagraphRef = isMobile ? mobileParagraphRef : paragraphRef;
        const activeParagraphLineRefs = isMobile ? mobileParagraphLineRefs : paragraphLineRefs;
        const activeProjectRefs = isMobile ? mobileProjectRefs : projectRefs;
  
        if (!redParagraphRef.current || !activeParagraphRef.current) return;
  
        const fullText = redParagraphRef.current.textContent;
        const projectNames = ['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'];
  
        const computedStyles = window.getComputedStyle(redParagraphRef.current);
        const tempDiv = document.createElement('div');
        Object.assign(tempDiv.style, {
          width: computedStyles.width,
          position: 'absolute',
          visibility: 'visible',
          fontSize: computedStyles.fontSize,
          fontFamily: computedStyles.fontFamily,
          fontWeight: computedStyles.fontWeight,
          lineHeight: computedStyles.lineHeight,
          letterSpacing: computedStyles.letterSpacing,
          padding: computedStyles.padding,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          boxSizing: 'border-box',
          maxWidth: computedStyles.maxWidth,
          outline: '1px solid red',
        });
  
        document.body.appendChild(tempDiv);
  
        let processedText = fullText;
        projectNames.forEach((name, index) => {
          processedText = processedText.replace(name, hardcodedPlaceholders[index]);
        });
  
        tempDiv.textContent = processedText;
  
        const range = document.createRange();
        const textNode = tempDiv.firstChild;
        const lines = [];
        let currentLine = '';
        let lastTop = null;
  
        for (let i = 0; i < processedText.length; i++) {
          range.setStart(textNode, i);
          range.setEnd(textNode, i + 1);
          const rect = range.getBoundingClientRect();
  
          if (lastTop === null) lastTop = rect.top;
  
          if (Math.abs(rect.top - lastTop) > 1) {
            lines.push(currentLine);
            currentLine = '';
            lastTop = rect.top;
          }
  
          currentLine += processedText[i];
        }
  
        if (currentLine.length > 0) lines.push(currentLine);
  
        range.detach();
        document.body.removeChild(tempDiv);
  
        if (!isMobile) {
          while (activeParagraphRef.current.firstChild) {
            activeParagraphRef.current.removeChild(activeParagraphRef.current.firstChild);
          }
        
          activeParagraphLineRefs.current = [];
          lines.forEach((line, index) => {
            const p = document.createElement('p');
            p.className = "overflow-hidden";
            const span = document.createElement('span');
            span.className = "inline-block";
            span.textContent = line;
            activeParagraphLineRefs.current[index] = span;
            p.appendChild(span);
            activeParagraphRef.current.appendChild(p);
          });
        }  
        gsap.from(activeParagraphLineRefs.current, {
          yPercent: 100,
          opacity: 0,
          duration: 0.8,
          ease: "power4.out",
          stagger: 0.1,
          delay: ANIMATION_DURATION.short,
        });
  
        const text = activeParagraphRef.current?.textContent || "";
        const visibleParagraph = activeParagraphRef.current;
        const validH2s = activeProjectRefs.current.filter(Boolean);
  
        const h2Positions = validH2s.map(h2 => {
          const rect = h2.getBoundingClientRect();
          return {
            element: h2,
            rect,
            originalTop: rect.top,
            originalLeft: rect.left
          };
        });
  
        const lineHeight = parseFloat(window.getComputedStyle(activeParagraphRef.current).lineHeight);
        const placeholderPositions = [];
  
        sentences.forEach((sentencePattern, index) => {
          const match = text.match(sentencePattern);
          if (match) {
            const matchText = match[0];
            const startIndex = match.index;
            const spaceMatch = index === 3 && match[1]
              ? { 0: match[1], index: matchText.indexOf(match[1]) }
              : matchText.match(/\s+/);
  
            if (spaceMatch) {
              const spaceStartIndex = startIndex + spaceMatch.index;
              const spaceEndIndex = spaceStartIndex + spaceMatch[0].length;
  
              placeholderPositions.push({
                start: spaceStartIndex,
                end: spaceEndIndex,
                index
              });
            }
          }
        });
  
        placeholderPositions.forEach((placeholder, index) => {
          const textNode = findTextNodeAtPosition(visibleParagraph, placeholder.start);
          if (!textNode) return;
  
          const nodePosition = getTextNodePosition(visibleParagraph, textNode);
          const startOffset = placeholder.start - nodePosition;
          const endOffset = Math.min(startOffset + (placeholder.end - placeholder.start), textNode.textContent.length);
  
          const range = document.createRange();
          range.setStart(textNode, startOffset);
          range.setEnd(textNode, endOffset);
  
          const placeholderRect = range.getBoundingClientRect();
          const h2Info = h2Positions[index];
          const h2Rect = h2Info.rect;
  
          const translateX = placeholderRect.left - h2Rect.left;
          const translateY = (placeholderRect.top - h2Info.originalTop) - lineHeight;
  
          gsap.to(h2Info.element, {
            x: translateX + (index === 0 ? 0 : 5),
            y: translateY,
            duration: ANIMATION_DURATION.long,
            ease: "power2.inOut",
            delay: index * 0.1
          });
        });
  
        const exitTimeline = gsap.timeline();
        exitTimeline
          .to(activeParagraphLineRefs.current, {
            yPercent: -100,
            opacity: 0,
            duration: ANIMATION_DURATION.short,
            ease: "power4.out",
            stagger: 0.1
          })
          .to(activeProjectRefs.current, {
            x: 0,
            y: 0,
            duration: ANIMATION_DURATION.short,
            ease: "power2.inOut",
            stagger: 0.1
          }, "<");
  
        timeline.add(exitTimeline, 0);
      });
    });
  }, { scope: container });

  
  return (
    <div ref={container} className="md:fixed top-0">
      <div id="fixed" className="h-[100dvh] w-[100dvw] md:fixed top-0 pt-[11rem] md:pt-[45dvh] p-[2rem] grid auto-cols-fr gap-4" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
        {[...Array(16)].map((_, index) => (
          //bg-blue-500
          <div key={index} className="h-full">
            <div className="md:hidden h-full">
              {index === 0 && (
                <>
                  <div id="bio-wrap" className="absolute left-[2rem] right-[2rem]">
                    <h2 className="small-text uppercase opacity-[0.32]">
                      Bio
                    </h2>
                    <p className="small-text pt-[1rem]">
                      I used to work as an embedded systems developer with a strong electrical engineering background. Studying at the Technical University Eindhoven. Currently learning web and mobile app development.
                    </p>
                  </div>
                  <div id='p-wrap-mobile' className='absolute left-[2rem] pt-[15rem] right-[2rem]'>
                    <h2 className="small-text uppercase opacity-[0.32]">
                      Projects i'm not ashamed of
                    </h2>
                    <div id="p-wrap" ref={mobileParagraphRef} style={{ whiteSpace: 'pre-wrap', width: 'calc(100dvh-2rem)' }} className="small-text pt-[1rem]">
                      <p className="overflow-visible">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[0] = el}>
                          {"          "} is a website for math tutoring services. It's 
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[1] = el}>
                          my first-ever website, made with WordPress.
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[2] = el}>
                          {"               "} served as a landing page for a hackathon
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[3] = el}>
                          startup project. Created within six hours, it was also
                        </span>
                      </p>
                      <p className='overflow-hidden'>
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[4] = el}>
                          built with WordPress due to the need for a quick launch.
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[5] = el}>
                          {"           "} is an Android app that leverages AI to
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[6] = el}>
                          generate calendar events from selected text, made
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[7] = el}>
                          with Kotlin and Jetpack Compose. The nuclear control
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[8] = el}>
                          room {"             "} is an interactive installation at the
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[9] = el}>
                          Energy and Technology Museum, my first workplace as
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[10] = el}>
                          an embedded systems developer. The {"           "} is a
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[11] = el}>
                          device showcasing electromagnetic induction, a hobby
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[12] = el}>
                          project for the "Upcycling 2023" contest. The
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[13] = el}>
                          {"          "} is another museum installation featuring
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[14] = el}>
                          remote-controlled cars with a first-person view and a
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => mobileParagraphLineRefs.current[15] = el}>
                          real-time control system.
                        </span>
                      </p>
                    </div>
                  </div>
                  <div id="h2-wrap" className="whitespace-nowrap absolute bottom-[2rem] right-[2rem]">
                  {['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'].map((name, i) => (
                    <h2 key={i} ref={el => mobileProjectRefs.current[i] = el} className="small-text block text-right">{name}</h2>
                  ))}
                </div>

                </>
              )}
            </div>
            <div className="hidden md:block">
              {index === 5 && (
                <>
                  <div id="h2-wrap" className="whitespace-nowrap text-left relative">
                    {['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'].map((name, i) => (
                      <h2 key={i} ref={el => projectRefs.current[i] = el}
                        className="small-text ">{name}</h2>
                    ))}
                  </div>

                  {/* Empty paragraph container that will be filled dynamically */}
                  <div id="p-wrap" ref={paragraphRef} style={{ whiteSpace: 'pre-wrap', width: 'max-content' }}
                    className="small-text absolute top-[45dvh]">
                  </div>

                  {/* Reference paragraph that will be used for line detection but hidden */}
                  <div
                    ref={redParagraphRef}
                    className="absolute top-[45dvh] invisible text-red-500 col-start-6 col-span-11 small-text"
                    style={{
                      whiteSpace: 'pre-wrap',
                      width: '100%',
                      paddingRight: '2rem',
                    }}
                  >                    <p>
                      ALGEBRA is a website for math tutoring services. It's my first-ever website, made with WordPress. URBANEAR served as a landing page for a hackathon startup project. Created within six hours, it was also built with WordPress due to the need for a quick launch. EVENT AI is an Android app that leverages AI to generate calendar events from selected text, made with Kotlin and Jetpack Compose. The nuclear control room SIMULATOR is an interactive installation at the Energy and Technology Museum, my first workplace as an embedded systems developer. The TESLA COIL is a device showcasing electromagnetic induction, a hobby project for the "Upcycling 2023" contest. The CAR GAME is another museum installation featuring remote-controlled cars with a first-person view and a real-time control system.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div id="scrollable" className=""></div>
    </div>
  )
}