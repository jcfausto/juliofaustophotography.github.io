# juliofaustophotography.com

Photography website of Julio Cesar Fausto: portfolio, photographic essays, and field
notes.

Built with [Jekyll](https://jekyllrb.com/) and deployed to GitHub Pages through
GitHub Actions. The design is the custom theme from
[jcfausto.com](https://github.com/jcfausto/jcfausto.github.io): the same tokens,
typography (Source Serif 4, Space Grotesk, IBM Plex Mono), nav, footer, and
prose styles, using the amber photography accent throughout. There is no
backend, database, CMS, or JavaScript framework.

## Contents

1. [Local setup](#1-local-setup)
2. [Add a photograph](#2-add-a-photograph)
3. [Create a gallery](#3-create-a-gallery)
4. [Publish an essay](#4-publish-an-essay)
5. [Publish a field note](#5-publish-a-field-note)
6. [Generate optimized image variants](#6-generate-optimized-image-variants)
7. [Deploy](#7-deploy)
8. [Configure the custom domain](#8-configure-the-custom-domain)
9. [Migrate the old URLs](#9-migrate-the-old-urls)

Also: [Project layout](#project-layout) · [Editable copy](#editable-copy) · [Private originals](#private-originals)

## 1. Local setup

You need Ruby 3.2 and Bundler. ImageMagick (`magick`) is only required for the image scripts.

```bash
bundle install
bundle exec jekyll serve      # http://localhost:4000, draft essays visible
```

Production build plus link check, the same steps CI runs:

```bash
JEKYLL_ENV=production bundle exec jekyll build
bundle exec htmlproofer ./_site --disable-external --no-enforce-https
```

Or with Docker:

```bash
docker compose up
```

## 2. Add a photograph

1. Export a **web-sized JPEG** (long edge at most 2000px, sRGB) into the collection folder:

   ```text
   assets/images/photography/<collection-slug>/<file>.jpg
   ```

2. Burn in the corner copyright. Files that are already marked are skipped, so it is safe to run repeatedly:

   ```bash
   ./scripts/watermark-photos             # collections
   ./scripts/watermark-photos --journal   # also field note images
   ./scripts/watermark-photos --essays    # also essay images
   ```

3. Generate the responsive variants (see [section 6](#6-generate-optimized-image-variants)):

   ```bash
   ./scripts/build-image-variants
   ```

4. Add an entry to `_data/photos.yml`. **Order in the file is the order on the page.**

   ```yaml
   - src: /assets/images/photography/woodlands-and-landscapes/the-file.jpg
     alt: "Fog between rolling hills at sunrise"   # required: describe the photograph
     caption: "Tuscany, Italy"                    # optional, shown under the photo
     collection: woodlands-and-landscapes
     # optional:
     # location: "Val d'Orcia"                    # appended to the caption
     # display: wide                              # half | wide | full | solo
   ```

   By default, landscapes span the full gallery width, two consecutive portraits
   are shown as a pair, and a portrait without a portrait neighbour is centred on
   its own. Use `display` only to override this. Photos are never cropped.

`featured` and `class` are legacy fields from jcfausto.com. They are kept for
compatibility and ignored here.

## 3. Create a gallery

1. Create `_galleries/<slug>.md`:

   ```yaml
   ---
   title: Coastlines
   description: One sentence shown under the title and in search results.
   cover: /assets/images/photography/coastlines/cover.jpg
   image: /assets/images/photography/coastlines/cover.jpg   # social preview
   order: 4                                                  # position in the portfolio
   ---

   Optional introductory paragraph (Markdown).
   ```

2. Put its photographs in `assets/images/photography/<slug>/` and add them to
   `_data/photos.yml` with `collection: <slug>`, as in [section 2](#2-add-a-photograph).
3. Add the slug to `COLLECTIONS` in `scripts/watermark-photos`.

The gallery is published at `/portfolio/<slug>/` and appears on `/portfolio/`.
The homepage shows the first three galleries by `order`. No template changes are
needed.

## 4. Publish an essay

An essay is a complete photographic project: an intentional sequence of
photographs and text. Create `_essays/<slug>.md`:

```yaml
---
title: "Corbusierhaus, Berlin"
subtitle: "An exploration of scale, geometry, and repetition"   # optional
date: 2026-11-01
status: draft            # remove (or set to published) to publish
location: "Berlin, Germany"
subject: Architecture    # optional category
description: "One or two sentences for cards, search, and social previews."
intro: "Optional lede paragraph shown in the header."
cover: /assets/images/photography/essays/corbusierhaus/cover.jpg
cover_alt: "Describe the opening photograph"
cover_caption: "Optional caption"
image: /assets/images/photography/essays/corbusierhaus/cover.jpg  # social preview
featured: false          # true → homepage (max 3) and listed first on /essays/
gallery: architectural-and-cityscapes   # optional related portfolio collection
video_url:               # optional YouTube URL → "Companion video" section
video_poster:            # optional local poster image for the video
---
```

This example is structural only. It is not a published project.

Write the body in Markdown. Use `##` headings for sections such as
"Photographic intent", "Light and atmosphere", or "Lessons learned"; none of
them are required. Place photographs with these includes:

```liquid
{% include essay-photo.html src="/assets/images/photography/essays/slug/01.jpg"
   alt="…" caption="…" %}

{% include essay-photo.html src="…" alt="…" caption="…" display="wide" %}
{% include essay-photo.html src="…" alt="…" caption="…" display="full" %}

{% include essay-pair.html
   src1="…" alt1="…" caption1="…"
   src2="…" alt2="…" caption2="…"
   caption="Optional shared caption" %}
```

`display` takes one of three values: `text` (the default, text-column width),
`wide` (gallery width), or `full` (edge to edge). Every photograph opens in the
lightbox.

Essay images go in `assets/images/photography/essays/<slug>/`. Run
`./scripts/watermark-photos --essays`, then `./scripts/build-image-variants`.

**Drafts:** essays with `status: draft` appear with `jekyll serve` (development)
and are removed entirely from production builds, including pages, lists, the
sitemap, and the feed. The logic lives in `_plugins/essay_drafts.rb`.

Essays are listed at `/essays/`, newest first, with `featured: true` essays
ahead of the rest. They are published at `/essays/<slug>/` and in
`/essays/atom.xml`.

## 5. Publish a field note

Field notes are shorter, text-led writing about practice. **Decision:** the
canonical collection is `_field_notes/`. It replaces `_photo_journal/` from
jcfausto.com; the files were moved with their front matter intact so there is
exactly one canonical URL per article.

Create `_field_notes/<slug>.md`:

```yaml
---
title: "The title"
date: 2026-11-10
language: en             # pt for Portuguese; non-English is labelled in lists
category: Fieldwork      # optional: Fieldwork · Technique · Equipment · Reflections · Behind the Scenes
description: "One or two sentences for the list, search, and social previews."
image: /assets/images/photography/journal/<slug>/cover.jpg   # optional cover + social preview
image_alt: "Describe the cover"                            # if the cover is shown by the layout
related:                 # optional links at the end
  - title: "Woodlands & Landscapes"
    url: /portfolio/woodlands-and-landscapes/
---

Markdown body. Standard images work:

![Describe the photograph](/assets/images/photography/journal/<slug>/photo.jpg)
```

- Do not repeat the title as `# Heading`; the layout renders it.
- If the body already contains the cover image, the layout does not show it a second time.
- Markdown images that have generated variants are automatically served as
  responsive `<picture>` elements (`_plugins/responsive_prose_images.rb`).
- Published at `/field-notes/<slug>/`, and included in `/rss.xml` and `/field-notes/atom.xml`.

Store field note images in `assets/images/photography/journal/<slug>/`; the
folder name `journal` was kept from the original site.

## 6. Generate optimized image variants

```bash
./scripts/build-image-variants          # new or changed sources only
./scripts/build-image-variants --force  # rebuild everything
```

For every JPEG under `assets/images/photography/`, the script:

- writes 480 / 1200 / 2000px **WebP** and **JPEG** variants to `assets/images/variants/<same path>-<width>.{webp,jpg}`;
- never upscales. When the source is narrower than 2000px, its own width is the
  largest size, and the source JPEG is used for that size instead of a re-encoded copy;
- strips metadata from the variants;
- regenerates `_data/images.yml` with each image's intrinsic width, height,
  orientation, and available widths.

Templates use `_data/images.yml` through `_includes/picture.html` to emit
`srcset`, `sizes`, `width`/`height` (to prevent layout shift), and lazy loading.
The homepage photo and the first photo of a gallery or essay load eagerly.
Commit the variants and `_data/images.yml`, because GitHub Pages cannot process
images at build time.

Variants are made from already-watermarked sources and live outside the
watermark script's folders, so nothing is ever watermarked twice.

## 7. Deploy

`.github/workflows/pages.yml` runs on every push to `main`:

1. `bundle exec jekyll build` with `JEKYLL_ENV=production` (Jekyll 4.3; custom plugins allowed).
2. `htmlproofer` checks internal links and images. A failure stops the deploy.
3. Upload and deploy with `actions/deploy-pages`.

Pull requests run steps 1 and 2 only. One-time setup: Repository → Settings →
Pages → Source = **GitHub Actions**.

## 8. Configure the custom domain

The `CNAME` file holds `juliofaustophotography.com`. With Actions deployments,
GitHub reads the domain from repository settings, not from the file, so the file
serves as documentation. Full DNS records and the order of steps are in the
[launch checklist](docs/migration.md#4-launch-checklist). In short:

1. Settings → Pages → Custom domain: `juliofaustophotography.com`.
2. At the registrar: apex `A`/`AAAA` records pointing to GitHub Pages, and `www` as a `CNAME` to `<owner>.github.io`.
3. Verify the domain on the GitHub account, then enable **Enforce HTTPS**.

**Do not change DNS without explicit approval.**

## 9. Migrate the old URLs

See [docs/migration.md](docs/migration.md). It covers the full old-to-new URL
map, the redirect strategy (`jekyll-redirect-from` stubs on jcfausto.com and
their limits compared with HTTP 301s), the exact patch for `jcfausto.github.io`,
and the launch checklist. The legacy `juliofaustophotography.com/blog/<slug>`
URLs already redirect to `/field-notes/<slug>/` from this repository.

## Project layout

```text
_config.yml            collections, permalinks, plugins
_data/site.yml         all editable interface copy (nav, intros, About, footer, YouTube)
_data/home.yml         homepage featured photograph and intro
_data/photos.yml       portfolio photographs, in display order
_data/images.yml       generated — image dimensions and variants
_galleries/            portfolio collections        → /portfolio/:slug/
_essays/               photographic essays          → /essays/:slug/
_field_notes/          field notes                  → /field-notes/:slug/
_includes/picture.html responsive image component
_includes/essay-*.html essay image includes; video.html = click-to-load YouTube
_plugins/              draft handling, responsive Markdown images
_sass/                 theme (from jcfausto.com) + gallery/essay/home styles
assets/js/site.js      nav toggle, accessible lightbox, YouTube facade
scripts/               watermark-photos, build-image-variants
docs/migration.md      URL map, redirect plan, launch checklist
```

## Editable copy

All interface text is data, not template code:

- `_data/site.yml` holds section titles and intros, the About text and links, the footer, and the YouTube block.
- `_data/home.yml` holds the featured photograph (`src`, `alt`, `caption`), the homepage title, and the intro.

Homepage sections hide themselves when they have nothing to show; for example,
there are no featured essays yet.

## Private originals

Never commit RAW files, full-resolution masters, unprocessed exports, or
archives. `.gitignore` blocks common RAW and master formats (`*.ARW`, `*.NEF`,
`*.ORF`, `*.CR3`, `*.DNG`, `*.RAF`, `*.tif`, `*.psd`, …), plus `_originals/`,
`exports/`, and `*.zip`. Keep originals outside the repository, or in
`_originals/` locally, and publish only web-sized, watermarked JPEGs.

## Prints

To make a portfolio photo printable, add a `print` block to its entry in
`_data/photos.yml`:

```yaml
  print:
    id: tuscany-hills        # required, unique; people quote it in requests
    title: "Morning hills"   # optional, defaults to the caption
    sizes:                   # optional; replaces the standard sizes
      - label: "30 × 40 cm"
        price: "€ …"
```

Visitors choose one of the standard sizes. `size_sets` in `_data/prints.yml`
defines them per aspect ratio (3:2, 4:3, 16:9); each photo is offered the set
closest to its own ratio, so a print is never cropped to an unrelated shape.
Prices are optional; without them the page says "Prices on request". The
chosen size goes into the request email.

`/prints/` shows one printable photo in a frame, with thumbnails of all of
them below it; choosing a thumbnail puts that photo in the frame. Each photo
has its own link, `/prints/#<id>`. The frame starts on `default` from
`_data/prints.yml`, which also holds the page copy. "Request a print" opens
an email whose subject and body include the title and print ID.

To show "Buy a print" under the framed homepage photo, set
`featured_photo.print` in `_data/home.yml` to a print ID.

Before taking orders, the site needs an Impressum and a privacy policy.

## License

All rights reserved. See [LICENSE](LICENSE). Photographs may not be reused or
used for AI training without written permission.
