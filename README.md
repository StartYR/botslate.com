# Botslate

Botslate is an independent space for software projects, experiments, useful tools, and technical notes.

The public site is built with Astro, Tailwind CSS, and MDX. It uses static output, responsive layouts, light and dark themes, a command palette, Notes, and a public changelog.

## Local development

Requirements: Node.js 22.12 or newer and npm.

```bash
npm install
npm run dev
```

The local development server is available at `http://localhost:4321` by default.

## Validation

Create the production output in `dist/`:

```bash
npm run build
```

Run the Playwright interface checks:

```bash
npm run test:e2e
```

## Content

- Notes live in `src/content/blog/` and remain available under `/blog/`.
- Changelog entries live in `src/content/changelog/`.
- Shared site metadata and navigation live in `src/config.ts`.

## Deployment

The repository includes an existing deployment workflow exposed through `npm run deploy`. Deployment is intentionally separate from local build verification.

## License

This project retains the repository's MIT License and required upstream copyright notice. See [LICENSE](LICENSE).
