import React from 'react'
import Link from 'next/link';

export default function Index() {
  return (
    <div id="fixed" className="w-[100dvw] fixed top-0 p-[2rem] grid auto-cols-fr gap-4 z-[10]" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
      {[...Array(16)].map((_, index) => (
        <div key={index} className="relative">
          <div className="md:hidden">
            {index === 15 && (
              <span className='whitespace-nowrap right-[2rem] absolute'>
                <Link scroll={false} className='small-text' href="/">Works,</Link>
                {' '}
                <Link scroll={false} className='small-text' href="/about">About</Link>
              </span>
            )}
            {index === 0 && <h1 className='small-text whitespace-nowrap'>Domas Berulis</h1>}
          </div>
          <div className="hidden md:block">
            {index === 5 && (
              <>
                <span className='whitespace-nowrap'>
                  <Link scroll={false} className='small-text' href="/">Works,</Link>
                  {' '}
                  <Link scroll={false} className='small-text' href="/about">About</Link>
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
