// ===================================
// COMPONENTS.JS
// Write-once header + footer via Web Components.
// No async fetch — markup is inlined so the element
// is in the DOM before layout, killing the placeholder
// ghost-space and the GSAP timing race.
// ===================================

/* ── Shared SVG sprite (rendered once, referenced everywhere) ── */
const SVG_SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <!-- GitHub -->
  <symbol id="ic-github" viewBox="0 0 24 24">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </symbol>
  <!-- LinkedIn -->
  <symbol id="ic-linkedin" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </symbol>
  <!-- CodePen — isometric 3D box, filled faces -->
  <symbol id="ic-codepen" viewBox="0 0 24 24">
    <polygon points="12,2 21,7 12,12 3,7"  fill="currentColor" opacity="1"/>
    <polygon points="3,7 12,12 12,22 3,17"  fill="currentColor" opacity="0.55"/>
    <polygon points="21,7 21,17 12,22 12,12" fill="currentColor" opacity="0.3"/>
    <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="none" stroke="currentColor" stroke-width="0.7" stroke-linejoin="round" opacity="0.6"/>
    <line x1="12" y1="2"  x2="12" y2="12" stroke="currentColor" stroke-width="0.7" opacity="0.6"/>
    <line x1="3"  y1="7"  x2="12" y2="12" stroke="currentColor" stroke-width="0.7" opacity="0.6"/>
    <line x1="21" y1="7"  x2="12" y2="12" stroke="currentColor" stroke-width="0.7" opacity="0.6"/>
    <line x1="3"  y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="0.7" opacity="0.6"/>
  </symbol>
  <!-- Contra — 4-pointed sparkle with curved triangular arms -->
  <symbol id="ic-contra" viewBox="0 0 24 24">
    <path fill="currentColor" d="
      M12,12 Q9,9.5 9,9 L12,1.5 L15,9 Q15,9.5 12,12 Z
      M12,12 Q14.5,9 15,9 L22.5,12 L15,15 Q14.5,15 12,12 Z
      M12,12 Q15,14.5 15,15 L12,22.5 L9,15 Q9,14.5 12,12 Z
      M12,12 Q9.5,15 9,15 L1.5,12 L9,9 Q9.5,9 12,12 Z
    "/>
  </symbol>
  <!-- Instagram -->
  <symbol id="ic-instagram" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </symbol>
  <!-- Blog — 📄 dog-ear page -->
  <symbol id="ic-blog" viewBox="0 0 24 24">
    <polygon points="4,2 16,2 16,7 20,7 20,22 4,22" fill="currentColor" opacity="0.9"/>
    <polygon points="16,2 20,7 16,7" fill="currentColor" opacity="0.45"/>
    <polyline points="16,2 20,7 16,7" fill="none" stroke="white" stroke-width="0.6" opacity="0.7"/>
    <line x1="7" y1="10" x2="17" y2="10" stroke="white" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
    <line x1="7" y1="13" x2="17" y2="13" stroke="white" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
    <line x1="7" y1="16" x2="13" y2="16" stroke="white" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
  </symbol>
</svg>`;

/* ── Reusable pixel-grid HTML (links + icons) ── */
function pixelGridHTML(small = false) {
  const cls = small ? "pixel-grid pixel-grid--sm" : "pixel-grid";
  return `
	<nav class="${cls}" aria-label="Social links">
	  <a href="https://www.linkedin.com/in/viktorsekovski/" class="px-link" style="--px-color:#0A66C2"
	    target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-linkedin"/></svg></span>
	      <span class="px-label">LinkedIn</span>
	    </span>
	    <span class="px-tip">Let's connect</span>
	  </a>
	  <a href="https://github.com/visaint" class="px-link" style="--px-color:#f48f6e"
	    target="_blank" rel="noopener noreferrer" aria-label="GitHub">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-github"/></svg></span>
	      <span class="px-label">GitHub</span>
	    </span>
	    <span class="px-tip">See my code</span>
	  </a>
	  <a href="https://notes.visaint.space" class="px-link" style="--px-color:#ee8198"
	    target="_blank" rel="noopener noreferrer" aria-label="Blog">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-blog"/></svg></span>
	      <span class="px-label">Blog</span>
	    </span>
	    <span class="px-tip">Read my words</span>
	  </a>
	  <a href="https://codepen.io/visaint" class="px-link" style="--px-color:#5a9fd4"
	    target="_blank" rel="noopener noreferrer" aria-label="CodePen">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-codepen"/></svg></span>
	      <span class="px-label">CodePen</span>
	    </span>
	    <span class="px-tip">Leads to CodePen</span>
	  </a>
	  <a href="https://contra.com/viktorsekovski_8r714jwo/about?r=viktorsekovski_8r714jwo"
	    class="px-link" style="--px-color:#f48f6e"
	    target="_blank" rel="noopener noreferrer" aria-label="Contra">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-contra"/></svg></span>
	      <span class="px-label">Contra</span>
	    </span>
	    <span class="px-tip">Hire me here</span>
	  </a>
	  <a href="https://www.instagram.com/visaintstudio/" class="px-link" style="--px-color:#e1306c"
	    target="_blank" rel="noopener noreferrer" aria-label="Instagram">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-instagram"/></svg></span>
	      <span class="px-label">Instagram</span>
	    </span>
	    <span class="px-tip">Follow my art</span>
	  </a>
</nav>`;
}

// ===================================
// <site-header>
// ===================================
class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
${SVG_SPRITE}
<input type="checkbox" id="menu-toggle" class="menu-toggle" />
<nav>
  <div id="logo-div">
    <a href="/" id="logo-link">
      <h4 id="logo">VS</h4>
    </a>
  </div>
  <div class="nav-right">
    <a href="./contact.html" class="btn-pb">
      <span class="nav-label">contact</span>
      <i class="ri-mail-line icon-mobile"></i>
    </a>
    <a href="./work.html" class="btn-op">
      <span class="nav-label">work</span>
    </a>
    <a href="https://notes.visaint.space" class="btn-bo hide-small"
       target="_blank" rel="noopener noreferrer">
      <span class="nav-label">blog</span>
      <i class="ri-arrow-right-up-line"></i>
      <i class="ri-file-text-line icon-mobile"></i>
    </a>
    <a href="./about.html" class="btn-pb desktop-only">
      <span class="nav-label">about</span>
    </a>
    <label id="menu-btn" for="menu-toggle" aria-label="Open menu">
      <span class="hamburger-icon" aria-hidden="true">
        <span class="ham-line"></span>
        <span class="ham-line"></span>
        <span class="ham-line"></span>
      </span>
    </label>
  </div>
</nav>

<label for="menu-toggle" class="menu-overlay" aria-hidden="true"></label>

<div class="slide-menu" role="dialog" aria-modal="true" aria-label="Site navigation">
  <div class="menu-underglow"></div>

  <label for="menu-toggle" class="menu-close" aria-label="Close menu">
    <span class="close-x">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <line x1="1.5" y1="1.5" x2="12.5" y2="12.5"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="12.5" y1="1.5" x2="1.5" y2="12.5"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </span>
  </label>

  <div class="menu-content">
    <ul class="main-menu">
      <li class="menu-item" style="--i:0">
        <a href="/index.html" class="menu-btn-link btn-op">Home</a>
      </li>
      <li class="menu-item" style="--i:1">
        <a href="/work.html" class="menu-btn-link btn-bo">Work</a>
      </li>
      <li class="menu-item" style="--i:2">
        <a href="/services.html" class="menu-btn-link btn-pb">Services</a>
      </li>
      <li class="menu-item" style="--i:3">
        <a href="/about.html" class="menu-btn-link btn-op">About</a>
      </li>
      <li class="menu-item" style="--i:4">
        <a href="/contact.html" class="menu-btn-link btn-pb">Contact</a>
      </li>
      <li class="menu-item" style="--i:5">
        <a href="https://notes.visaint.space" class="menu-btn-link btn-bo"
           target="_blank" rel="noopener noreferrer">
          Blog<i class="ri-arrow-right-up-line"></i>
        </a>
      </li>
    </ul>
  </div>

  <div class="menu-social">
    ${pixelGridHTML(false)}
  </div>
</div>
    `;

    this._setActivePage();
  }

  _setActivePage() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    this.querySelectorAll(".menu-btn-link").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("is-active");
      }
    });
  }
}

// ===================================
// <site-footer>
// ===================================
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<footer>
  <div class="foot-card">
    <div class="foot-identity">
      <h1 class="foot-name">Vi Saint</h1>
      <h4 class="foot-title">Designer &amp; Developer</h4>
      <p class="foot-tagline">Interfaces, interaction, motion &amp; performance</p>
      <a href="mailto:hello@visaint.space" class="foot-email">hello@visaint.space</a>
    </div>
    <div class="foot-links">
      ${pixelGridHTML(false)}
    </div>
  </div>
  <div class="foot-bottom">
    <p class="foot-copy">&copy; 2026 Viktor Sekovski. All rights reserved.</p>
  </div>
</footer>
    `;
  }
}

// Register both
customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
