import React, { useState } from 'react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Index() {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState(null);
  
  const getLinkStyle = (path) => {
    const isActive = pathname === path;
    const isHovered = hoveredLink === path;
    return `small-text ${isActive || isHovered ? 'opacity-[1]' : 'opacity-[0.32]'}`;
  };

  return (
    <div id="fixed" className="w-[100dvw] fixed top-0 p-[2rem] grid auto-cols-fr gap-4 z-[10]" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
      {[...Array(16)].map((_, index) => (
        <div key={index} className="relative">
          <div className="md:hidden">
            {index === 15 && (
              <span className='whitespace-nowrap right-0 absolute'>
                <Link 
                  scroll={false} 
                  className={getLinkStyle('/')} 
                  href="/"
                  onMouseEnter={() => setHoveredLink('/')}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  Work,
                </Link>
                {' '}
                <Link 
                  scroll={false} 
                  className={getLinkStyle('/about')} 
                  href="/about"
                  onMouseEnter={() => setHoveredLink('/about')}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  About
                </Link>
              </span>
            )}
            {index === 0 && <h1 className='small-text whitespace-nowrap'>Domas Berulis</h1>}
          </div>
          <div className="hidden md:block">
            {index === 5 && (
              <>
                <span className='whitespace-nowrap'>
                  <Link 
                    scroll={false} 
                    className={getLinkStyle('/')} 
                    href="/"
                    onMouseEnter={() => setHoveredLink('/')}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    Work,
                  </Link>
                  {' '}
                  <Link 
                    scroll={false} 
                    className={getLinkStyle('/about')} 
                    href="/about"
                    onMouseEnter={() => setHoveredLink('/about')}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    About
                  </Link>
                </span>
                <h1 className='small-text fixed bottom-[2rem]'>Domas Berulis</h1>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
