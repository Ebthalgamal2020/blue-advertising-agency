# blue advertising agency

The website for blue advertising agency - exhibition stands, pavilions,
conference stages, digital marketing and printing.

## Links

- **Live website:** https://ebthalgamal2020.github.io/blue-advertising-agency/
- **GitHub repository:** https://github.com/Ebthalgamal2020/blue-advertising-agency

## What's in it

- `index.src.html` - the page to edit: all styles and scripts inline, with comments
- `index.html` - the published page, built from `index.src.html` (do not edit by hand)
- `build.mjs` - minifies the inline CSS and JS and strips HTML comments
- `assets/fonts/` - self-hosted Poppins and Caveat (latin)
- `assets/work/web/` - project photos as WebP, in 800px, 480px and 96px sizes
- `assets/digital/`, `assets/print/` - work shown in the Digital marketing | Printing section
- `assets/clients/` - the 44 logos on the Trusted by wheel

## Editing

```
npm install        # once
# edit index.src.html
npm run build      # writes index.html
```

Commit both files. To preview locally, serve the folder over http
(for example `npx serve .`) rather than opening the file directly - browsers
block the preloaded fonts on `file://`.
