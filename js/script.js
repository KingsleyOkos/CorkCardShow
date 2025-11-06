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
    bq.style.background = "#FFF";
    bq.style.border = "0";
    bq.style.borderRadius = "12px";
    bq.style.boxShadow = "0 0 1px rgba(0,0,0,.2), 0 6px 18px rgba(0,0,0,.08)";
    bq.style.margin = "0";
    bq.style.minWidth = "260px";
    bq.style.width = "100%";
    wrap.appendChild(bq);
  });

  //loads the embed script 
    if (!document.querySelector('script[src="https://www.instagram.com/embed.js"]')) {
    const s = document.createElement("script");
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    document.head.appendChild(s);
  } else if (window.instgrm?.Embeds?.process) {
    // if script already present, ask it to (re)process
    window.instgrm.Embeds.process();
  }
}

function whenEventbriteReady(cb, tries = 0){
  if (window.EBWidgets && typeof window.EBWidgets.createWidget === "function") return cb();
  if (tries > 40) return; // ~4s max
  setTimeout(() => whenEventbriteReady(cb, tries + 1), 100);
}

function renderEventbrite(eventId){
  if (!eventId) return;
  whenEventbriteReady(() => {
    window.EBWidgets.createWidget({
      widgetType: "checkout",
      eventId: eventId,
      iframeContainerId: "eventbrite-embed",
      iframeContainerHeight: 740,
      onOrderComplete: function(){ /* optional */ }
    });
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
    const link = document.getElementById("link-ig");
    if (link) link.href = cfg.instagram.profile;
    const contactIg = document.getElementById("contact-ig");
    if (contactIg) contactIg.href = cfg.instagram.profile;
  }
  if (cfg.instagram?.posts?.length) {
    renderInstagramPosts(cfg.instagram.posts);
  }

  // Eventbrite (auto)
  if (cfg.eventbrite?.url) {
    const el = document.getElementById("link-eb");
    if (el) el.href = cfg.eventbrite.url;
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
