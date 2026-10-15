const toggle = document.querySelector(".nav-toggle");
const navlinks = document.getElementById("navlinks");
if (toggle && navlinks) {
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navlinks.classList.toggle("open", open);
  };
  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  navlinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navlinks.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}

// Prints: the thumbnails choose which printable photograph is in the frame.
const printsViewer = document.querySelector("[data-prints]");
if (printsViewer) {
  const panels = Array.from(printsViewer.querySelectorAll("[data-print-panel]"));
  const thumbs = Array.from(printsViewer.querySelectorAll("[data-print-thumb]"));
  const ids = panels.map((panel) => panel.id);

  const idFromHash = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    return ids.includes(id) ? id : null;
  };

  const select = (id) => {
    panels.forEach((panel) => { panel.hidden = panel.id !== id; });
    thumbs.forEach((thumb) => {
      if (thumb.dataset.printThumb === id) thumb.setAttribute("aria-current", "true");
      else thumb.removeAttribute("aria-current");
    });
  };

  printsViewer.classList.add("is-enhanced");
  select(idFromHash() || printsViewer.dataset.default || ids[0]);

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      const id = thumb.dataset.printThumb;
      select(id);
      history.replaceState(null, "", `#${id}`);
      const panel = document.getElementById(id);
      if (panel.getBoundingClientRect().top < 70) {
        window.scrollTo({ top: panel.offsetTop - 100, behavior: "smooth" });
      }
    });
  });

  window.addEventListener("hashchange", () => {
    const id = idFromHash();
    if (id) select(id);
  });

  panels.forEach((panel) => {
    const request = panel.querySelector("[data-print-request]");
    const scene = panel.querySelector("[data-print-scene]");
    if (!request) return;
    panel.querySelectorAll("[data-print-size]").forEach((input) => {
      input.addEventListener("change", () => {
        if (scene && input.dataset.w && input.dataset.h) {
          scene.style.setProperty("--w", input.dataset.w);
          scene.style.setProperty("--h", input.dataset.h);
        }
        const fill = (text) => text.replaceAll("__SIZE__", input.value);
        request.href = `mailto:${request.dataset.mail}?subject=${encodeURIComponent(fill(request.dataset.subject))}&body=${encodeURIComponent(fill(request.dataset.body))}`;
      });
    });
  });
}

document.querySelectorAll('a[href*="#"]:not([data-print-thumb])').forEach((link) => {
  const url = new URL(link.href, window.location.href);
  if (url.pathname.replace(/\/$/, "") !== window.location.pathname.replace(/\/$/, "")) return;
  if (!url.hash || url.hash === "#main") return;
  const target = document.querySelector(url.hash);
  if (!target) return;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 70, behavior: "smooth" });
    history.pushState(null, "", url.hash);
  });
});

// Lightbox: every image with data-zoom, plus inline images in prose.
const lightbox = document.getElementById("lightbox");
const main = document.getElementById("main");

if (lightbox && main && typeof lightbox.showModal === "function") {
  main.querySelectorAll(".prose img:not([data-zoom])").forEach((img) => {
    if (!img.closest("a")) img.dataset.zoom = img.currentSrc || img.src;
  });

  const items = Array.from(main.querySelectorAll("img[data-zoom]"));
  const lbImg = document.getElementById("lightboxImg");
  const lbCaption = document.getElementById("lightboxCaption");
  const lbCount = document.getElementById("lightboxCount");
  const prev = document.getElementById("lightboxPrev");
  const next = document.getElementById("lightboxNext");
  const close = document.getElementById("lightboxClose");
  let index = 0;
  let trigger = null;

  const captionFor = (img) => {
    const figure = img.closest("figure");
    const caption = figure && figure.querySelector(":scope > figcaption");
    return caption ? caption.textContent.trim() : "";
  };

  const show = (i) => {
    index = (i + items.length) % items.length;
    const img = items[index];
    lbImg.src = img.dataset.zoom;
    lbImg.alt = img.alt;
    const caption = captionFor(img);
    lbCaption.textContent = caption;
    lbCaption.hidden = caption === "";
    lbCount.textContent = items.length > 1 ? `${index + 1} / ${items.length}` : "";
  };

  const open = (i) => {
    trigger = items[i];
    show(i);
    lightbox.showModal();
    close.focus();
  };

  lightbox.addEventListener("close", () => {
    lbImg.removeAttribute("src");
    if (trigger) trigger.focus();
  });

  items.forEach((img, i) => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `Enlarge photograph${img.alt ? `: ${img.alt}` : ""}`);
    img.classList.add("zoomable");
    img.addEventListener("click", () => open(i));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(i);
      }
    });
  });

  const single = items.length < 2;
  prev.hidden = single;
  next.hidden = single;
  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  close.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      lightbox.close();
      return;
    }
    if (single) return;
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  let touchX = null;
  lightbox.addEventListener("touchstart", (e) => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (touchX === null || single) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
}

// Click-to-load YouTube: nothing is fetched from YouTube before play.
document.querySelectorAll(".video-facade").forEach((facade) => {
  const button = facade.querySelector(".video-play");
  if (!button) return;
  button.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(facade.dataset.videoId)}?autoplay=1&rel=0`;
    iframe.title = facade.dataset.videoTitle || "Video";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    facade.classList.add("is-playing");
    facade.replaceChildren(iframe);
    iframe.focus();
  });
});
