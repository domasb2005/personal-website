import "@/styles/globals.css";
import Header from '@/components/Header';
import { TransitionProvider } from '@/context/TransitionContext';
import Transition from '@/components/Transition';
import LoadingScreen from '@/components/loading';
import { useState } from 'react';

export default function App({ Component, pageProps, router}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading ? (
        <LoadingScreen onLoadComplete={() => setIsLoading(false)} />
      ) : (
        <TransitionProvider>
          <Header />
          <Transition>
            <Component key={router.route} {...pageProps} />
          </Transition>
        </TransitionProvider>
      )}
    </>
  );
}
