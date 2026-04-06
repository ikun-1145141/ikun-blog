import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/animations.css';

import { renderProjects } from './ui/projects';
import { renderServices } from './ui/services';
import { renderBlog }     from './ui/blog';
import { initScrollBehavior, initReveal } from './ui/scroll';
import { initStats } from './ui/stats';

// Render data-driven sections first so their .reveal elements
// are in the DOM before initReveal() observes them.
renderProjects();
renderServices();
renderBlog();

// Wire up scroll behaviour and reveal animations.
initScrollBehavior();
initReveal();

// Kick off async GitHub stats fetch (non-blocking).
void initStats();
