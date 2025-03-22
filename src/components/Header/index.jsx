import React from 'react'
import Link from 'next/link';

export default function Index() {
  return (
    <div id="fixed" className="h-[100dvh] w-[100dvw] fixed top-0 p-[2rem] grid auto-cols-fr gap-4 z-[10]" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
      {[...Array(16)].map((_, index) => (
        <div key={index} className="h-full">
          <div className="md:hidden">
            {index === 11 && <Link scroll={false} className='small-text' href="/">Works,</Link>}
            {index === 13 && <Link scroll={false} className='small-text' href="/about">About</Link>}
            {index === 0 && <h1 className='small-text whitespace-nowrap'>Domas Berulis</h1>}
          </div>
          <div className="hidden md:block">
            {index === 0 && <Link scroll={false} className='small-text' href="/">Works,</Link>}
            {index === 1 && <Link scroll={false} className='small-text' href="/about">About</Link>}
            {index === 5 && <h1 className='small-text bottom-[2rem] absolute'>Domas Berulis</h1>}
          </div>
        </div>
      ))}
    </div>
  )
}
