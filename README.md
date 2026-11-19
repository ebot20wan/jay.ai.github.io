# Jay Vincent D. Antonio — JAY.AI Portfolio

A custom-coded, responsive portfolio for AI training, data annotation, and AI output quality review. Built with plain HTML, CSS, and JavaScript; no build step, framework, database, or paid service is required.

Live site: https://ebot20wan.github.io/jay.ai.github.io/

## Files

- `index.html`: all page content, sections, metadata, structured data, and the Annotation Lab cases
- `styles.css`: responsive dark-blue visual system (the block at the bottom, "UPGRADE BLOCK", holds the newest additions)
- `script.js`: navigation, live availability, section numbering, skill search, Annotation Lab logic, optional Lab media loading
- `sitemap.xml`: tells search engines which page to index
- `assets/jay-antonio.jpeg`: profile photograph
- `assets/og-banner.png`: 1200×630 preview image shown when the link is shared (LinkedIn, Slack, WhatsApp, etc.)
- `assets/Jay_Vincent_D_Antonio_Resume.pdf`: resume PDF
- `assets/favicon.svg`: browser tab icon
- `assets/lab/`: optional audio, image, and video files for the Annotation Lab (see `assets/lab/README.md`)

## Publish with GitHub Pages

1. Open the repository `https://github.com/ebot20wan/jay.ai.github.io`.
2. Upload the changed files (drag and drop works) to the repository root, keeping the `assets` folder structure. Commit to the `main` branch.
3. In repository Settings → Pages, choose **Deploy from a branch**, branch `main`, folder `/(root)`, then Save.
4. Wait a minute or two for the deployment, then visit `https://ebot20wan.github.io/jay.ai.github.io/`.
5. If the browser shows an older version, hard-refresh with `Ctrl + Shift + R`.

## Common edits

- **Change your availability:** in `index.html`, find the `schedule-list` in the Contact section. Edit the visible text **and** the `data-windows` value on the same line (24-hour start-end, e.g. `8-16,20-24`). The live "Available now" badge reads from these rows.
- **Turn on the Case studies section:** fill in the `[bracketed]` notes in the `id="cases"` section of `index.html`, then delete the word `hidden` from that `<section>` tag. The nav link and section numbers update automatically.
- **Add Lab media:** drop files with the exact names listed in `assets/lab/README.md` into `assets/lab/`.
- **Edit Lab cases:** each case in `index.html` has `data-model` (the model answer), buttons with `data-why` (feedback), and `data-ok="true"` on the correct button.
- **Add a phone number again:** it was removed on purpose because contact is email-only. Add a `<a href="tel:...">` inside the `contact-details` div if that changes.
- Replace the profile photo or resume only if you keep the same file name (or update the links in `index.html`).

## Accuracy and privacy notes

- The 30,000 successful video annotations, 91% reported accuracy, and 1,447 passed music-annotated songs are reproduced from the supplied resume.
- The Micro1 skills are reproduced from the talent portal screenshot supplied by Jay. This portfolio does not claim to be an official Micro1 certificate.
- The Annotation Lab activities are self-created practice demonstrations. They are not presented as confidential client deliverables or actual production task records.
- Anything a visitor types into the Lab stays in their browser. Nothing is sent anywhere or stored.
- Do not upload client-confidential material, private task data, passwords, or identity documents.

## Hosting

The site is static and hosted on GitHub Pages at no cost for a public repository. A custom domain is optional, not required.
