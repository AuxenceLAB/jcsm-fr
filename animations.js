/**
 * JCSM Premium Animations
 * Advanced scroll reveal, counters, particles, and micro-interactions
 */

(function() {
  'use strict';

  // ============================================
  // SCROLL REVEAL ANIMATION
  // ============================================
  
  class ScrollReveal {
    constructor(options = {}) {
      this.elements = [];
      this.options = {
        threshold: options.threshold || 0.15,
        rootMargin: options.rootMargin || '0px 0px -50px 0px',
        once: options.once !== false
      };
      
      this.init();
    }
    
    init() {
      // Find all reveal elements
      const selectors = [
        '.reveal',
        '.reveal-left',
        '.reveal-right',
        '.reveal-scale',
        '.reveal-stagger',
        '.section-appear'
      ];
      
      this.elements = document.querySelectorAll(selectors.join(', '));
      
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(
          this.handleIntersect.bind(this),
          {
            threshold: this.options.threshold,
            rootMargin: this.options.rootMargin
          }
        );
        
        this.elements.forEach(el => this.observer.observe(el));
      } else {
        // Fallback: show all elements
        this.elements.forEach(el => {
          el.classList.add('active', 'visible');
        });
      }
    }
    
    handleIntersect(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active', 'visible');
          
          if (this.options.once) {
            this.observer.unobserve(entry.target);
          }
        } else if (!this.options.once) {
          entry.target.classList.remove('active', 'visible');
        }
      });
    }
    
    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  // ============================================
  // ANIMATED COUNTER
  // ============================================
  
  class AnimatedCounter {
    constructor(element, options = {}) {
      this.element = element;
      this.target = parseInt(element.dataset.target || element.textContent, 10);
      this.duration = options.duration || 2000;
      this.easing = options.easing || this.easeOutExpo;
      this.started = false;
      
      this.init();
    }
    
    init() {
      // Use Intersection Observer to start when visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.started) {
            this.started = true;
            this.animate();
            observer.unobserve(this.element);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(this.element);
    }
    
    animate() {
      const startTime = performance.now();
      const startValue = 0;
      
      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const easedProgress = this.easing(progress);
        const currentValue = Math.floor(startValue + (this.target - startValue) * easedProgress);
        
        this.element.textContent = currentValue.toLocaleString('fr-FR');
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };
      
      requestAnimationFrame(update);
    }
    
    easeOutExpo(x) {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }
  }

  // ============================================
  // RIPPLE EFFECT
  // ============================================
  
  function createRipple(event) {
    const button = event.currentTarget;
    
    // Remove existing ripples
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    // Create container if not exists
    let container = button.querySelector('.ripple-container');
    if (!container) {
      container = document.createElement('span');
      container.classList.add('ripple-container');
      button.appendChild(container);
    }
    
    container.appendChild(ripple);
    
    // Remove after animation
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  // ============================================
  // SMOOTH PARALLAX
  // ============================================
  
  class SmoothParallax {
    constructor() {
      this.elements = document.querySelectorAll('.parallax-image, [data-parallax]');
      this.rafId = null;
      this.scrollY = 0;
      this.targetY = 0;
      
      if (this.elements.length === 0) return;
      
      this.init();
    }
    
    init() {
      // Use passive scroll listener
      window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
      this.update();
    }
    
    onScroll() {
      this.targetY = window.scrollY;
      
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(this.animate.bind(this));
      }
    }
    
    animate() {
      // Smooth interpolation
      this.scrollY += (this.targetY - this.scrollY) * 0.1;
      
      this.elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const speed = parseFloat(el.dataset.parallaxSpeed) || 0.3;
        
        // Only animate if in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const yPos = (this.scrollY - (rect.top + this.scrollY - window.innerHeight / 2)) * speed;
          el.style.transform = `translateY(${yPos}px)`;
        }
      });
      
      // Continue animation if still scrolling
      if (Math.abs(this.targetY - this.scrollY) > 0.5) {
        this.rafId = requestAnimationFrame(this.animate.bind(this));
      } else {
        this.rafId = null;
      }
    }
    
    update() {
      this.targetY = window.scrollY;
      this.scrollY = window.scrollY;
    }
  }

  // ============================================
  // CURSOR GLOW EFFECT (Desktop only)
  // ============================================
  
  class CursorGlow {
    constructor() {
      // Only on desktop with hover capability
      if (!window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) {
        return;
      }
      
      this.cursor = null;
      this.mouseX = 0;
      this.mouseY = 0;
      this.cursorX = 0;
      this.cursorY = 0;
      
      this.init();
    }
    
    init() {
      // Create cursor element
      this.cursor = document.createElement('div');
      this.cursor.classList.add('cursor-glow');
      document.body.appendChild(this.cursor);
      
      // Track mouse
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      });
      
      this.animate();
    }
    
    animate() {
      // Smooth follow
      this.cursorX += (this.mouseX - this.cursorX) * 0.1;
      this.cursorY += (this.mouseY - this.cursorY) * 0.1;
      
      if (this.cursor) {
        this.cursor.style.left = this.cursorX + 'px';
        this.cursor.style.top = this.cursorY + 'px';
      }
      
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  // ============================================
  // MAGNETIC BUTTONS
  // ============================================
  
  class MagneticButton {
    constructor(element) {
      this.element = element;
      this.strength = 30;
      
      this.init();
    }
    
    init() {
      this.element.addEventListener('mousemove', this.onMouseMove.bind(this));
      this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    }
    
    onMouseMove(e) {
      const rect = this.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      
      this.element.style.transform = `translate(${deltaX * this.strength}px, ${deltaY * this.strength}px)`;
    }
    
    onMouseLeave() {
      this.element.style.transform = 'translate(0, 0)';
    }
  }

  // ============================================
  // TEXT SPLIT ANIMATION
  // ============================================
  
  class TextSplit {
    constructor(element, options = {}) {
      this.element = element;
      this.type = options.type || 'chars'; // 'chars', 'words', 'lines'
      this.delay = options.delay || 0.03;
      
      this.init();
    }
    
    init() {
      const text = this.element.textContent;
      this.element.innerHTML = '';
      this.element.setAttribute('aria-label', text);
      
      let items;
      if (this.type === 'chars') {
        items = text.split('');
      } else if (this.type === 'words') {
        items = text.split(' ');
      }
      
      items.forEach((item, index) => {
        const span = document.createElement('span');
        span.textContent = item === ' ' ? '\u00A0' : item + (this.type === 'words' ? ' ' : '');
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        span.style.transform = 'translateY(20px)';
        span.style.transition = `opacity 0.4s ease, transform 0.4s ease`;
        span.style.transitionDelay = `${index * this.delay}s`;
        this.element.appendChild(span);
      });
      
      // Trigger animation when visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animate();
            observer.unobserve(this.element);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(this.element);
    }
    
    animate() {
      const spans = this.element.querySelectorAll('span');
      spans.forEach(span => {
        span.style.opacity = '1';
        span.style.transform = 'translateY(0)';
      });
    }
  }

  // ============================================
  // SCROLL PROGRESS BAR
  // ============================================
  
  class ScrollProgress {
    constructor(selector) {
      this.element = document.querySelector(selector);
      if (!this.element) return;
      
      window.addEventListener('scroll', this.update.bind(this), { passive: true });
      this.update();
    }
    
    update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      this.element.style.width = progress + '%';
    }
  }

  // ============================================
  // SMOOTH LOGO MARQUEE
  // ============================================
  
  class LogoMarquee {
    constructor(selector) {
      this.container = document.querySelector(selector);
      if (!this.container) return;
      
      this.track = this.container.querySelector('.logo-marquee-track');
      if (!this.track) return;
      
      this.speed = 0.5; // pixels per frame
      this.position = 0;
      this.isPaused = false;
      
      this.init();
    }
    
    init() {
      // Clone items for seamless loop
      const items = this.track.children;
      const itemsArray = Array.from(items);
      
      // Clone items
      itemsArray.forEach(item => {
        const clone = item.cloneNode(true);
        this.track.appendChild(clone);
      });
      
      // Pause on hover
      this.container.addEventListener('mouseenter', () => this.isPaused = true);
      this.container.addEventListener('mouseleave', () => this.isPaused = false);
      
      // Touch pause
      this.container.addEventListener('touchstart', () => this.isPaused = true, { passive: true });
      this.container.addEventListener('touchend', () => this.isPaused = false, { passive: true });
      
      this.animate();
    }
    
    animate() {
      if (!this.isPaused) {
        this.position -= this.speed;
        
        // Reset position when first set is fully scrolled
        const itemWidth = this.track.scrollWidth / 2;
        if (Math.abs(this.position) >= itemWidth) {
          this.position = 0;
        }
        
        this.track.style.transform = `translateX(${this.position}px)`;
      }
      
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  
  function init() {
    // Scroll reveal
    new ScrollReveal();
    
    // Animated counters
    document.querySelectorAll('.counter').forEach(el => {
      new AnimatedCounter(el);
    });
    
    // Ripple effect on buttons
    document.querySelectorAll('.btn-primary, .btn-premium, [data-ripple]').forEach(btn => {
      btn.addEventListener('click', createRipple);
    });
    
    // Smooth parallax
    new SmoothParallax();
    
    // Cursor glow (desktop only)
    new CursorGlow();
    
    // Magnetic buttons
    document.querySelectorAll('.magnetic-wrap, [data-magnetic]').forEach(el => {
      new MagneticButton(el);
    });
    
    // Text split animations
    document.querySelectorAll('[data-split]').forEach(el => {
      new TextSplit(el, { type: el.dataset.split });
    });
    
    // Scroll progress
    new ScrollProgress('#scroll-progress');
    
    // Logo marquee
    new LogoMarquee('.logo-marquee');
    
    // Remove preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add('hide');
        document.body.classList.add('loaded');
        
        setTimeout(() => preloader.remove(), 300);
      }, 500);
    } else {
      document.body.classList.add('loaded');
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
