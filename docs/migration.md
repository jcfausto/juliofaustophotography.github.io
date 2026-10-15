# Migration: jcfausto.com/photography → juliofaustophotography.com

Status: **prepared, not applied.** Nothing in `jcfausto.github.io` has been
changed. Apply the steps below only after the new site is live on
`https://juliofaustophotography.com` and has been checked.

## 1. URL map

### From jcfausto.com

| Old URL (jcfausto.com) | New URL (juliofaustophotography.com) |
|---|---|
| `/photography/` | `/portfolio/` |
| `/photography/architectural-and-cityscapes/` | `/portfolio/architectural-and-cityscapes/` |
| `/photography/woodlands-and-landscapes/` | `/portfolio/woodlands-and-landscapes/` |
| `/photography/nature-and-animal-life/` | `/portfolio/nature-and-animal-life/` |
| `/photography/journal/` | `/field-notes/` |
| `/photography/journal/a-small-om-1-mark-ii-customisation-that-makes-a-big-difference/` | `/field-notes/a-small-om-1-mark-ii-customisation-that-makes-a-big-difference/` |
| `/photography/journal/essential-equipment-for-beginner-photographers/` | `/field-notes/essential-equipment-for-beginner-photographers/` |
| `/photography/journal/finding-your-motivation-as-a-beginner-photographer/` | `/field-notes/finding-your-motivation-as-a-beginner-photographer/` |
| `/photography/journal/gear-temptation-how-to-overcome-the-urge-to-buy-new-camera-gear-before-a-new-photo-trip/` | `/field-notes/gear-temptation-how-to-overcome-the-urge-to-buy-new-camera-gear-before-a-new-photo-trip/` |
| `/photography/journal/getting-started-with-a-new-hobby/` | `/field-notes/getting-started-with-a-new-hobby/` |
| `/photography/journal/i-am-selling-my-nikon-z7ii-heres-why/` | `/field-notes/i-am-selling-my-nikon-z7ii-heres-why/` |
| `/photography/journal/i-think-im-getting-better-at-photography-and-thats-the-problem/` | `/field-notes/i-think-im-getting-better-at-photography-and-thats-the-problem/` |
| `/photography/journal/what-makes-a-great-photo-a-beginners-perspective/` | `/field-notes/what-makes-a-great-photo-a-beginners-perspective/` |

`/photography/` is the one exception: instead of a redirect it becomes a short
page on jcfausto.com that introduces and links to the new site (see step 3).

### Legacy juliofaustophotography.com URLs (handled by this repo)

The domain previously hosted a blog at `/blog/<slug>`. Each field note keeps
`redirect_from: /blog/<slug>/` and `/blog/<slug>`, and `/field-notes/` keeps
`redirect_from: /blog/`, so those URLs already redirect on the new site. No
action needed.

## 2. Redirect strategy and its limits

GitHub Pages has no server-side redirect configuration, so neither site can
send real HTTP `301` responses. The practical option is
[`jekyll-redirect-from`](https://github.com/jekyll/jekyll-redirect-from),
which jcfausto.com already uses and which is on the GitHub Pages plugin
whitelist. For every old URL it writes a small HTML page with:

- `<meta http-equiv="refresh" content="0; url=…">` (instant client-side redirect),
- `<link rel="canonical" href="…">` pointing at the new URL,
- a plain link for visitors whose browsers ignore the refresh.

Google treats an instant meta refresh plus a canonical link like a permanent
redirect, and it consolidates the old URLs into the new ones over time. The
limits:

- It is not a real `301`. Some crawlers and link checkers report a `200` with a refresh.
- Visitors briefly load a tiny HTML page before being sent on.
- Old **image** URLs (`/assets/images/photography/...` on jcfausto.com) cannot be
  redirected this way. Keep those files on jcfausto.com for a few months, so
  existing embeds and image-search results keep working, and remove them later.

**Optional upgrade to true 301s:** put jcfausto.com behind a proxy that
supports redirect rules, such as Cloudflare's free plan with "Redirect Rules" or
"Bulk Redirects". Map `jcfausto.com/photography/*` to the URLs above with
status 301, and keep GitHub Pages as the origin. That requires a DNS change, so
it needs explicit approval.

## 3. Patch for jcfausto.github.io (apply after approval)

All of these changes are in the `jcfausto.github.io` repository.

### 3a. Galleries → redirect stubs

Replace the front matter of each `_galleries/<slug>.md`. Keep `title` so
redirect pages still have a sensible `<title>`:

```yaml
---
title: Architectural & Cityscapes
redirect_to: https://juliofaustophotography.com/portfolio/architectural-and-cityscapes/
sitemap: false
---
```

Do the same for `woodlands-and-landscapes` and `nature-and-animal-life`.

### 3b. Photography journal → redirect stubs

For each `_photo_journal/<slug>.md`, replace the whole file with:

```yaml
---
title: "<original title>"
date: <original date>
redirect_to: https://juliofaustophotography.com/field-notes/<slug>/
sitemap: false
---
```

Also remove the old `redirect_from: /blog/...` entries. Those URLs belong to the
juliofaustophotography.com domain, where the new site now handles them.

Replace `photography-journal.md` with:

```yaml
---
title: Photography journal
permalink: /photography/journal/
redirect_to: https://juliofaustophotography.com/field-notes/
sitemap: false
---
```

### 3c. `/photography/` → short introduction

Keep `/photography/` as an indexable page on jcfausto.com, but turn it into a
short introduction with one prominent link, for example:

```markdown
---
layout: default
title: Photography
description: My photography now lives at juliofaustophotography.com.
permalink: /photography/
facet: photo
---

<header class="page-hero">
  <div class="wrap">
    <div class="eyebrow">05 — Photography</div>
    <h1 class="title">Photography has its own home now.</h1>
    <p class="hero-sub">Portfolio, photographic essays, and field notes live at
    <a class="accent" href="https://juliofaustophotography.com/">juliofaustophotography.com</a>.</p>
  </div>
</header>
```

### 3d. Homepage, nav, footer, and data

- `_layouts/home.html`, photography section: keep the mosaic if wanted, but point
  "All photography →" at `https://juliofaustophotography.com/`. Mosaic images can
  stay where they are.
- `_includes/nav.html`: keep the "Photos" link to `/photography/` (now the intro page).
- `_data/site.yml`: change the contact link `Photography` to
  `https://juliofaustophotography.com/`.
- `_config.yml`: add `https://juliofaustophotography.com/` to `social.links`.

### 3e. Verify on jcfausto.com

```bash
bundle exec jekyll build
grep -L 'http-equiv="refresh"' _site/photography/*/index.html _site/photography/journal/*/index.html
grep -c 'juliofaustophotography.com' _site/sitemap.xml   # expect 0
grep -c '/photography/journal/' _site/sitemap.xml          # expect 0
```

The `grep -L` command should print nothing.

## 4. Launch checklist

Before DNS:

- [ ] `JEKYLL_ENV=production bundle exec jekyll build` passes.
- [ ] `bundle exec htmlproofer ./_site --disable-external --no-enforce-https` passes.
- [ ] Every page in the URL map renders locally (`bundle exec jekyll serve`). A
      GitHub Pages preview URL only works at the root if the repository is an
      organisation/user site; under a personal account this repo is served from a
      sub-path until the custom domain is set, so asset links will look broken there.
- [ ] Lighthouse (mobile) on `/`, `/portfolio/woodlands-and-landscapes/`, and one field note: performance and accessibility at 90 or above, and no layout shift from images.
- [ ] No draft essays are listed in `/essays/`, `/sitemap.xml`, or `/essays/atom.xml`.
- [ ] Social previews checked with a card validator (title, description, image).

DNS and GitHub Pages (needs approval):

- [ ] Repository → Settings → Pages: Source = **GitHub Actions**.
- [ ] Custom domain = `juliofaustophotography.com`; wait for the DNS check to pass.
- [ ] DNS at the registrar:
  - apex `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - apex `AAAA` records: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
  - `www` `CNAME` → `<owner>.github.io`, where `<owner>` is the GitHub user or organisation that owns this repository (for example `jcfausto.github.io`)
- [ ] Verify the domain for the GitHub account (Settings → Pages → Verified domains) to prevent takeover.
- [ ] Enable **Enforce HTTPS** once the certificate has been issued.
- [ ] Spot-check the legacy `/blog/<slug>` URLs on the live domain.

After launch:

- [ ] Add the new domain to Google Search Console and submit `/sitemap.xml`.
- [ ] Apply the jcfausto.com patch (section 3), deploy it, and run section 3e.
- [ ] In Search Console for jcfausto.com, keep watching the photography URLs until they drop out.
- [ ] After roughly 3–6 months, remove the photography images from jcfausto.com if nothing still links to them.
