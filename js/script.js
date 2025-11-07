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

function renderInstagramPosts(posts){
  const wrap = document.getElementById("instagram-embed");
  if (!wrap || !Array.isArray(posts)) return;
  posts.forEach(url => {
    const bq = document.createElement("blockquote");
    bq.className = "instagram-media";
    bq.setAttribute("data-instgrm-permalink", url);
    bq.setAttribute("data-instgrm-version", "14");
    bq.style.border = "0"; bq.style.borderRadius = "12px"; bq.style.width = "100%";
    wrap.appendChild(bq);
  });
  // load once or reprocess if already loaded
  if (!document.querySelector('script[src="https://www.instagram.com/embed.js"]')) {
    const s = document.createElement("script");
    s.src = "https://www.instagram.com/embed.js"; s.async = true;
    document.head.appendChild(s);
  } else if (window.instgrm?.Embeds?.process) {
    window.instgrm.Embeds.process();
  }
}

function whenEventbriteReady(cb, tries = 0){
  if (window.EBWidgets?.createWidget) return cb();
  if (tries > 40) return;              // ~4s cap
  setTimeout(() => whenEventbriteReady(cb, tries + 1), 100);
}

function renderEventbrite(eventId){
  whenEventbriteReady(() => {
    EBWidgets.createWidget({
      widgetType: "checkout",
      eventId,
      iframeContainerId: "eventbrite-embed",
      iframeContainerHeight: 740
    });
    // Only hide placeholder once we try to render
    const ph = document.getElementById("eventbrite-placeholder");
    if (ph) ph.classList.add("hidden");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  // load config
  let cfg = {};
  try {
    const res = await fetch("./data/content.json", { cache: "no-store" });
    cfg = await res.json();
  } catch {}

  // About
  if (cfg.about) document.getElementById("about-text").textContent = cfg.about;

  // Instagram (auto)
  if (cfg.instagram?.profile) {
   const ig = document.getElementById("link-ig");
   if (ig) ig.href = cfg.instagram.profile;
  }
  if (cfg.instagram?.posts?.length) renderInstagramPosts(cfg.instagram.posts);

  // Eventbrite (auto)
  if (cfg.eventbrite?.url) {
  const a = document.getElementById("link-eb");
  if (a) a.href = cfg.eventbrite.url;
 }
 if (cfg.eventbrite?.eventId) {
  renderEventbrite(cfg.eventbrite.eventId);
 }

  // Vendor form
  if (cfg.vendorForm?.embedSrc) {
    const form = document.getElementById("vendor-form");
    form.src = cfg.vendorForm.embedSrc;
  }
  const lf = document.getElementById("link-form");
  if (lf) lf.href = cfg.vendorForm?.embedSrc || cfg.vendorForm?.url;

  // --- Google Form expand/collapse ---
    const formEl = document.getElementById("vendor-form");
    const formToggle = document.getElementById("form-toggle");
    if (formEl && formToggle) {
        let collapsed = true;
        const setFormHeight = () => {
            formEl.style.height = collapsed ? "var(--form-h-collapsed)" : "var(--form-h-expanded)";
            formToggle.textContent = collapsed ? "Show full form" : "Collapse form";
        };
        formToggle.addEventListener("click", () => { collapsed = !collapsed; setFormHeight(); });
        setFormHeight(); // initialize
    }


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
