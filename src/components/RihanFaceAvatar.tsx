import React, { useEffect, useState } from 'react';

const RIHAN_PHOTO_SRC = './assets/aistudio/WhatsApp_Image_2026-02-02_at_11.39.10_PM_e38332e3.jpeg';

let cachedCroppedFaceUrl: string | null = null;
let cropPromise: Promise<string> | null = null;

function cropRihanFaceToDataUrl(): Promise<string> {
  if (cachedCroppedFaceUrl) return Promise.resolve(cachedCroppedFaceUrl);
  if (cropPromise) return cropPromise;

  cropPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(RIHAN_PHOTO_SRC);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const outSize = 256;
        canvas.width = outSize;
        canvas.height = outSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(RIHAN_PHOTO_SRC);
          return;
        }

        // Photo is 721x1600. Crop 562x562 starting at (0, 120) so Rihan's full face,
        // fluffy hair, both eyes, nose, smiling mouth, ears, and chin fit 100% cleanly.
        const side = Math.min(img.width * 0.78, img.height * 0.355);
        const sx = 0;
        const sy = Math.max(0, img.height * 0.075);

        ctx.drawImage(img, sx, sy, side, side, 0, 0, outSize, outSize);

        const dataUrl = canvas.toDataURL('image/png');
        cachedCroppedFaceUrl = dataUrl;
        resolve(dataUrl);
      } catch {
        resolve(RIHAN_PHOTO_SRC);
      }
    };
    img.onerror = () => resolve(RIHAN_PHOTO_SRC);
    img.src = RIHAN_PHOTO_SRC;
  });

  return cropPromise;
}

export function installRihanFaceFavicon() {
  cropRihanFaceToDataUrl().then((url) => {
    if (!url || typeof document === 'undefined') return;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  });
}

interface RihanFaceAvatarProps {
  className?: string;
  alt?: string;
}

export const RihanFaceAvatar: React.FC<RihanFaceAvatarProps> = ({
  className = 'w-12 h-12 rounded-2xl',
  alt = 'Rihan',
}) => {
  const [faceUrl, setFaceUrl] = useState<string | null>(cachedCroppedFaceUrl);

  useEffect(() => {
    let active = true;
    cropRihanFaceToDataUrl().then((url) => {
      if (active) setFaceUrl(url);
    });
    return () => {
      active = false;
    };
  }, []);

  if (faceUrl && faceUrl.startsWith('data:image')) {
    return (
      <img
        src={faceUrl}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`object-cover select-none ${className}`}
      />
    );
  }

  return (
    <div className={`overflow-hidden relative bg-amber-100 ${className}`}>
      <img
        src={RIHAN_PHOTO_SRC}
        alt={alt}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
        style={{
          objectPosition: '15% 22%',
          transform: 'scale(1.25)',
          transformOrigin: '18% 24%',
        }}
      />
    </div>
  );
};
