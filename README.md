# קול־שבור · Voice Bridge

**[Open the app →](https://orikibengur-cyber.github.io/kolshavur/)** · [What is this? (Hebrew)](https://orikibengur-cyber.github.io/kolshavur/about.html)

Read English voice notes as Hebrew text. Hear text messages spoken aloud in Hebrew.

Built for two moments: you're somewhere public and can't play a voice note out loud, and
you're driving and can't read a message.

---

## What it does

**Voice note → text.** Feed it an English voice note (WhatsApp, iMessage, anything).
It transcribes on-device with Whisper and shows the result in Hebrew or English, in large
readable type.

**Text → speech.** Paste a message in Hebrew or English, pick the language to hear it in,
and the phone reads it aloud. Auto-detects what you pasted.

## Privacy

Audio never leaves the device. Transcription runs in the browser via
[transformers.js](https://github.com/huggingface/transformers.js) — no server receives the
recording, there's no account, and there's nothing stored to delete. Only the resulting
*text* is sent to a translation service, and only when translation is requested.

## Install

Open the link in Chrome on your phone → menu ⋮ → **Install app**. It installs as a PWA with
its own icon and works offline once the model is cached.

On first run, open settings and tap **הורד מודל מראש** on wi-fi — a one-time ~145 MB download.

## How it works

| Piece | Implementation |
|---|---|
| Speech-to-text | `Xenova/whisper-{tiny,base,small}.en` via transformers.js, WebGPU with WASM fallback |
| Translation | Chrome's built-in `Translator` API when available, otherwise free public endpoints |
| Text-to-speech | `speechSynthesis` with the device voice, falling back to an online voice |
| Offline | Service worker caches the app shell; transformers.js caches the model |

No build step, no dependencies, no backend. Three static files: `index.html`, `manifest.json`,
`sw.js`.

## Known limitations

- **Voice input must be English.** Hebrew speech recognition was tried and removed — Whisper's
  Hebrew accuracy at these model sizes wasn't good enough to ship.
- **First transcription is slow.** Mobile Chrome typically has no WebGPU, so Whisper runs on the
  CPU. Roughly real-time: a one-minute note takes about a minute.
- **Free translation is imperfect.** It conveys meaning but the phrasing is sometimes clumsy.
- The translation and online-voice endpoints are undocumented Google endpoints. Fine for
  personal use; not suitable for a commercial deployment.

## License

© 2026 Ori Ben-Gur. All rights reserved.

The source is public so you can see how it works and verify the privacy claims above —
it is not licensed for reuse, redistribution, or republication.
