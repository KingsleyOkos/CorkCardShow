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


document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  // load config
  let cfg = {};
  try {
    const res = await fetch("./data/content.json", { cache: "no-store" });
    cfg = await res.json();
  } catch {}

  // --- Mobile nav ---
  const toggleBtn  = document.getElementById('nav-toggle');
  const closeBtn   = document.getElementById('nav-close');
  const mobileNav  = document.getElementById('mobile-nav');

  function openNav(){
    document.body.classList.add('nav-open');
    mobileNav.classList.add('is-open');
    toggleBtn.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded','true');
    mobileNav.setAttribute('aria-hidden','false');
    }

  function closeNav(){
    document.body.classList.remove('nav-open');
    mobileNav.classList.remove('is-open');
    toggleBtn.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded','false');
    mobileNav.setAttribute('aria-hidden','true');
    }

  toggleBtn?.addEventListener('click', () => {
    const open = mobileNav.classList.contains('is-open');
    open ? closeNav() : openNav();
    });
  closeBtn?.addEventListener('click', closeNav);

  // close on link click
  mobileNav?.addEventListener('click', (e) => {
    if (e.target.matches('.mobile-link')) closeNav();
  });

  // close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) closeNav();
  });


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
