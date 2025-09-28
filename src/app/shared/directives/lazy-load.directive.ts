import { Directive, ElementRef, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

/**
 * Directive for lazy loading content using Intersection Observer API
 * Optimizes performance by loading content only when it becomes visible
 */
@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Output() lazyLoad = new EventEmitter<void>();
  
  private observer?: IntersectionObserver;
  private hasLoaded = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers that don't support Intersection Observer
      this.loadContent();
      return;
    }

    const options: IntersectionObserverInit = {
      root: null, // Use viewport as root
      rootMargin: '50px', // Load content 50px before it becomes visible
      threshold: 0.1 // Trigger when 10% of element is visible
    };

    this.observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasLoaded) {
            this.loadContent();
            this.observer?.unobserve(entry.target);
          }
        });
      },
      options
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  private loadContent(): void {
    if (!this.hasLoaded) {
      this.hasLoaded = true;
      this.lazyLoad.emit();
    }
  }
}