import React, { useRef, useContext } from 'react';
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

  // Mobile-specific refs
  const mobileProjectRefs = useRef([]);
  const mobileParagraphRef = useRef(null);
  const mobileParagraphLineRefs = useRef([]);
  const mobileRedParagraphRef = useRef(null);

  const hardcodedPlaceholders = [
    "                     ", "                         ", "                     ", "                           ",
    "                          ", "                         "
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

  const animateParagraphWithH2s = ({
    redParagraph,
    paragraphContainer,
    projectH2s,
    paragraphLineRefs
  }) => {
    if (!redParagraph || !paragraphContainer) return;

    const fullText = redParagraph.textContent;
    const projectNames = ['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'];
    const computedStyles = window.getComputedStyle(redParagraph);
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

    while (paragraphContainer.firstChild) {
      paragraphContainer.removeChild(paragraphContainer.firstChild);
    }

    paragraphLineRefs.length = 0;
    lines.forEach((line, index) => {
      const p = document.createElement('p');
      p.className = "overflow-hidden";
      const span = document.createElement('span');
      span.className = "inline-block";
      span.textContent = line;
      paragraphLineRefs[index] = span;
      p.appendChild(span);
      paragraphContainer.appendChild(p);
    });

    gsap.from(paragraphLineRefs, {
      yPercent: 100,
      opacity: 0,
      duration: 0.8,
      ease: "power4.out",
      stagger: 0.1,
      delay: ANIMATION_DURATION.short,
    });

    const text = paragraphContainer?.textContent || "";
    const visibleParagraph = paragraphContainer;

    const h2Positions = projectH2s.map(h2 => {
      const rect = h2.getBoundingClientRect();
      return {
        element: h2,
        rect,
        originalTop: rect.top,
        originalLeft: rect.left
      };
    });

    const lineHeight = parseFloat(window.getComputedStyle(paragraphContainer).lineHeight);
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
      const translateX = placeholderRect.left - h2Info.originalLeft;
      const translateY = (placeholderRect.top - h2Info.originalTop) - lineHeight;

      gsap.to(h2Info.element, {
        x: translateX + (index === 0 ? 0 : 5),
        y: translateY,
        duration: ANIMATION_DURATION.long,
        ease: "power2.inOut",
        delay: index * 0.1
      });
    });
  };

  useGSAP(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animateParagraphWithH2s({
          redParagraph: redParagraphRef.current,
          paragraphContainer: paragraphRef.current,
          projectH2s: projectRefs.current,
          paragraphLineRefs: paragraphLineRefs.current
        });

        animateParagraphWithH2s({
          redParagraph: mobileRedParagraphRef.current,
          paragraphContainer: mobileParagraphRef.current,
          projectH2s: mobileProjectRefs.current,
          paragraphLineRefs: mobileParagraphLineRefs.current
        });
      });
    });
  }, { scope: container });

  return (
    <div ref={container} className="fixed top-0">
<div id="fixed" className="h-[100dvh] w-[100dvw] fixed top-0 pt-[11rem] md:pt-[45dvh] p-[2rem]">

{/* 🟢 MOBILE VIEW */}
<div className="md:hidden w-full">
  <div className="relative w-full">
    <div className="whitespace-nowrap text-left relative w-full">
      {['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'].map((name, i) => (
        <h2 key={i} ref={el => mobileProjectRefs.current[i] = el} className="small-text">
          {name}
        </h2>
      ))}
    </div>

    <div
      ref={mobileParagraphRef}
      className="small-text mt-4"
      style={{ whiteSpace: 'pre-wrap', paddingRight: '2rem' }}
    />

    <div
      ref={mobileRedParagraphRef}
      className="absolute top-0 text-red-500 small-text"
      style={{ whiteSpace: 'pre-wrap', width: '100%', paddingRight: '2rem' }}
    >
      <p>
        ALGEBRA is a website for math tutoring services. It's my first-ever website, made with WordPress. URBANEAR served as a landing page for a hackathon startup project. Created within six hours, it was also built with WordPress due to the need for a quick launch. EVENT AI is an Android app that leverages AI to generate calendar events from selected text, made with Kotlin and Jetpack Compose. The nuclear control room SIMULATOR is an interactive installation at the Energy and Technology Museum, my first workplace as an embedded systems developer. The TESLA COIL is a device showcasing electromagnetic induction, a hobby project for the "Upcycling 2023" contest. The CAR GAME is another museum installation featuring remote-controlled cars with a first-person view and a real-time control system.
      </p>
    </div>
  </div>
</div>

{/* 🔵 DESKTOP VIEW */}
<div className="hidden md:grid auto-cols-fr gap-4" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
  {[...Array(16)].map((_, index) => (
    <div key={index} className="h-full">
      {index === 5 && (
  <div className="w-full">
    <div className="whitespace-nowrap text-left relative w-full">
      {['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'].map((name, i) => (
        <h2 key={i} ref={el => projectRefs.current[i] = el} className="small-text">
          {name}
        </h2>
      ))}
    </div>

    <div
      ref={paragraphRef}
      className="small-text absolute top-[45dvh]"
      style={{ whiteSpace: 'pre-wrap', maxWidth: '100%' }}
    />

    <div
      ref={redParagraphRef}
      className="absolute top-[45dvh] invisible text-red-500 small-text"
      style={{
        whiteSpace: 'pre-wrap',
        maxWidth: '100%',
        paddingRight: '2rem',
      }}
    >
      <p>
        ALGEBRA is a website for math tutoring services. It's my first-ever website, made with WordPress. URBANEAR served as a landing page for a hackathon startup project. Created within six hours, it was also built with WordPress due to the need for a quick launch. EVENT AI is an Android app that leverages AI to generate calendar events from selected text, made with Kotlin and Jetpack Compose. The nuclear control room SIMULATOR is an interactive installation at the Energy and Technology Museum, my first workplace as an embedded systems developer. The TESLA COIL is a device showcasing electromagnetic induction, a hobby project for the "Upcycling 2023" contest. The CAR GAME is another museum installation featuring remote-controlled cars with a first-person view and a real-time control system.
      </p>
    </div>
  </div>
)}
    </div>
  ))}
</div>
</div>    </div>
  );
}