# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Keralaravam is a static, offline-capable PWA (Kerala festival sounds: melams, ambience, festival calendar, practice tools), bilingual English/Malayalam. There is no framework, package manager, test suite or linter. It is deployed as-is to GitHub Pages from the repo root.

## Commands

- Serve locally (needed for the service worker and audio; `file://` won't work): `python3 -m http.server 8000`
- Rebuild `index.html` after editing the source: `python3 dev/build.py` (run from the repo root)

## Architecture

- **`index.html` is a generated file. Never edit it directly.** Edit `dev/app.html` (the whole app: HTML, CSS and JS in one file, ~3300 lines) and rebuild.
- `dev/build.py` injects `dev/loops.json` and the two video JSON files into their placeholders in `app.html` (for example `/*LOOPS*/{}/*END*/`), splits `app.html` at the `<!--BODY-->` marker into head and body, and prepends `dev/head.html` (the PWA/manifest `<head>` tags) before writing `index.html`.
- `dev/videos.json` (per melam) and `dev/ambvideos.json` (per ambience sound) hold the built-in YouTube links as `{v, t, c}` (video ID, title, channel credit). `build.py` injects them into `app.html` at the `/*VIDEOS*/{}/*END*/` and `/*AMBVIDEOS*/{}/*END*/` placeholders. User-added links, hidden built-ins and per-sound choices live in the browser settings (`myVideos`, `myAudios`, `myAmbYT` and the matching `hidden*` keys), and are part of the backup `BK_KEYS`.
- `dev/loops.json` holds loop start/length points for each built-in recording in `audio/`. Built-in melams are split into four kaalams (slow to fast), for example `panchari-k1.mp3` to `panchari-k4.mp3`.
- `dev/info.py` holds the melam info texts (English and Malayalam). It is reference only and is not used by the build, so the live texts are inside `app.html`.
- `sw.js` is the service worker: cache-first app shell, network-first navigation, stale-while-revalidate for Google Fonts. The `SHELL` list is a precache list of every file needed offline.
- Ambience sounds, electronic melams, icons and animations are synthesized in the app (Web Audio). Uploads and recordings are analysed, looped and MP3-encoded in the browser with `vendor/lame.min.js` (lamejs).

## Required steps when changing things

- After any change to the app, bump `CACHE` in `sw.js` (currently `keralaravam-v71`). Otherwise installed copies keep the old version.
- To add or replace a built-in recording:
  1. Put the MP3 in `audio/`.
  2. Add its loop points to `dev/loops.json`.
  3. List it in `RECDEF` in `dev/app.html`.
  4. Add the file to `SHELL` in `sw.js`.
  5. Rebuild.

## Gotchas

- `audio/` is currently empty in this checkout. The recordings are in `audio_backup/`. Copy them into `audio/` before testing built-in melams or deploying. Without them the service worker's `addAll` precache fails.
- The recordings belong to their artists and rights holders. No license is chosen yet, so don't add one without asking.
