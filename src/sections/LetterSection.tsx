import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Custom Audio Player Component
interface AudioPlayerProps {
  audioUrl: string;
}

const CustomAudioPlayer = ({ audioUrl }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isDragging]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // Always start from beginning when play is clicked
      if (audio.currentTime > 0 && audio.currentTime < audio.duration) {
        audio.currentTime = 0;
      }
      audio.play().catch(() => {
        // Handle autoplay restrictions
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleProgressMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleProgressMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleProgressMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [isDragging, duration]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Controls */}
      <div className="flex items-center gap-3 mb-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, var(--accent-burgundy), var(--text-rose))',
            boxShadow: '0 4px 15px rgba(139, 69, 87, 0.3)',
          }}
        >
          {isPlaying ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Time Display */}
        <div className="font-body text-xs sm:text-sm" style={{ color: 'var(--text-charcoal)', opacity: 0.7, minWidth: '80px' }}>
          {formatTime(currentTime)} / {formatTime(duration || 0)}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        ref={progressRef}
        className="relative h-2 sm:h-2.5 rounded-full cursor-pointer mb-4"
        style={{ backgroundColor: 'rgba(212, 165, 165, 0.25)' }}
        onClick={handleProgressClick}
        onMouseDown={handleProgressMouseDown}
        onMouseUp={handleProgressMouseUp}
        onMouseLeave={handleProgressMouseUp}
        onMouseMove={handleProgressMouseMove}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-100"
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(to right, var(--text-rose), var(--accent-burgundy))',
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow-md transition-all duration-100"
          style={{
            left: `calc(${progressPercent}% - 6px)`,
            boxShadow: '0 2px 8px rgba(139, 69, 87, 0.4)',
          }}
        />
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Volume Icon */}
        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="var(--accent-burgundy)" strokeWidth="2">
          {volume === 0 ? (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="var(--accent-burgundy)" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          ) : volume < 0.5 ? (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="var(--accent-burgundy)" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </>
          ) : (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="var(--accent-burgundy)" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </>
          )}
        </svg>

        {/* Volume Slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 h-1.5 sm:h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--accent-burgundy) ${volume * 100}%, rgba(212, 165, 165, 0.3) ${volume * 100}%)`,
          }}
        />

        {/* Volume Percentage */}
        <span className="font-body text-xs" style={{ color: 'var(--text-charcoal)', opacity: 0.6, minWidth: '32px' }}>
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* Visualizer - animated when playing */}
      <div className="flex justify-center items-end gap-1 sm:gap-1.5 h-8 sm:h-10 mt-4">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`w-2 sm:w-2.5 rounded-t transition-all duration-150 ${isPlaying ? 'visualizer-bar' : ''}`}
            style={{
              background: 'linear-gradient(to top, var(--text-rose), var(--accent-burgundy))',
              height: isPlaying ? undefined : '20%',
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const LetterSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const salutationRef = useRef<HTMLParagraphElement>(null);
  const paragraphsRef = useRef<(HTMLParagraphElement | null)[]>([]);
  const musicPlayerRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<SVGSVGElement>(null);

  // Audio URL - using a direct link to the song
  // Note: You'll need to provide your own audio file or use a hosted version
  const audioUrl = 'https://audio.jukehost.co.uk/hG2ru0iYuYCTdBMifrie3f50vX5EiSNy'; // Placeholder - replace with actual song URL

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Salutation — rises like ink appearing
      if (salutationRef.current) {
        gsap.fromTo(
          salutationRef.current,
          { opacity: 0, y: 24, rotation: -2, filter: 'blur(2px)' },
          {
            opacity: 1, y: 0, rotation: -1, filter: 'blur(0px)',
            duration: 1.0, ease: 'power2.out',
            scrollTrigger: { trigger: salutationRef.current, start: 'top 82%', toggleActions: 'play none none reverse' },
          }
        );
      }

      // Paragraphs — staggered ink flow, each with slight rotation variation
      paragraphsRef.current.forEach((para, index) => {
        if (para) {
          const dir = index % 2 === 0 ? 1 : -1;
          gsap.fromTo(
            para,
            { opacity: 0, y: 36, x: dir * 8, filter: 'blur(1px)' },
            {
              opacity: 1, y: 0, x: 0, filter: 'blur(0px)',
              duration: 0.9, delay: index * 0.05, ease: 'power2.out',
              scrollTrigger: { trigger: para, start: 'top 87%', toggleActions: 'play none none reverse' },
            }
          );
        }
      });

      // Music player — slides in with paper-like spring
      if (musicPlayerRef.current) {
        gsap.fromTo(
          musicPlayerRef.current,
          { opacity: 0, y: 40, rotation: -2 },
          {
            opacity: 1, y: 0, rotation: -1,
            duration: 1.0, ease: 'back.out(1.4)',
            scrollTrigger: { trigger: musicPlayerRef.current, start: 'top 82%', toggleActions: 'play none none reverse' },
          }
        );
      }

      // Signature — writes itself in
      if (signatureRef.current) {
        gsap.fromTo(
          signatureRef.current,
          { opacity: 0, y: 16, x: 10 },
          {
            opacity: 1, y: 0, x: 0,
            duration: 1.0, ease: 'power2.out',
            scrollTrigger: { trigger: signatureRef.current, start: 'top 92%', toggleActions: 'play none none reverse' },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const setParagraphRef = (index: number) => (el: HTMLParagraphElement | null) => {
    paragraphsRef.current[index] = el;
  };

  return (
    <section ref={sectionRef} className="relative py-12 sm:py-20 px-3 sm:px-4 md:px-8">
      {/* Letter container */}
      <div ref={letterRef} className="max-w-2xl mx-auto relative">

        {/* Letter paper */}
        <div
          className="relative rounded-sm letter-paper"
          style={{
            backgroundColor: 'var(--bg-paper)',
            boxShadow: '0 4px 40px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04), inset 0 0 60px rgba(230,213,184,0.12)',
            transform: 'rotate(-0.5deg)',
            padding: 'clamp(1.25rem, 4vw, 4rem)',
          }}
        >
          {/* Corner fold decoration */}
          <div
            className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 pointer-events-none"
            style={{
              background: 'linear-gradient(225deg, var(--accent-gold) 45%, transparent 46%)',
              opacity: 0.4,
            }}
          />

          {/* Salutation */}
          <p
            ref={salutationRef}
            className="font-handwriting text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-8"
            style={{ color: 'var(--accent-burgundy)' }}
          >
            to caila,
          </p>

          {/* Paragraph 1 */}
          <p
            ref={setParagraphRef(0)}
            className="font-handwriting text-lg sm:text-xl md:text-2xl leading-relaxed mb-5 sm:mb-6"
            style={{ color: 'var(--text-charcoal)', lineHeight: '2' }}
          >
            I've been staring at this blank page for what feels like hours. Don't know why writing to you is this hard. But okay. Honest words.
          </p>

          {/* Paragraph 2 */}
          <p
            ref={setParagraphRef(1)}
            className="font-handwriting text-lg sm:text-xl md:text-2xl leading-relaxed mb-5 sm:mb-6"
            style={{ color: 'var(--text-charcoal)', lineHeight: '2' }}
          >
            I've seen you these past few days. Running around like crazy with classes and activities and whatever else. Honestly don't know how you do it. You look tired but you keep going anyway. That's actually kind of amazing. But hey. Even you need to breathe sometimes right?
          </p>

          {/* Music Player */}
          <div
            ref={musicPlayerRef}
            className="my-8 sm:my-10 mx-auto max-w-sm sm:max-w-md"
            style={{ transform: 'rotate(-1deg)' }}
          >
            {/* Masking tape */}
            <div className="relative">
              <div
                className="absolute -top-2 sm:-top-3 left-3 sm:left-4 w-28 sm:w-36 h-5 sm:h-7 tape-flutter"
                style={{
                  backgroundColor: 'var(--text-rose)',
                  opacity: 0.65,
                  clipPath: 'polygon(2% 0%, 98% 5%, 100% 95%, 0% 100%)',
                }}
              />
              <span className="absolute -top-0.5 sm:-top-1 left-5 sm:left-7 font-handwriting text-xs sm:text-sm text-white/90 z-10 select-none">
                ♪ now playing
              </span>
            </div>

            {/* Player card */}
            <div
              className="rounded-xl pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6"
              style={{
                backgroundColor: 'rgba(253, 251, 247, 0.97)',
                border: '1px solid rgba(212, 165, 165, 0.25)',
                boxShadow: '0 8px 36px rgba(0,0,0,0.09), 0 2px 8px rgba(139,69,87,0.06)',
              }}
            >
              {/* Song info */}
              <div className="text-center mb-3 sm:mb-4">
                <h3 className="font-handwriting text-2xl sm:text-3xl md:text-4xl mb-1" style={{ color: 'var(--accent-burgundy)' }}>
                  Mrs Magic
                </h3>
                <p className="font-body italic text-xs sm:text-sm" style={{ color: 'var(--text-rose)' }}>
                  Strawberry Guy · Strings Version
                </p>
              </div>

              {/* Custom Audio Player */}
              <CustomAudioPlayer audioUrl={audioUrl} />

              {/* Personal note */}
              <p className="font-body italic text-xs sm:text-sm text-center mt-3 sm:mt-4" style={{ color: 'var(--text-charcoal)', opacity: 0.65 }}>
                "This song feels like you, quiet magic in a noisy world"
              </p>
            </div>
          </div>

          {/* Secret message — glows on hover */}
          <p
            ref={setParagraphRef(2)}
            className="font-handwriting text-lg sm:text-xl md:text-2xl leading-relaxed mb-6 sm:mb-8 secret-message text-center py-4 sm:py-5"
            style={{
              color: 'var(--accent-burgundy)',
              opacity: 0.55,
              fontStyle: 'italic',
              borderTop: '1px solid rgba(212,165,165,0.2)',
              borderBottom: '1px solid rgba(212,165,165,0.2)',
            }}
          >
            "Keep going. I'm watching you shine."
          </p>

          {/* Paragraph 3 */}
          <p
            ref={setParagraphRef(3)}
            className="font-handwriting text-lg sm:text-xl md:text-2xl leading-relaxed mb-5 sm:mb-6"
            style={{ color: 'var(--text-charcoal)', lineHeight: '2' }}
          >
            So this is that. A break. A reminder that you're doing better than you think. Hope we get to talk more. Even though we just met.
          </p>

          {/* Paragraph 4 */}
          <p
            ref={setParagraphRef(4)}
            className="font-handwriting text-lg sm:text-xl md:text-2xl leading-relaxed mb-5 sm:mb-6"
            style={{ color: 'var(--text-charcoal)', lineHeight: '2' }}
          >
            I don't want to fix you or slow you down. I just want to walk beside you while you build what matters. Be someone you can talk to when everything feels heavy. Who remembers the small things you mention. Who reminds you that you're doing better than you think.
          </p>

          {/* Paragraph 5 */}
          <p
            ref={setParagraphRef(5)}
            className="font-handwriting text-lg sm:text-xl md:text-2xl leading-relaxed mb-8 sm:mb-12"
            style={{ color: 'var(--text-charcoal)', lineHeight: '2' }}
          >
            That's why I made this. So if you ever need another boost, another reminder, another deep breath, come back here. Let this be your pocket of peace. Your little cheerleader. Yours.
          </p>

          {/* Signature */}
          <div ref={signatureRef} className="text-right mt-6 sm:mt-8">
            <p className="font-handwriting text-xl sm:text-2xl md:text-3xl mb-1" style={{ color: 'var(--accent-burgundy)' }}>

            </p>
            <p className="font-handwriting text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3" style={{ color: 'var(--accent-burgundy)' }}>
              al
            </p>
            <svg ref={dividerRef} className="inline-block w-24 sm:w-32 md:w-[130px]" viewBox="0 0 130 22">
              <path
                className="signature-flourish"
                d="M0 11 Q20 3, 45 11 Q65 19, 85 11 T130 11"
                fill="none"
                stroke="var(--accent-burgundy)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>

        {/* Decorative hearts - scaled down on mobile */}



      </div>

      {/* Floating hearts - ambient - smaller on mobile */}
      <div className="absolute top-1/4 right-4 sm:right-8 md:right-16 opacity-18 floating-heart">
        <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="var(--text-rose)">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <div className="absolute bottom-1/3 left-4 sm:left-8 md:left-16 opacity-13 floating-heart" style={{ animationDelay: '2.5s' }}>
        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-[14px] md:h-[14px]" viewBox="0 0 24 24" fill="var(--accent-gold)">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      <div className="absolute top-2/3 right-1/4 opacity-10 floating-heart" style={{ animationDelay: '4s' }}>
        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" viewBox="0 0 24 24" fill="var(--accent-burgundy)">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
    </section>
  );
};

export default LetterSection;