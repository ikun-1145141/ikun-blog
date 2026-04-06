import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/animations.css';
import '../styles/post.css';

const topBar = document.getElementById('topBar');
const fab    = document.getElementById('fab') as HTMLButtonElement | null;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  topBar?.classList.toggle('raised', y > 40);
  fab?.classList.toggle('show', y > 300);
}, { passive: true });

fab?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
