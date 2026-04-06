/** Top-bar elevation on scroll + FAB show/hide. */
export function initScrollBehavior(): void {
  const topBar = document.getElementById('topBar');
  const fab    = document.getElementById('fab');

  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      topBar?.classList.toggle('raised', y > 40);
      fab?.classList.toggle('show',     y > 300);
    },
    { passive: true },
  );

  fab?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const STAGGER_PARENTS = new Set([
  'card-grid',
  'project-grid',
  'chip-group',
  'services-grid',
  'tag-row',
]);

/**
 * Attach an IntersectionObserver to all `.reveal` elements.
 * Call this AFTER all dynamic HTML has been injected (projects, services).
 */
export function initReveal(): void {
  const els = document.querySelectorAll<HTMLElement>('.reveal');

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target as HTMLElement;
        const parent = el.parentElement;

        let delay = 0;
        if (parent) {
          for (const cls of STAGGER_PARENTS) {
            if (parent.classList.contains(cls)) {
              const siblings = Array.from(parent.querySelectorAll('.reveal'));
              delay = siblings.indexOf(el) * 80;
              break;
            }
          }
        }

        setTimeout(() => el.classList.add('in'), delay);
        io.unobserve(el);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
  );

  els.forEach(el => io.observe(el));
}
