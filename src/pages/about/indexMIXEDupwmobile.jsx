import React, { useRef, useContext } from 'react'
import { TransitionContext } from '@/context/TransitionContext';
import { ANIMATION_DURATION } from '@/constants/animation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
export default function Index() {
  const { timeline } = useContext(TransitionContext);
  const container = useRef(null);
  const image = useRef();
  // Separate desktop and mobile refs
  const desktopProjectRefs = useRef([]);
  const mobileProjectRefs = useRef([]);
  const paragraphLineRefs = useRef([]);
  const paragraphRef = useRef(null);
  const redParagraphRef = useRef(null);
  const h2ContainerRef = useRef(null);

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
        if (!redParagraphRef.current || !paragraphRef.current) return;

        // Get the text content from the red paragraph
        const fullText = redParagraphRef.current.textContent;

        // Get project names to replace with spaces
        const projectNames = ['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'];

        const computedStyles = window.getComputedStyle(redParagraphRef.current);
        const tempDiv = document.createElement('div');

        tempDiv.style.width = computedStyles.width;
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'visible';
        tempDiv.style.fontSize = computedStyles.fontSize;
        tempDiv.style.fontFamily = computedStyles.fontFamily;
        tempDiv.style.fontWeight = computedStyles.fontWeight;
        tempDiv.style.lineHeight = computedStyles.lineHeight;
        tempDiv.style.letterSpacing = computedStyles.letterSpacing;
        tempDiv.style.padding = computedStyles.padding;
        tempDiv.style.whiteSpace = 'pre-wrap';
        tempDiv.style.outline = '1px solid red'; // just for visual debugging
        tempDiv.style.wordWrap = 'break-word';
        tempDiv.style.boxSizing = 'border-box';
        tempDiv.style.maxWidth = computedStyles.maxWidth;

        tempDiv.style.fontSize = window.getComputedStyle(redParagraphRef.current).fontSize;
        tempDiv.style.fontFamily = window.getComputedStyle(redParagraphRef.current).fontFamily;
        tempDiv.style.lineHeight = window.getComputedStyle(redParagraphRef.current).lineHeight;
        tempDiv.style.whiteSpace = 'pre-wrap';
        document.body.appendChild(tempDiv);


        // Replace project names with hardcoded placeholders in the text
        let processedText = fullText;
        projectNames.forEach((name, index) => {
          processedText = processedText.replace(name, hardcodedPlaceholders[index]);
        });

        // Add the processed text to the temp div
        tempDiv.textContent = processedText;

        // Now measure actual visual line breaks using getBoundingClientRect
        const range = document.createRange();
        const textNode = tempDiv.firstChild;
        const lines = [];
        let currentLine = '';
        let lastTop = null;

        for (let i = 0; i < processedText.length; i++) {
          range.setStart(textNode, i);
          range.setEnd(textNode, i + 1);
          const rect = range.getBoundingClientRect();

          if (lastTop === null) {
            lastTop = rect.top;
          }

          if (Math.abs(rect.top - lastTop) > 1) {
            lines.push(currentLine);
            currentLine = '';
            lastTop = rect.top;
          }

          currentLine += processedText[i];
        }

        if (currentLine.length > 0) {
          lines.push(currentLine);
        }

        range.detach();
        document.body.removeChild(tempDiv);

        // Clear existing paragraph content
        while (paragraphRef.current.firstChild) {
          paragraphRef.current.removeChild(paragraphRef.current.firstChild);
        }

        // Create new paragraph lines
        paragraphLineRefs.current = [];
        lines.forEach((line, index) => {
          const p = document.createElement('p');
          p.className = "overflow-hidden";

          const span = document.createElement('span');
          span.className = "inline-block";
          span.textContent = line;

          paragraphLineRefs.current[index] = span;

          p.appendChild(span);
          paragraphRef.current.appendChild(p);
        });


        gsap.from(paragraphLineRefs.current, {
          yPercent: 100,
          opacity: 0,
          duration: 0.8,
          ease: "power4.out",
          stagger: 0.1,
          delay: ANIMATION_DURATION.short,
        });


        const text = paragraphRef.current?.textContent || "";
        const visibleParagraph = paragraphRef.current;

        const isMobile = window.innerWidth < 768;

        // Completely separate mobile and desktop logic
        if (isMobile) {
          const mobileH2Wrap = container.current.querySelector('#h2-wrap');
          const mobileH2s = Array.from(mobileH2Wrap?.querySelectorAll('h2') || []);
          mobileProjectRefs.current = mobileH2s;
          
          console.log('Mobile H2s found:', mobileH2s.length);
          const validH2s = mobileProjectRefs.current.filter(Boolean);
        } else {
          // Desktop logic uses desktopProjectRefs
          const validH2s = desktopProjectRefs.current.filter(Boolean);
        }

        // Use the appropriate refs based on viewport
        const activeProjectRefs = isMobile ? mobileProjectRefs.current : desktopProjectRefs.current;
        const validH2s = activeProjectRefs.filter(Boolean);

        const h2Positions = validH2s.map(h2 => {
          const rect = h2.getBoundingClientRect();
          return {
            element: h2,
            rect,
            originalTop: rect.top,
            originalLeft: rect.left
          };
        });

        const lineHeight = parseFloat(window.getComputedStyle(paragraphRef.current).lineHeight);

        const placeholderPositions = [];

        sentences.forEach((sentencePattern, index) => {
          const match = text.match(sentencePattern);
          if (match) {
            const matchText = match[0];
            const startIndex = match.index;

            let spaceMatch;

            if (index === 3 && match[1]) {
              spaceMatch = { 0: match[1], index: matchText.indexOf(match[1]) };
            } else {
              spaceMatch = matchText.match(/\s+/);
            }

            if (spaceMatch) {
              const spaceStartIndex = startIndex + spaceMatch.index;
              const spaceEndIndex = spaceStartIndex + spaceMatch[0].length;

              placeholderPositions.push({
                start: spaceStartIndex,
                end: spaceEndIndex,
                index: index
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
          
          // Debug print for animation values
          console.log(`Animation values for ${h2Info.element.textContent}:`, {
            translateX,
            translateY,
            placeholderRect: {
              top: placeholderRect.top,
              left: placeholderRect.left
            },
            h2Original: {
              top: h2Info.originalTop,
              left: h2Info.originalLeft
            },
            lineHeight
          });

          gsap.to(h2Info.element, {
            x: translateX + (index === 0 ? 0 : 5),
            y: translateY,
            duration: ANIMATION_DURATION.long,
            ease: "power2.inOut",
            delay: index * 0.1
          });
        });

        // Instead of a simple fade out, create a timeline for exit animation
        const exitTimeline = gsap.timeline();

        // First, animate text lines sliding up
        // Animate text lines and h2s simultaneously
        exitTimeline
          .to(paragraphLineRefs.current, {
            yPercent: -100,
            opacity: 0,
            duration: ANIMATION_DURATION.short,
            ease: "power4.out",
            stagger: 0.1
          })
          .to(activeProjectRefs, {
            x: 0,
            y: 0,
            duration: ANIMATION_DURATION.short,
            ease: "power2.inOut",
            stagger: 0.1
          }, "<");

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
                    <div id="p-wrap" ref={paragraphRef} style={{ whiteSpace: 'pre-wrap', width: 'calc(100dvh-2rem)' }} className="small-text pt-[1rem]">
                      <p className="overflow-visible">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[0] = el}>
                          {"          "} is a website for math tutoring services.
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[1] = el}>
                          It's my first-ever website, made with WordPress.
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[2] = el}>
                          {"               "} served as a landing page for a hackathon
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[3] = el}>
                          startup project. Created within six hours, it was also
                        </span>
                      </p>
                      <p className='overflow-hidden'>
                        <span className="inline-block" ref={el => paragraphLineRefs.current[4] = el}>
                          built with WordPress due to the need for a quick launch.
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[5] = el}>
                          {"           "} is an Android app that leverages AI to
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[6] = el}>
                          generate calendar events from selected text, made
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[7] = el}>
                          with Kotlin and Jetpack Compose. The nuclear control
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[8] = el}>
                          room {"             "} is an interactive installation at the
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[9] = el}>
                          Energy and Technology Museum, my first workplace as
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[10] = el}>
                          an embedded systems developer. The {"           "} is a
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[11] = el}>
                          device showcasing electromagnetic induction, a hobby
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[12] = el}>
                          project for the "Upcycling 2023" contest. The
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[13] = el}>
                          {"          "} is another museum installation featuring
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[14] = el}>
                          remote-controlled cars with a first-person view and a
                        </span>
                      </p>
                      <p className="overflow-hidden">
                        <span className="inline-block" ref={el => paragraphLineRefs.current[15] = el}>
                          real-time control system.
                        </span>
                      </p>
                    </div>
                  </div>
                  <div id="h2-wrap" className="whitespace-nowrap absolute bottom-[2rem] right-[2rem]">
                  {['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'].map((name, i) => (
                    <h2 key={i} className="small-text block text-right">{name}</h2>
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
                      <h2 key={i} ref={el => desktopProjectRefs.current[i] = el}
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