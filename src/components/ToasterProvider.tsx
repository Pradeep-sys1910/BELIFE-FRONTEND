'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#2D4220',
          color: '#FBF9F1',
          borderRadius: '12px',
        },
      }}
    />
  );
}
