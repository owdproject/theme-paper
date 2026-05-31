<p align="center">
  <img width="160" height="160" src="https://avatars.githubusercontent.com/u/65117737?s=160&v=4" />
</p>
<h1 align="center">Paper Theme</h1>
<h3 align="center">
  Paper Theme for your Open Web Desktop client.
</h3>

## Overview

A minimal theme for Open Web Desktop focused on the core shell: windows, a slim system bar, and little else. Use it to test window chrome, layout, and app rendering without the full Nova desktop experience.

**Visual style** — modern linear UI with an e-ink feel: zinc neutrals, 1px hairlines, system sans, no grids or decorative chrome.

**Shell** — top system bar (start menu and clock); fixed window layer with resize and drag; no dock, workspaces, or file-system integration.

**Components**

- `Desktop` — `DesktopCore` with `PaperSystemBar`, stage content, and `DesktopApplicationRender`
- `Window` — title bar and content around `DesktopWindow`
- Playground demo app — [`@owdproject/app-about`](https://owdproject.github.io/app-about/) (same as other theme playgrounds)

## Installation

```bash
pnpm desktop add @owdproject/theme-paper
```

## Usage

#### Configuration

```typescript
// desktop.config.ts
export default defineDesktopConfig({
  theme: '@owdproject/theme-paper',
  apps: ['@owdproject/app-about'],
})
```

## Development

```bash
cd themes/theme-paper
pnpm run dev:prepare
pnpm dev
```

## License

The application is released under the [MIT License](LICENSE).
