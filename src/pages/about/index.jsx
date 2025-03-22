import React, { useRef, useContext } from 'react'
import Picture from '../../../public/images/3.jpg'
import Image from 'next/image';
import { TransitionContext } from '@/context/TransitionContext';
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
  const h2ContainerRef = useRef(null);

  const hardcodedPlaceholders = [
    " ", // ALGEBRA
    "                         ", // URBANEAR
    "                     ", // EVENT AI
    "                           ", // SIMULATOR
    "                        ", // TESLA COIL
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
          p.className = index === 0 ? "overflow-visible" : "overflow-hidden";

          const span = document.createElement('span');
          span.className = "inline-block";
          span.textContent = line;

          paragraphLineRefs.current[index] = span;

          p.appendChild(span);
          paragraphRef.current.appendChild(p);
        });

        // Continue with the rest of your animation code
        const text = paragraphRef.current?.textContent || "";
        const visibleParagraph = paragraphRef.current;

        const h2Positions = projectRefs.current.map(h2 => {
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
          const translateY = placeholderRect.top - h2Info.originalTop;
          gsap.to(h2Info.element, {
            x: translateX + (index === 0 ? 0 : 5),
            y: translateY,
            duration: 0.5,
            ease: "power2.out",
            delay: index * 0.1
          });
        });

        timeline.add(gsap.to(container.current, { opacity: 0 }));
      });
    });
  }, { scope: container });

  return (
    <div ref={container} className="fixed top-0">
      <div id="fixed" className="h-[100dvh] w-[100dvw] fixed top-0 pt-[45dvh] p-[2rem] grid auto-cols-fr gap-4" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
        {[...Array(16)].map((_, index) => (
          //bg-blue-500
          <div key={index} className="h-full">
            <div className="md:hidden h-full">
              {index === 15 && (
                <div id="h2-wrap" className="whitespace-nowrap absolute bottom-0 right-0">
                  {['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'].map((name, i) => (
                    <h2 key={i} className="small-text !leading-[1.8rem] block text-right">{name}</h2>
                  ))}
                </div>
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
                    className="absolute top-[45dvh] text-red-500 col-start-6 col-span-11 small-text"
                    style={{
                      whiteSpace: 'pre-wrap',
                      width: '100%',
                      paddingRight: '2rem',
                    }}
                  >                    <p>
                      ALGEBRA is a website for math tutoring services. It's my first-ever website, made with WordPress. URBANEAR served as a landing page for a hackathon startup project. Created within six hours, it was also built with WordPress due to the need for a quick launch. EVENT AI is an Android app that leverages AI to generate calendar events from selected text, made with Kotlin and Jetpack Compose. The nuclear power plant control room SIMULATOR is an interactive installation at the Energy and Technology Museum, my first workplace as an embedded systems developer. The TESLA COIL is a device showcasing electromagnetic induction, a hobby project for the "Upcycling 2023" contest. The CAR GAME is another museum installation featuring remote-controlled cars with a first-person view and a real-time control system.
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
