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
  if (!target) return;
  if (!src) return alert("Add the embed URL in data/content.json to enable this embed.");

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
  target.hidden = false;
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  let cfg = {};
  try {
    const res = await fetch("./data/content.json", { cache: "no-store" });
    cfg = await res.json();
  } catch (e) {
    console.warn("content.json missing or invalid", e);
  }

  // About
  if (cfg.about) document.getElementById("about-text").textContent = cfg.about;

  // Instagram
  setHref("cta-follow-ig", cfg.instagram?.profile, "Follow on Instagram");
  setHref("link-ig", cfg.instagram?.profile);
  const igBtn = document.querySelector('[data-load="instagram"]');
  if (igBtn) igBtn.addEventListener("click", () => {
    loadIframe("instagram-embed", cfg.instagram?.embedSrc || "");
    document.getElementById("instagram-placeholder")?.remove();
  });

  // Eventbrite
  setHref("link-eb", cfg.eventbrite?.url);
  const ebBtn = document.querySelector('[data-load="eventbrite"]');
  if (ebBtn) ebBtn.addEventListener("click", () => {
    loadIframe("eventbrite-embed", cfg.eventbrite?.embedSrc || "");
  });

  // Vendor form
  if (cfg.vendorForm?.embedSrc) {
    const form = document.getElementById("vendor-form");
    form.src = cfg.vendorForm.embedSrc;
  }
  setHref("link-form", cfg.vendorForm?.embedSrc || cfg.vendorForm?.url);

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
  if (cfg.instagram?.profile) {
    const ig = document.getElementById("contact-ig");
    ig.href = cfg.instagram.profile;
  }
});
