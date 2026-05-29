import React, { useRef, useEffect, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './Shuffle.css';

gsap.registerPlugin(ScrollTrigger);

const Shuffle = ({
  text,
  className = '',
  style = {},
  shuffleDirection = 'right',
  duration = 0.35,
  maxDelay = 0,
  ease = 'power3.out',
  threshold = 0.1,
  tag = 'p',
  textAlign = 'center',
  onShuffleComplete,
  shuffleTimes = 1,
  loop = false,
  stagger = 0.03,
  triggerOnce = true,
  triggerOnHover = true
}) => {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const tlRef = useRef(null);

  useGSAP(() => {
    if (!ref.current || !text) return;

    const el = ref.current;
    const chars = text.split('').map(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.overflow = 'hidden';
      span.style.verticalAlign = 'bottom';
      return span;
    });

    el.innerHTML = '';
    chars.forEach(ch => el.appendChild(ch));

    const play = () => {
      if (tlRef.current) tlRef.current.kill();

      const tl = gsap.timeline({
        repeat: loop ? -1 : 0,
        onComplete: () => {
          onShuffleComplete?.();
        }
      });

      tl.from(chars, {
        opacity: 0,
        x: shuffleDirection === 'right' ? -20 : shuffleDirection === 'left' ? 20 : 0,
        y: shuffleDirection === 'down' ? -20 : shuffleDirection === 'up' ? 20 : 0,
        duration,
        ease,
        stagger,
        delay: Math.random() * maxDelay
      });

      tlRef.current = tl;
    };

    ScrollTrigger.create({
      trigger: el,
      start: `top ${100 - threshold * 100}%`,
      once: triggerOnce,
      onEnter: () => {
        play();
        setReady(true);
      }
    });

    if (triggerOnHover) {
      el.addEventListener('mouseenter', play);
    }

    return () => {
      if (tlRef.current) tlRef.current.kill();
    };
  }, [text, shuffleDirection, duration, stagger]);

  const Tag = tag || 'p';
  return (
    <Tag
      ref={ref}
      className={`shuffle-parent ${ready ? 'is-ready' : ''} ${className}`}
      style={{ textAlign, ...style }}
    >
      {text}
    </Tag>
  );
};

export default Shuffle;
