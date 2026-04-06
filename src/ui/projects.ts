import { PROJECTS, type Project } from '../config';

// ── Template ──────────────────────────────────────────────────────

function projectCardHTML(p: Project): string {
  const starsLine = p.stars !== undefined
    ? `<div class="project-card__stars"><span class="material-symbols-rounded" style="font-size:15px;vertical-align:-2px">star</span> ${p.stars}${p.forks ? ` &nbsp;<span class="material-symbols-rounded" style="font-size:15px;vertical-align:-2px">fork_right</span> ${p.forks}` : ''}</div>`
    : '';

  const tags = p.tags
    .map(t => `<span class="tag">${t}</span>`)
    .join('');

  return /* html */`
    <a class="project-card reveal"
       href="${p.url}"
       target="_blank"
       rel="noopener noreferrer">
      <div class="project-card__shine"></div>
      <div class="project-card__body">
        <span class="project-card__icon material-symbols-rounded">${p.icon}</span>
        <div class="project-card__name">${p.name}</div>
        <div class="project-card__desc">${p.desc}</div>
        ${starsLine}
        <div class="tag-row">${tags}</div>
      </div>
    </a>`;
}

// ── Public API ────────────────────────────────────────────────────

/** Render all projects from config into #projects-grid. */
export function renderProjects(): void {
  const container = document.getElementById('projects-grid');
  if (!container) return;
  container.innerHTML = PROJECTS.map(projectCardHTML).join('');
}
