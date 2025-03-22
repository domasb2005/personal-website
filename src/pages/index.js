import { Inter } from "next/font/google";
import Picture from '../../public/images/2.jpg'
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { TransitionContext } from '@/context/TransitionContext';
import gsap from "gsap";
import { useContext, useRef } from 'react';

export default function Home() {
  const { timeline } = useContext(TransitionContext);
  const container = useRef(null);
  const image = useRef();

  useGSAP( () => {
    const targets = gsap.utils.toArray(["div"])
    // Entry animation
    gsap.fromTo(targets, 
      {y: -30, opacity: 0},
      {y: 0, opacity: 1, stagger: 0.05}
    )
    timeline.add(gsap.to(targets, {
      y: 30, 
      opacity: 0, 
    }))
  }, {scope: container})

  return (
    <div ref={container} className="fixed top-0">
      <div id="fixed" className="h-[100dvh] w-[100dvw] fixed top-0 pt-[45dvh] p-[2rem] grid auto-cols-fr gap-4" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
        {[...Array(16)].map((_, index) => (
          <div key={index} className="h-full bg-blue-500">
            <div className="md:hidden h-full">
              {index === 15 && (
                <div id="h2-wrap" className="whitespace-nowrap absolute bottom-0 right-0">
                  {['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'].map((name, i) => (
                    <h2 key={i} className="small-text block text-right">{name}</h2>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden md:block">
              {index === 5 && (
                <div id="h2-wrap" className="whitespace-nowrap text-left">
                  {['ALGEBRA', 'URBANEAR', 'EVENT AI', 'SIMULATOR', 'TESLA COIL', 'CAR GAME'].map((name, i) => (
                    <h2 key={i} className="small-text !leading-[1.8rem]">{name}</h2>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div id="scrollable" className=""></div>
    </div>
  );
}
