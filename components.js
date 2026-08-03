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
  <!-- Bluesky -->
  <symbol id="ic-bluesky" viewBox="0 0 24 24">
    <path fill="currentColor" d="M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"/>
  </symbol>
  <!-- Mastodon -->
  <symbol id="ic-mastodon" viewBox="0 0 24 24">
    <path fill="currentColor" d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>
  </symbol>
  <!-- X (Twitter) -->
  <symbol id="ic-x" viewBox="0 0 24 24">
    <path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </symbol>
  <!-- Arrow up-right -->
  <symbol id="ic-arrow-up-right" viewBox="0 0 24 24">
    <path d="M7 17 17 7M17 7H8m9 0v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <!-- Arrow right -->
  <symbol id="ic-arrow-right" viewBox="0 0 24 24">
    <path d="M4 12h16m-7-7 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <!-- Close -->
  <symbol id="ic-close" viewBox="0 0 24 24">
    <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </symbol>
  <!-- Mail -->
  <symbol id="ic-mail" viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="m3.5 7.5 8.5 5.75 8.5-5.75" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <!-- File text -->
  <symbol id="ic-file-text" viewBox="0 0 24 24">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M14 3v5h5M9 13h6M9 17h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <!-- Globe -->
  <symbol id="ic-globe" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M3 12h18M12 3a15.5 15.5 0 0 1 0 18 15.5 15.5 0 0 1 0-18Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  </symbol>
  <!-- Shopping bag -->
  <symbol id="ic-shopping-bag" viewBox="0 0 24 24">
    <path d="M5 8h14l-.8 12H5.8L5 8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M9 10V6a3 3 0 0 1 6 0v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </symbol>
  <!-- Mental health (heart + pulse) -->
  <symbol id="ic-mental-health" viewBox="0 0 24 24">
    <path d="M12 20s-7-4.35-9.2-8.45C1.3 9.05 2.7 6 5.7 5.6c2-.4 4.1.6 6.3 2.9 2.2-2.3 4.3-3.3 6.3-2.9 3 .4 4.4 3.45 2.9 5.95C19 15.65 12 20 12 20Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M8 11.5h2l1.5 2.5 2-4 1.5 2.5h1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <!-- Pen nib -->
  <symbol id="ic-pen-nib" viewBox="0 0 24 24">
    <path d="m4 20 4-1.2L18.5 8.3a2.1 2.1 0 0 0-3-3L5 15.7 4 20Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="m14.5 7.5 2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="18.5" cy="5.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/>
  </symbol>
  <!-- Gamepad -->
  <symbol id="ic-gamepad" viewBox="0 0 24 24">
    <path d="M6.5 7h11a4.5 4.5 0 0 1 4.5 4.5V15a3 3 0 0 1-5.3 1.9L15.6 15.5h-7.2l-1.1 1.4A3 3 0 0 1 2 15v-3.5A4.5 4.5 0 0 1 6.5 7Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M7 9.5v3M5.5 11h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="16.75" cy="10.5" r="0.75" fill="currentColor"/>
    <circle cx="18.75" cy="12.5" r="0.75" fill="currentColor"/>
  </symbol>
  <!-- Sparkling -->
  <symbol id="ic-sparkling" viewBox="0 0 24 24">
    <path d="M12 3.2c.55 3.6 2 5.05 5.6 5.6-3.6.55-5.05 2-5.6 5.6-.55-3.6-2-5.05-5.6-5.6 3.6-.55 5.05-2 5.6-5.6Z" fill="currentColor"/>
    <path d="M19.5 13.5c.3 1.9 1.2 2.8 3.1 3.1-1.9.3-2.8 1.2-3.1 3.1-.3-1.9-1.2-2.8-3.1-3.1 1.9-.3 2.8-1.2 3.1-3.1Z" fill="currentColor"/>
    <path d="M5.2 14.2c.22 1.4.9 2.08 2.3 2.3-1.4.22-2.08.9-2.3 2.3-.22-1.4-.9-2.08-2.3-2.3 1.4-.22 2.08-.9 2.3-2.3Z" fill="currentColor"/>
  </symbol>
</svg>`;

/* ── Reusable pixel-grid HTML (links + icons) ── */
function pixelGridHTML(blog = false) {
  const cls = "pixel-grid";
  return `
	<nav class="${cls}" aria-label="Social links">
	  <a href="https://www.linkedin.com/in/vi-saint-130a33426/" class="px-link" style="--px-color:#0A66C2"
	    target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-linkedin"/></svg></span>
	      <span class="px-label">LinkedIn</span>
	    </span>
	    <span class="px-tip">Let's connect</span>
	  </a>
	  <a href="https://bsky.app/profile/visaint.bsky.social" class="px-link" style="--px-color:#0285FF"
	    target="_blank" rel="noopener noreferrer" aria-label="Bluesky">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-bluesky"/></svg></span>
	      <span class="px-label">Bluesky</span>
	    </span>
	    <span class="px-tip">Find me on Bluesky</span>
	  </a>
	  <a href="https://github.com/visaint" class="px-link" style="--px-color:#f48f6e"
	    target="_blank" rel="noopener noreferrer" aria-label="GitHub">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-github"/></svg></span>
	      <span class="px-label">GitHub</span>
	    </span>
	    <span class="px-tip">See my code</span>
	  </a>
	  <a href="https://codepen.io/visaint" class="px-link" style="--px-color:#5a9fd4"
	    target="_blank" rel="noopener noreferrer" aria-label="CodePen">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-codepen"/></svg></span>
	      <span class="px-label">CodePen</span>
	    </span>
	<span class="px-tip">My experiments</span>
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
	  <a href="https://mastodon.social/@vis7" class="px-link" style="--px-color:#6364FF"
	    target="_blank" rel="noopener noreferrer" aria-label="Mastodon">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-mastodon"/></svg></span>
	      <span class="px-label">Mastodon</span>
	    </span>
	    <span class="px-tip">Find me on Mastodon</span>
	  </a>
	  <a href="https://x.com/visaintstudio" class="px-link" style="--px-color:#8b949e"
	    target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-x"/></svg></span>
	      <span class="px-label">X</span>
	    </span>
	    <span class="px-tip">Follow me on X</span>
	  </a>
	  ${
	    blog
	      ? `<a href="https://notes.visaint.space" class="px-link px-link--wide" style="--px-color:#ee8198"
	    target="_blank" rel="noopener noreferrer" aria-label="Blog">
	    <span class="px-body">
	      <span class="px-icon"><svg><use href="#ic-blog"/></svg></span>
	      <span class="px-label">Blog</span>
	    </span>
	    <span class="px-tip">Read my notes</span>
	  </a>`
	      : ""
	  }
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
    <a href="/" id="logo-link" aria-label="Vi Saint &#8212; home">
      <h4 id="logo">VS</h4>
    </a>
  </div>
  <div class="nav-right">
    <a href="./contact.html" class="btn-pb desktop-only">
      <span class="nav-label">contact</span>
      <svg class="icon-mobile" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-mail"/></svg>
    </a>
    <a href="./work.html" class="btn-bo">
      <span class="nav-label">work</span>
    </a>
    <a href="./services.html" class="btn-pb nav-services">
      <span class="nav-label">services</span>
    </a>
    <a href="./about.html" class="btn-op">
      <span class="nav-label">about</span>
    </a>
    <a href="https://notes.visaint.space" class="btn-bo desktop-only"
       target="_blank" rel="noopener noreferrer">
      <span class="nav-label">blog</span>
      <svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-arrow-up-right"/></svg>
      <svg class="icon-mobile" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-file-text"/></svg>
    </a>
  </div>
  <label id="menu-btn" for="menu-toggle" aria-label="Open menu">
    <span class="hamburger-icon" aria-hidden="true">
      <span class="ham-line"></span>
      <span class="ham-line"></span>
      <span class="ham-line"></span>
    </span>
  </label>
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
          Blog<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-arrow-up-right"/></svg>
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
      <h4 class="foot-title">Creative Technologist</h4>
      <p class="foot-tagline">Interfaces, interaction, motion &amp; performance</p>
      <a href="mailto:hello@visaint.space" class="foot-email">hello@visaint.space</a>
    </div>
    <div class="foot-links">
      ${pixelGridHTML(false, true)}
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

// ── Hover tooltips: keep inside the viewport ──
// .px-tip cards are centered on their tile (translateX(-50%)) and can be
// wider than the space to the viewport edge, so tiles near the right (or
// left) edge clip. Clamp the tooltip horizontally, and vertically when
// it would poke above the top of the screen.
document.addEventListener("mouseover", (e) => {
  const link = e.target.closest?.(".px-link");
  if (!link) return;
  const tip = link.querySelector(".px-tip");
  if (!tip) return;
  requestAnimationFrame(() => {
    const r = tip.getBoundingClientRect();
    const margin = 12;
    let dx = 0;
    if (r.right > window.innerWidth - margin) {
      dx = window.innerWidth - margin - r.right;
    }
    if (r.left < margin) dx = margin - r.left;
    let dy = 0;
    if (r.top < margin) dy = margin - r.top;
    if (dx || dy) {
      tip.style.transform = `translateX(calc(-50% + ${dx}px)) translateY(${dy}px)`;
    }
  });
});

document.addEventListener("mouseout", (e) => {
  const link = e.target.closest?.(".px-link");
  if (!link) return;
  const tip = link.querySelector(".px-tip");
  if (!tip) return;
  // Still inside the same link (e.g. moving between icon and label)?
  if (e.relatedTarget && e.relatedTarget.closest?.(".px-link") === link) return;
  tip.style.removeProperty("transform");
});
