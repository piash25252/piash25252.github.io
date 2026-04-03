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

    return `
      <div class="${cls}" data-project-id="${esc(proj.id)}">
        <div class="proj-top">${topContent}</div>
        <h3>${esc(proj.title)}</h3>
        <p>${esc(proj.description)}</p>
        <div class="proj-tags">${tagsHTML}</div>
        ${resultsHTML}
      </div>`;
  }

  // ---------- render ----------

  async function renderProjects() {
    const grid = document.querySelector('#projects .projects-grid');
    if (!grid) return;

    // Show loading state
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 2rem;">Loading projects from database...</div>';

    const projects = await fetchProjectsFromSupabase();
    
    if (!projects.length) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 2rem;">No projects found in database.</div>';
      return;
    }

    grid.innerHTML = projects.map(cardHTML).join('');

    // Re-apply the fade-in observer from script.js so new cards animate
    if (typeof IntersectionObserver !== 'undefined') {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      grid.querySelectorAll('.proj-card').forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        obs.observe(el);
      });
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
