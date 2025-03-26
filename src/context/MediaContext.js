import { createContext, useState } from 'react';

export const MediaContext = createContext({});

export function MediaProvider({ children }) {
  const [fileTypes, setFileTypes] = useState({});
  const [loadedMedia, setLoadedMedia] = useState({});

  return (
    <MediaContext.Provider value={{ fileTypes, setFileTypes, loadedMedia, setLoadedMedia }}>
      {children}
    </MediaContext.Provider>
  );
}