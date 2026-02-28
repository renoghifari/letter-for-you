import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from './sections/HeroSection';
import LetterSection from './sections/LetterSection';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const letterSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (progressRef.current) {
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [isLoaded]);

  const handleEnvelopeOpen = () => {
    setIsEnvelopeOpen(true);

    // Smooth, graceful letter section reveal — waits for letter animation
    if (letterSectionRef.current) {
      gsap.fromTo(
        letterSectionRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.4, ease: 'power2.out', delay: 1.8 }
      );
    }
  };

  return (
    <div ref={mainRef} className="relative min-h-screen">
      {/* Paper grain */}
      <div className="paper-grain" />

      {/* Scroll progress */}
      <div ref={progressRef} className="scroll-progress" style={{ transform: 'scaleX(0)' }} />

      {/* Main */}
      <main className="relative z-10">
        <HeroSection onEnvelopeOpen={handleEnvelopeOpen} />

        {/* Letter section — hidden until envelope opens */}
        <div
          ref={letterSectionRef}
          style={{
            opacity: isEnvelopeOpen ? 1 : 0,
            visibility: isEnvelopeOpen ? 'visible' : 'hidden',
            position: isEnvelopeOpen ? 'relative' : 'absolute',
            left: isEnvelopeOpen ? 'auto' : '-9999px',
          }}
        >
          <LetterSection />
        </div>
      </main>

      {/* Footer */}
      {isEnvelopeOpen && (
        <footer className="py-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3 items-center">
            </div>
            <p className="font-handwriting text-lg" style={{ color: 'var(--text-rose)', opacity: 0.5 }}>
              made by sweetest person - al
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
