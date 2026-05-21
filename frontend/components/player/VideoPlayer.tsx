'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  url: string;
  lessonId: string;
  onComplete: () => void;
}

export default function VideoPlayer({ url, onComplete }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [speed, setSpeed] = useState(1);
  const [autoplay, setAutoplay] = useState(true);

  // Determine if Mux, Vimeo, or direct URL
  const isMux = url.includes('mux.com') || url.includes('stream.mux');
  const isVimeo = url.includes('vimeo.com');

  const getEmbedUrl = () => {
    if (isVimeo) {
      const id = url.split('/').pop();
      return `https://player.vimeo.com/video/${id}?autoplay=0&title=0&byline=0&portrait=0`;
    }
    if (isMux) return url;
    return url;
  };

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="w-full bg-black">
      {/* Video */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          ref={iframeRef}
          src={getEmbedUrl()}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Controls bar */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 flex items-center gap-4 flex-wrap">
        {/* Playback speed */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">Speed:</span>
          <div className="flex gap-1">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  speed === s
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Autoplay toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-gray-400 text-xs">Autoplay</span>
            <div
              onClick={() => setAutoplay(!autoplay)}
              className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                autoplay ? 'bg-brand-600' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                autoplay ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </div>
          </label>

          {/* Manual complete */}
          <button
            onClick={onComplete}
            className="text-xs text-green-400 hover:text-green-300 border border-green-800 hover:border-green-600 px-3 py-1 rounded-lg transition-colors"
          >
            ✓ Mark done
          </button>
        </div>
      </div>
    </div>
  );
}
