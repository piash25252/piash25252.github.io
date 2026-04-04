// ============================================================
// projects-section.js
// Dynamically renders the #projects grid from Supabase database.
// ============================================================

(function () {
  'use strict';

  // ---------- SUPABASE CONFIG ----------
  const SUPABASE_URL = 'https://zrfmuiyjkzziuiuayijp.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_xiLfbOBZAcO2LZyNGnhjag_TGXr9wMj';
  let supabase;

  // Initial client creation
  if (typeof window.supabase !== 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  /** Read projects from Supabase */
  async function fetchProjectsFromSupabase() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Supabase fetch error:', error);
        return [];
      }
      return data;
    } catch (err) {
      console.error('Fetch exception:', err);
      return [];
    }
  }

  /** Escape HTML entities */
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  // ---------- LOGOS ----------
  const LOGO_MAP = {
    'postman': 'https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg',
    'selenium': 'https://www.vectorlogo.zone/logos/seleniumhq/seleniumhq-icon.svg',
    'react': 'https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg',
    'jira': 'https://www.vectorlogo.zone/logos/atlassian_jira/atlassian_jira-icon.svg',
    'cypress': 'https://www.vectorlogo.zone/logos/cypressio/cypressio-icon.svg',
    'excel': 'https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg',
    'qa': 'https://cdn-icons-png.flaticon.com/512/2072/2072130.png',
    'manual': 'https://cdn-icons-png.flaticon.com/512/7510/7510009.png'
  };

  function getProjectIcon(techStack) {
    const ts = (techStack || '').toLowerCase();
    for (const [key, url] of Object.entries(LOGO_MAP)) {
      if (ts.includes(key)) return url;
    }
    // Generic Code / Box icon
    return 'https://cdn-icons-png.flaticon.com/512/1005/1005141.png';
  }

  /** Build a single project card's HTML */
  function cardHTML(proj) {
    // Map database columns to the UI layout
    // Supabase columns: title, description, tech_stack, github_url, live_url, featured, results
    const isFeatured = proj.featured || false;
    const cls = isFeatured ? 'proj-card featured' : 'proj-card';

    // Top bar
    let topContent = '';
    if (isFeatured) {
      topContent += '<span class="proj-badge">Featured</span>';
    }
    const links = [];
    if (proj.github_url) {
      links.push(`<a href="${esc(proj.github_url)}" target="_blank" rel="noopener">GitHub →</a>`);
    }
    if (proj.live_url) {
      links.push(`<a href="${esc(proj.live_url)}" target="_blank" rel="noopener">Live Demo ↗</a>`);
    }
    if (links.length) {
      topContent += `<div class="proj-links">${links.join(' ')}</div>`;
    }

    // Tags (split tech_stack by comma)
    const tagsArr = (proj.tech_stack || '').split(',').map(s => s.trim()).filter(Boolean);
    const tagsHTML = tagsArr
      .map((t) => `<span>${esc(t)}</span>`)
      .join('');

    // Results (JSONB column)
    let resultsHTML = '';
    if (proj.results && Array.isArray(proj.results)) {
      const items = proj.results
        .map((r) => `<div class="pr-item ${r.type === 'pass' ? 'pass' : 'fail'}">${esc(r.label)}</div>`)
        .join('');
      resultsHTML = `<div class="proj-results">${items}</div>`;
    }

    // Icon fallback if no image
    const iconUrl = getProjectIcon(proj.tech_stack);
    
    // Image support (if proj.image_url exists in database)
    const imgHTML = proj.image_url 
      ? `<img src="${esc(proj.image_url)}" class="proj-img" alt="${esc(proj.title)}">` 
      : `<div class="proj-icon-wrapper"><img src="${iconUrl}" alt="Tool Icon"></div>`;

    return `
      <div class="${cls}" data-project-id="${esc(proj.id)}">
        <div class="proj-top">
           ${imgHTML}
           <div>${topContent}</div>
        </div>
        <h3>${esc(proj.title)}</h3>
        <p>${esc(proj.description)}</p>
        <div class="proj-tags">${tagsHTML}</div>
        ${resultsHTML}
      </div>`;
  }

  // ---------- render ----------

  let allLoadedProjects = [];
  let currentFilter = 'all';

  async function renderProjects() {
    const section = document.getElementById('projects');
    if (!section) return;
    let grid = section.querySelector('.projects-grid');
    if (!grid) return;

    // Show loading state ONCE when first fetching
    if (allLoadedProjects.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 2rem;">Loading projects from database...</div>';
      allLoadedProjects = await fetchProjectsFromSupabase();
    }

    if (!allLoadedProjects.length) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 2rem;">No projects found in database.</div>';
      return;
    }

    // Insert Filter Buttons if not present
    let filterWrap = section.querySelector('.project-filters');
    if (!filterWrap) {
      filterWrap = document.createElement('div');
      filterWrap.className = 'project-filters';
      filterWrap.innerHTML = `
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="manual">Manual QA</button>
        <button class="filter-btn" data-filter="automation">Automation</button>
        <button class="filter-btn" data-filter="api">API Testing</button>
      `;
      // Insert before grid
      grid.parentNode.insertBefore(filterWrap, grid);

      // Attach events
      filterWrap.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          filterWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          currentFilter = e.target.getAttribute('data-filter');
          updateGrid();
        });
      });
    }

    updateGrid();

    function updateGrid() {
      let filtered = allLoadedProjects;

      if (currentFilter === 'manual') {
        filtered = filtered.filter(p => {
          const ts = (p.tech_stack || '').toLowerCase();
          return ts.includes('manual') || ts.includes('excel') || ts.includes('jira');
        });
      } else if (currentFilter === 'automation') {
        filtered = filtered.filter(p => {
          const ts = (p.tech_stack || '').toLowerCase();
          return ts.includes('selenium') || ts.includes('cypress') || ts.includes('playwright');
        });
      } else if (currentFilter === 'api') {
        filtered = filtered.filter(p => {
          const ts = (p.tech_stack || '').toLowerCase();
          return ts.includes('api') || ts.includes('postman');
        });
      }

      grid.innerHTML = filtered.map(cardHTML).join('');

      if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 2rem;">No projects found for this category.</div>';
      }

      // Re-trigger scroll reveal from script.js
      if (window.ObserveNewElements) window.ObserveNewElements();
    }
  }

  // Expose to window
  window.PortfolioProjects = {
    render: renderProjects,
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  };

  // Initial render
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderProjects);
  } else {
    renderProjects();
  }

})();
