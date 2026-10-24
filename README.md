# Mommy or Daddy?

An individual baby-shower game for Ayushi and Sumeet, recreated from the supplied PDF with its original artwork and all 18 questions.

Guests enter their name, choose Mom or Dad, and download a high-resolution PNG of their completed card. The optional score is filled in manually when the parents reveal their answers. No answer key or automatic scoring is included.

This is a standalone static website, independent of CandidPop and other projects. There is no backend, database service, sign-in, analytics, or collection of guest submissions. Names and selections are saved only in that browser's local storage, if available; Start over clears the saved card. Opening the site on another device or browser gives a separate card. Downloading still works with browser storage disabled.

## Run locally

Serve this directory with any static web server, for example:

```sh
python -m http.server 8097
```

Open `http://localhost:8097`. No installation or build step is needed.

## Hosting

GitHub Pages serves the root of the `main` branch. All asset references are relative, so the site works at its repository Pages URL.

The three decorative PNGs are extracted from the supplied PDF. `assets/card-template.png` is a 216 dpi rendering of that same PDF; downloading draws the player's entries directly over this original design.
