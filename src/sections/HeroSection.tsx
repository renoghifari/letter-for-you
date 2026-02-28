import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

interface HeroSectionProps {
  onEnvelopeOpen?: () => void;
}

interface Petal {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  rotation: number;
}

const HeroSection = ({ onEnvelopeOpen }: HeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [fragments, setFragments] = useState<Array<{ id: number; x: number; y: number; r: number; size: number }>>([]);
  const [heartParticles, setHeartParticles] = useState<Array<{ id: number; x: number; y: number; scale: number; color: string }>>([]);
  const [petals] = useState<Petal[]>(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 7 + Math.random() * 10,
      delay: Math.random() * 10,
      duration: 9 + Math.random() * 7,
      drift: (Math.random() - 0.5) * 70,
      rotation: Math.random() * 360,
    }))
  );

  // Initialize letter — hidden deep inside envelope on mount
  useEffect(() => {
    if (letterRef.current) {
      // Start with letter hidden inside (not visible from bottom)
      gsap.set(letterRef.current, { y: '10%', opacity: 0, scale: 0.95 });
    }
  }, []);

  // Typewriter effect for title
  useEffect(() => {
    if (!titleRef.current) return;
    const text = 'A Letter For You!';
    const chars = text.split('');
    titleRef.current.innerHTML = '';

    chars.forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      titleRef.current?.appendChild(span);
      gsap.to(span, { opacity: 1, duration: 0.05, delay: 0.3 + i * 0.08, ease: 'none' });
    });

    const cursor = document.createElement('span');
    cursor.className = 'ink-cursor';
    cursor.textContent = '|';
    cursor.style.color = 'var(--accent-burgundy)';
    cursor.style.marginLeft = '4px';
    titleRef.current.appendChild(cursor);

    gsap.to(cursor, {
      opacity: 0,
      duration: 0.3,
      delay: 1.8,
      onComplete: () => {
        cursor.remove();
        if (subtitleRef.current) {
          gsap.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
        }
      },
    });
  }, []);

  // Envelope entrance animation
  useEffect(() => {
    if (!envelopeRef.current) return;
    gsap.fromTo(
      envelopeRef.current,
      { scale: 0.88, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 1.0, delay: 0.6, ease: 'back.out(1.7)' }
    );
    if (sealRef.current) {
      gsap.fromTo(
        sealRef.current,
        { scale: 1.4, rotation: -8, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.5, delay: 1.3, ease: 'back.out(2)' }
      );
    }
  }, []);

  const handleSealClick = useCallback(() => {
    if (isOpen) return;

    // More dramatic wax fragments — varied sizes
    const newFragments = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 150,
      y: (Math.random() - 0.5) * 110 + 55,
      r: (Math.random() - 0.5) * 100,
      size: 3 + Math.random() * 9,
    }));
    setFragments(newFragments);

    // Heart burst particles
    const colors = ['var(--text-rose)', 'var(--accent-burgundy)', '#f9a8d4', 'var(--accent-gold)'];
    const newHearts = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 180,
      y: -30 - Math.random() * 90,
      scale: 0.5 + Math.random() * 0.9,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setHeartParticles(newHearts);

    // Seal: micro-bounce then shatter
    if (sealRef.current) {
      gsap.timeline()
        .to(sealRef.current, { scale: 1.18, duration: 0.1, ease: 'power2.out' })
        .to(sealRef.current, { scale: 0.5, opacity: 0, rotation: 10, duration: 0.38, ease: 'power3.in' });
    }

    // Open envelope — flap rotates
    setTimeout(() => {
      setIsOpen(true);

      // Letter rises from INSIDE the envelope - sliding upward
      setTimeout(() => {
        setShowLetter(true);
        if (letterRef.current) {
          const tl = gsap.timeline();
          // First make it visible inside
          tl.to(letterRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'power1.out',
          })
            // Then slide it up and out
            .to(letterRef.current, {
              y: '-55%',
              rotation: -0.5,
              duration: 1.5,
              ease: 'power2.out',
            }, '-=0.1');

          onEnvelopeOpen?.();
        }
      }, 600);
    }, 380);

    setTimeout(() => setFragments([]), 1100);
    setTimeout(() => setHeartParticles([]), 1500);
  }, [isOpen, onEnvelopeOpen]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:py-20 overflow-hidden"
    >
      {/* Ambient warm glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(230,213,184,0.18) 0%, transparent 70%)',
          zIndex: 1,
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(100,50,60,0.05) 100%)',
          zIndex: 1,
        }}
      />

      {/* Falling rose petals */}
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none petal-fall"
          style={{
            left: `${p.x}%`,
            top: '-5%',
            width: `${p.size}px`,
            height: `${p.size * 0.65}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--petal-drift': `${p.drift}px`,
            '--petal-rot': `${p.rotation}deg`,
            zIndex: 2,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 22 15" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <ellipse cx="11" cy="7.5" rx="11" ry="7" fill="var(--text-rose)" opacity="0.28" />
            <ellipse cx="9" cy="6" rx="5" ry="3" fill="rgba(255,255,255,0.12)" />
          </svg>
        </div>
      ))}

      {/* Background faint handwriting - hidden on mobile */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block" style={{ opacity: 0.038, zIndex: 1 }}>
        <div className="absolute top-20 left-10 font-handwriting text-4xl md:text-6xl rotate-[-5deg]" style={{ color: 'var(--text-charcoal)' }}>smartie cutie</div>
        <div className="absolute top-1/3 right-1/3 font-handwriting text-3xl md:text-5xl rotate-[4deg]" style={{ color: 'var(--text-charcoal)' }}>love</div>
        <div className="absolute bottom-24 right-1/4 font-handwriting text-xl md:text-3xl rotate-[-3deg]" style={{ color: 'var(--text-charcoal)' }}>with all my heart</div>
      </div>

      {/* Title */}
      <h1
        ref={titleRef}
        className="font-handwriting text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 sm:mb-4"
        style={{ color: 'var(--accent-burgundy)', position: 'relative', zIndex: 10 }}
      >

      </h1>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        className="font-serif italic text-base sm:text-lg md:text-xl mb-8 sm:mb-12"
        style={{ color: 'var(--text-charcoal)', opacity: 0, transform: 'translateY(20px)', position: 'relative', zIndex: 10 }}
      >
        Click the seal to open
      </p>

      {/* Envelope Container */}
      <div className="relative" style={{ perspective: '1200px', zIndex: 10 }}>
        {/* Wax fragments */}
        {fragments.map((frag) => (
          <div
            key={frag.id}
            className="wax-fragment absolute z-30"
            style={{
              backgroundColor: 'var(--wax-seal)',
              top: '40%',
              left: '50%',
              width: `${frag.size}px`,
              height: `${frag.size * 0.65}px`,
              borderRadius: '2px',
              '--fx': `${frag.x}px`,
              '--fy': `${frag.y}px`,
              '--fr': `${frag.r}deg`,
            } as React.CSSProperties}
          />
        ))}

        {/* Heart particles */}
        {heartParticles.map((h) => (
          <div
            key={h.id}
            className="heart-particle absolute z-30"
            style={{
              top: '38%',
              left: '50%',
              '--tx': `${h.x}px`,
              '--ty': `${h.y}px`,
            } as React.CSSProperties}
          >
            <svg width={`${18 * h.scale}`} height={`${18 * h.scale}`} viewBox="0 0 24 24" fill={h.color}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        ))}

        {/* Envelope */}
        <div
          ref={envelopeRef}
          className={`envelope-3d relative cursor-pointer ${isOpen ? 'open' : ''}`}
          onClick={!isOpen ? handleSealClick : undefined}
          style={{
            width: 'clamp(240px, 85vw, 450px)',
            height: 'clamp(170px, 58vw, 315px)',
            opacity: 0,
            filter: isOpen ? 'none' : 'drop-shadow(0 10px 28px rgba(139,69,87,0.14))',
            transition: 'filter 0.6s ease',
          }}
        >
          {/* Envelope body */}
          <div
            className="absolute inset-0 rounded-sm"
            style={{ background: `linear-gradient(135deg, var(--envelope-kraft-1) 0%, var(--envelope-kraft-2) 50%, var(--envelope-kraft-3) 100%)` }}
          />
          {/* Bottom flap - z-[15] to cover letter */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2 z-[15]"
            style={{ background: `linear-gradient(to top, var(--envelope-kraft-3), var(--envelope-kraft-2))`, clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}
          />
          {/* Side flaps - z-[15] to cover letter (z-[5]) but below top flap (z-20) */}
          <div
            className="absolute top-0 left-0 w-1/2 h-full z-[15]"
            style={{ background: `linear-gradient(to right, var(--envelope-kraft-2), var(--envelope-kraft-1))`, clipPath: 'polygon(0 0, 100% 50%, 0 100%)', opacity: 0.9 }}
          />
          <div
            className="absolute top-0 right-0 w-1/2 h-full z-[15]"
            style={{ background: `linear-gradient(to left, var(--envelope-kraft-2), var(--envelope-kraft-1))`, clipPath: 'polygon(100% 0, 0 50%, 100% 100%)', opacity: 0.9 }}
          />
          {/* Top flap */}
          <div
            className="envelope-flap absolute top-0 left-0 right-0 h-1/2 z-20"
            style={{
              background: `linear-gradient(to bottom, var(--envelope-kraft-1), var(--envelope-kraft-2))`,
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              transformOrigin: 'top center',
            }}
          />
          {/* Letter inside - positioned behind envelope flaps with z-[5] */}
          <div
            ref={letterRef}
            className="absolute inset-3 sm:inset-4 z-[5] rounded-sm shadow-lg overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-paper)',
              transform: 'translateY(10%)',
            }}
          >
            <div className="p-4 sm:p-6 -mt-8 sm:-mt-12 h-full flex flex-col items-center justify-center letter-paper">
              <p className="font-handwriting text-lg sm:text-2xl mb-2" style={{ color: 'var(--accent-burgundy)' }}>hey caila,</p>
              <div className="w-10 sm:w-12 h-px my-2" style={{ backgroundColor: 'rgba(212,165,165,0.5)' }} />
              <p className="font-body italic text-xs sm:text-sm text-center" style={{ color: 'var(--text-charcoal)', opacity: 0.6 }}>
                I made this for you. It might be too much, too soon but I'd rather be too much than too little when it comes to you.<br></br>
                ^^croll down! promise it's worth the scroll ^^
              </p>
            </div>
          </div>

          {/* Wax seal */}
          {!isOpen && (
            <div
              ref={sealRef}
              className="absolute z-30 wax-seal-pulse cursor-pointer"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -33%)', opacity: 0 }}
              onClick={(e) => { e.stopPropagation(); handleSealClick(); }}
            >
              <div className="relative group">
                <svg className="w-14 h-14 sm:w-[74px] sm:h-[74px]" viewBox="0 0 74 74">
                  {/* Ambient ring */}
                  <circle cx="37" cy="37" r="36" fill="var(--wax-seal)" opacity="0.12" />
                  {/* Main wax */}
                  <circle cx="37" cy="37" r="31" fill="var(--wax-seal)" opacity="0.97" />
                  {/* Detail rings */}
                  <circle cx="37" cy="37" r="26" fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1" />
                  <circle cx="37" cy="37" r="20" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.6" />
                  {/* Heart */}
                  <path d="M37 51.5 C27 40.5 18 34 18 26.5 C18 20.5 23 16 29 16 C32.2 16 35.2 17.8 37 21.2 C38.8 17.8 41.8 16 45 16 C51 16 56 20.5 56 26.5 C56 34 47 40.5 37 51.5Z" fill="rgba(255,255,255,0.93)" />
                  {/* Shine */}
                  <circle cx="29.5" cy="23" r="2.8" fill="rgba(255,255,255,0.38)" />
                </svg>
                {/* Hover glow ring */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 blur-lg"
                  style={{ backgroundColor: 'var(--wax-seal)', opacity: 0, transform: 'scale(1.1)' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      {showLetter && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 scroll-bounce" style={{ animationDelay: '2.5s', zIndex: 10 }}>
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="var(--text-rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      )}
    </section>
  );
};

export default HeroSection;