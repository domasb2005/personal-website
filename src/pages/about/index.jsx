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
  const hasAnimated = useRef(false);

  const projectNames = ['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'];

  const getProcessedHTML = (text, isMobile) => {
    let html = text;
    projectNames.forEach((name, index) => {
      const placeholderClass = isMobile ? 'mobile-invisible-placeholder' : 'desktop-invisible-placeholder';
      const span = `<span class="invisible-placeholder ${placeholderClass}" data-placeholder="${index}">${name}</span>`;
      html = html.replace(name, span);
    });
    return html;
  };

  const getParagraphPixelWidth = (isMobile) => {
    if (isMobile) {
      const vw = window.innerWidth;
      const padding = 2 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      return vw - padding;
    } else {
      const grid = document.querySelector('.md\\:grid');
      if (!grid) return 600;
      const columns = grid.querySelectorAll('div.h-full');
      const startCol = columns[5];
      const endCol = columns[15];
      const left = startCol.getBoundingClientRect().left;
      const right = endCol.getBoundingClientRect().right;
      return right - left;
    }
  };

  const setupParagraph = (ref, originalText) => {
    console.log('🔄 Starting paragraph setup for:', ref?.className);
    const isMobile = window.innerWidth < 768;
    const html = getProcessedHTML(originalText, isMobile);
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.whiteSpace = 'pre-wrap';

    const width = getParagraphPixelWidth(isMobile) * (isMobile ? 0.7 : 0.75);
    temp.style.width = `${width}px`;
    document.body.appendChild(temp);
    console.log('📐 Temporary element setup:', { width, isMobile });

    const range = document.createRange();
    const lines = [];
    let line = '';
    let lastTop = null;

    const walker = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      for (let i = 0; i < node.textContent.length; i++) {
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rect = range.getBoundingClientRect();

        if (lastTop === null) lastTop = rect.top;

        if (Math.abs(rect.top - lastTop) > 1) {
          lines.push(line);
          line = '';
          lastTop = rect.top;
        }
        line += node.textContent[i];
      }
    }

    if (line) {
      lines.push(line);
    }

    console.log('✅ Text splitting complete:', {
      totalLines: lines.length,
    });
    range.detach();
    document.body.removeChild(temp);

    ref.innerHTML = '';
    lines.forEach(line => {
      const p = document.createElement('p');
      p.className = 'overflow-hidden';
      const span = document.createElement('span');
      span.className = 'inline-block';
      span.innerHTML = getProcessedHTML(line, isMobile);
      p.appendChild(span);
      ref.appendChild(p);
    });
    console.log(' Paragraph span styling complete');
  };

  const playExitAnimation = () => {
    const exitTimeline = gsap.timeline();
    const paragraphLines = container.current?.querySelectorAll('p > span') || [];
    const slidingChildren = container.current?.querySelectorAll('.slidingChildren > *') || [];
    const allH2s = [...projectRefs.current, ...mobileProjectRefs.current].filter(Boolean);

    exitTimeline.to(paragraphLines, {
      y: '-100%',
      opacity: 0,
      duration: ANIMATION_DURATION.short,
      ease: 'power4.in',
      stagger: 0.02,
    }, 0);

    exitTimeline.to(slidingChildren, {
      y: '-100%',
      opacity: 0,
      duration: ANIMATION_DURATION.short,
      ease: 'power4.in',
      stagger: 0.015,
    }, 0);

    const nonFirstH2s = allH2s.filter(h2 => h2.textContent !== projectNames[0]);

    exitTimeline.to(allH2s, {
      x: 0,
      y: 0,
      duration: ANIMATION_DURATION.short,
      ease: 'power2.inOut',
      stagger: ANIMATION_DURATION.short / allH2s.length,
      onStart: function() {
        const element = this.targets()[0];
        if (element.classList.contains('text-left')) {
          element.classList.remove('text-left');
          element.classList.add('text-right');
        }
      }
    }, 0.1);

    exitTimeline.to(nonFirstH2s, {
      opacity: 0.32,
      duration: ANIMATION_DURATION.short,
      ease: 'power2.inOut',
    }, 0.2);

    return exitTimeline;
  };

  useGSAP(() => {
    if (hasAnimated.current) return;
    
    // Wait for next frame to ensure layout is stable
    requestAnimationFrame(() => {
      // Double RAF to ensure all style calculations are complete
      requestAnimationFrame(() => {
        hasAnimated.current = true;
        const isMobile = window.innerWidth < 768;

    (async () => {
      if (isMobile && !mobileParagraphRef.current?.hasChildNodes()) {
        await setupParagraph(mobileParagraphRef.current, originalText);
      } else if (!isMobile && !paragraphRef.current?.hasChildNodes()) {
        await setupParagraph(paragraphRef.current, originalText);
      }
          const paragraphNode = isMobile ? mobileParagraphRef.current : paragraphRef.current;
          const h2Refs = isMobile ? mobileProjectRefs.current : projectRefs.current;

          const lines = Array.from(paragraphNode.querySelectorAll('p > span'));
          const lineStagger = ANIMATION_DURATION.long / lines.length;

          // ENTRY: Paragraph lines
          gsap.fromTo(lines,
            { 
              y: '100%',
              opacity: 0
            },
            {
              y: '0%',
              opacity: 1,
              duration: ANIMATION_DURATION.short,
              ease: 'power4.out',
              stagger: lineStagger,
              delay: ANIMATION_DURATION.short,
              onStart: () => {
                console.log('▶️ Paragraph lines animation started');
              },
              onComplete: () => {
                console.log('✅ Paragraph lines animation completed');
              },
            }
          );

          // ENTRY: H2 animation to placeholder
          console.log('🎯 Starting H2 animation setup:', {
            isMobile,
            paragraphType: paragraphNode === mobileParagraphRef.current ? 'mobile' : 'desktop',
            h2RefsCount: h2Refs.length
          });

          // Update the placeholder selector
          const placeholders = Array.from(paragraphNode.querySelectorAll(
            isMobile ? '.mobile-invisible-placeholder' : '.desktop-invisible-placeholder'
          )).filter(span => {
            const style = window.getComputedStyle(span);
            const isVisible = style.display !== 'none';
            console.log('🔍 Checking placeholder:', {
              type: isMobile ? 'mobile' : 'desktop',
              text: span.textContent,
              isVisible,
              display: style.display
            });
            return isVisible;
          });

          console.log('📍 Found placeholders:', {
            count: placeholders.length,
            texts: placeholders.map(p => p.textContent)
          });

          const h2Rects = h2Refs
            .filter(Boolean)
            .filter(h2 => {
              const style = window.getComputedStyle(h2);
              const isVisible = style.display !== 'none';
              return isVisible;
            })
            .map(h2 => ({
              element: h2,
              rect: h2.getBoundingClientRect(),
            }));


          const lineHeight = parseFloat(window.getComputedStyle(paragraphNode).lineHeight);

          placeholders.forEach((span, index) => {

            const spanRect = span.getBoundingClientRect();
            const h2 = h2Rects[index];
            if (!h2) {
              return;
            }

            const dx = spanRect.left - h2.rect.left;
            const dy = (spanRect.top - h2.rect.top) - lineHeight;

            console.log('📐 Animation calculations:', {
              dx,
              dy,
              lineHeight,
              placeholderPos: {
                left: spanRect.left,
                top: spanRect.top
              },
              h2Pos: {
                left: h2.rect.left,
                top: h2.rect.top
              }
            });

            gsap.to(h2.element, {
              x: dx,
              y: dy,
              duration: ANIMATION_DURATION.long,
              ease: 'power2.inOut',
              delay: index * 0.1,
              onStart: function() {
                if (h2.element.classList.contains('text-right')) {
                  h2.element.classList.remove('text-right');
                  h2.element.classList.add('text-left');
                }
                console.log(`▶️ Animation started for "${h2.element.textContent}"`, {
                  index,
                  delay: index * 0.1
                });
              },
              onComplete: () => {
                console.log(`✅ Animation completed for "${h2.element.textContent}"`);
              },
            });
          });
          // ENTRY: Sliding children
          const slidingElements = container.current?.querySelectorAll('.slidingChildren');
          const targets = [];
          slidingElements.forEach(el => {
            Array.from(el.children).forEach(child => {
              child.style.display = 'inline-block';
              targets.push(child);
            });
          });
          

          gsap.fromTo(targets,
            { y: '100%' },
            {
              y: '0%',
              duration: ANIMATION_DURATION.long,
              ease: 'power4.out',
              stagger: ANIMATION_DURATION.long / targets.length,
              delay: ANIMATION_DURATION.short / 3,
              onStart: () => {
                console.log('▶️ Sliding children animation started');
              },
              onComplete: () => {
                console.log(' Sliding children animation completed');
              },
            }
          );
          gsap.fromTo(slidingElements,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
            }
          );

          // EXIT timeline setup
          if (timeline) {
            timeline.add(playExitAnimation(), 'exit');
          }

    })();
  });
    });
  }, {
    scope: container,
    once: true
  });

  const originalText = `ALGEBRA is a website for math tutoring services. It's my first-ever website, made with WordPress. URBANEAR served as a landing page for a hackathon startup project. Created within six hours, it was also built with WordPress due to the need for a quick launch. EVENT AI is an Android app that leverages AI to generate calendar events from selected text, made with Kotlin and Jetpack Compose. The nuclear control room SIMULATOR is an interactive installation at the Energy and Technology Museum, my first workplace as an embedded systems developer. The TESLA COIL is a device showcasing electromagnetic induction, a hobby project for the "Upcycling 2023" contest. The CAR GAME is another museum installation featuring remote-controlled cars with a first-person view and a real-time control system.`;



  return (
    <div ref={container} className="fixed top-0">
      <div id="fixed" className="h-[100dvh] w-[100dvw] fixed top-0 pt-[11rem] md:pt-[calc(45dvh-2.6rem)] p-[2rem]">

        {/* Mobile View */}
        <div className="md:hidden">
          <div className="small-text uppercase opacity-[0.32]">
          <div className='overflow-hidden slidingChildren'><h2>Bio</h2></div>
          </div>
          <div className="small-text pt-[1rem] pb-[4rem]">
            <p className="overflow-hidden slidingChildren"><span className="inline-block">I used to work as an embedded systems developer with</span></p>
            <p className="overflow-hidden slidingChildren"><span className="inline-block">a strong electrical engineering background. Studying at</span></p>
            <p className="overflow-hidden slidingChildren"><span className="inline-block">the Technical University Eindhoven. Currently learning</span></p>
            <p className="overflow-hidden slidingChildren"><span className="inline-block">web and mobile app development.</span></p>
          </div>
          <div className="small-text uppercase opacity-[0.32]">
          <div className='overflow-hidden slidingChildren'><h2>Projects</h2></div>
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
          <div className='small-text absolute bottom-[2rem] right-[2rem] overflow-hidden slidingChildren'>
            <a href='https://www.linkedin.com/in/domas-berulis-8127b41b9/' className="opacity-[0.32] hover:opacity-[1] transition-opacity">Linked in,</a>{' '}
            <span></span>
            <a href='https://github.com/domasb2005' className="opacity-[0.32] hover:opacity-[1] transition-opacity">Git, </a>{' '}
            <a className='opacity-[0.32] hover:opacity-[1]' href='https://x.com/Domas04641249'>X</a>
          </div>


          <div className='col-start-0 col-span-4'>
            <div className="small-text uppercase opacity-[0.32]">
            <div className='overflow-hidden slidingChildren'><h2>Bio</h2></div>
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
            <div className="small-text uppercase opacity-[0.32] pb-[1rem]">
              <div className='overflow-hidden slidingChildren'><h2>Projects</h2></div>
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