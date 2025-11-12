// All the editable content lives in data/content.json.
// This file only wires it into the DOM and handles "click-to-load" embeds.

function setHref(id, url, text) {
  const el = document.getElementById(id);
  if (!el || !url) return;
  el.href = url;
  if (text) el.textContent = text;
}

function loadIframe(targetId, src) {
  const target = document.getElementById(targetId);
  if (!target || !src) return;
  const iframe = document.createElement("iframe");
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.src = src;
  iframe.title = "Embedded content";
  iframe.style.width = "100%";
  iframe.style.height = targetId.includes("eventbrite") ? "720px" : "520px";
  iframe.style.border = "0";
  iframe.style.borderRadius = "12px";
  target.replaceChildren(iframe);
}

function loadLightWidget({ embedSrc, scriptSrc }) {
  const target = document.getElementById("instagram-embed");
  if (!target || !embedSrc) return;

  const iframe = document.createElement("iframe");
  iframe.className = "lightwidget-widget";
  iframe.src = embedSrc;
  iframe.title = "Instagram feed";
  iframe.loading = "lazy";
  iframe.allowTransparency = "true";
  iframe.style.width = "100%";
  iframe.style.border = "0";
  iframe.style.overflow = "hidden";
  target.replaceChildren(iframe);

  // Load LightWidget's auto-resize script once
  if (scriptSrc && !document.querySelector(`script[src="${scriptSrc}"]`)) {
    const s = document.createElement("script");
    s.src = scriptSrc;
    s.async = true;
    document.head.appendChild(s);
  }
}

// Always load at the top on same-page nav/reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}


document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  // load config
  let cfg = {};
  try {
    const res = await fetch("./data/content.json", { cache: "no-store" });
    cfg = await res.json();
  } catch {}

  // --- Hamburger menu (ported to match personal site) ---
const hamburgerToggle = document.getElementById('hamburger-toggle');
const slidingMenu     = document.getElementById('sliding-menu');
const menuOverlay     = document.getElementById('menu-overlay');

let menuOpen = false;
let animating = false;
const DURATION = 280; // keep in sync with CSS .32s

function openMenu(){
  if (animating || menuOpen) return;
  animating = true;

  // icon -> X
  const icon = hamburgerToggle.querySelector('i');
  icon.style.transform = 'rotate(90deg)';
  setTimeout(() => {
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-times');
    icon.style.transform = 'rotate(0deg)';
  }, 300);

  // classes for transitions
  slidingMenu.classList.add('is-open');
  menuOverlay.classList.add('is-active');
  document.body.classList.add('nav-open');

  menuOpen = true;
  setTimeout(() => { animating = false; }, DURATION);
}

function closeMenu(){
  if (animating || !menuOpen) return;
  animating = true;

  const icon = hamburgerToggle.querySelector('i');
  icon.style.transform = 'rotate(90deg)';
  setTimeout(() => {
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
    icon.style.transform = 'rotate(0deg)';
  }, 300);

  slidingMenu.classList.remove('is-open');
  menuOverlay.classList.remove('is-active');
  document.body.classList.remove('nav-open');

  menuOpen = false;
  setTimeout(() => { animating = false; }, DURATION);
}

hamburgerToggle?.addEventListener('click', (e) => {
  e.preventDefault();
  if (menuOpen) closeMenu(); else openMenu();
});
menuOverlay?.addEventListener('click', () => { if (menuOpen) closeMenu(); });
document.querySelectorAll('#sliding-menu a')
  .forEach(a => a.addEventListener('click', () => { if (menuOpen) closeMenu(); }));


    //resetting page
    function hardHomeReset(e){
    e?.preventDefault?.();
    if (typeof closeMenu === 'function') closeMenu();
    // land at absolute top immediately, then reload to reset embeds/forms
    window.scrollTo({ top: 0, behavior: 'auto' });
    location.replace(location.pathname);
    }

document.querySelector('.brand')?.addEventListener('click', hardHomeReset);
document.getElementById('menu-home')?.addEventListener('click', hardHomeReset);


  // About
  if (cfg.about) document.getElementById("about-text").textContent = cfg.about;

  // Instagram (LightWidget)
  if (cfg.instagram?.profile) {
    setHref("link-ig", cfg.instagram.profile);
    const contactIg = document.getElementById("contact-ig");
    if (contactIg) contactIg.href = cfg.instagram.profile;
  }
  if (cfg.instagram?.embedSrc) {
    loadLightWidget(cfg.instagram);
  }



  // Vendor form
  if (cfg.vendorForm?.embedSrc) {
    const form = document.getElementById("vendor-form");
    form.src = cfg.vendorForm.embedSrc;
  }
  const lf = document.getElementById("link-form");
  if (lf) lf.href = cfg.vendorForm?.embedSrc || cfg.vendorForm?.url;


  // Contact
  if (cfg.contact?.email) {
    const a = document.getElementById("contact-email");
    a.href = `mailto:${cfg.contact.email}`;
    a.textContent = cfg.contact.email;
  }
  if (cfg.contact?.phone) {
    const p = document.getElementById("contact-phone");
    p.href = `tel:${cfg.contact.phone.replace(/\s+/g,"")}`;
    p.textContent = cfg.contact.phone;
  }
});
