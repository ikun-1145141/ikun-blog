import { SERVICES, type Service } from '../config';

// ── Template ──────────────────────────────────────────────────────

export function serviceCardHTML(s: Service): string {
  return /* html */`
    <a class="service-card reveal"
       href="${s.url}"
       target="_blank"
       rel="noopener noreferrer">
      <div class="service-card__shine"></div>
      <div class="service-card__body">
        <span class="service-card__icon material-symbols-rounded">${s.icon}</span>
        <div class="service-card__name">${s.name}</div>
        <div class="service-card__url">${s.url.replace('https://', '')}</div>
        <div class="service-card__desc">${s.desc}</div>
        <span class="tag">${s.tag}</span>
      </div>
      <div class="service-card__footer">
        <span class="material-symbols-rounded" style="font-size:16px">open_in_new</span>
        访问服务
      </div>
    </a>`;
}

// ── Public API ────────────────────────────────────────────────────

/** Render first 3 services from config into #services-grid (homepage). */
export function renderServices(): void {
  const container = document.getElementById('services-grid');
  if (!container) return;
  container.innerHTML = SERVICES.slice(0, 3).map(serviceCardHTML).join('');
}
