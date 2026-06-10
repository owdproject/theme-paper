import { ref } from 'vue'

export type PaperAppearance = 'light' | 'dark'

export const PAPER_APPEARANCE_STORAGE_KEY = 'owd-paper-appearance'

export const DEFAULT_PAPER_APPEARANCE: PaperAppearance = 'light'

/** Shared appearance state — hydrated and synced by `paper-appearance.client` plugin. */
export const paperAppearanceId = ref<PaperAppearance>(DEFAULT_PAPER_APPEARANCE)

export function isPaperAppearance(value: string): value is PaperAppearance {
  return value === 'light' || value === 'dark'
}

export function readPersistedAppearance(): PaperAppearance | undefined {
  if (typeof localStorage === 'undefined') return undefined

  const stored = localStorage.getItem(PAPER_APPEARANCE_STORAGE_KEY)
  if (stored && isPaperAppearance(stored)) return stored

  return undefined
}

/** Inline bootstrap: set data-owd-appearance before CSS paints (no flash). */
export const paperAppearanceBootstrapScript = `(function(){var el=document.documentElement,d=${JSON.stringify(DEFAULT_PAPER_APPEARANCE)};try{var s=localStorage.getItem(${JSON.stringify(PAPER_APPEARANCE_STORAGE_KEY)});if(s==="light"||s==="dark"){el.dataset.owdAppearance=s;return}}catch(e){}el.dataset.owdAppearance=d})();`

export function syncHtmlAppearance(appearance: PaperAppearance) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.owdAppearance = appearance
}
