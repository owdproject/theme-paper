export const PAPER_DESKTOP_STORE_KEY = 'owd/desktop'

export type PaperAppearance = 'light' | 'dark'

/** Read appearance from Pinia persisted desktop store payload, if present. */
export function readPersistedAppearance(): PaperAppearance | undefined {
  if (typeof localStorage === 'undefined') return undefined

  try {
    const raw = localStorage.getItem(PAPER_DESKTOP_STORE_KEY)
    if (!raw) return undefined

    const data = JSON.parse(raw) as Record<string, unknown>
    const personalization =
      (data.personalization as { appearance?: string } | undefined) ??
      (data.state as { personalization?: { appearance?: string } } | undefined)
        ?.personalization

    const appearance = personalization?.appearance
    if (appearance === 'light' || appearance === 'dark') return appearance
  } catch {
    /* ignore corrupt storage */
  }

  return undefined
}

/** Inline bootstrap: set data-owd-appearance before CSS paints (no prefers-color-scheme flash). */
export const paperAppearanceBootstrapScript = `(function(){var el=document.documentElement;try{var raw=localStorage.getItem(${JSON.stringify(PAPER_DESKTOP_STORE_KEY)});if(raw){var j=JSON.parse(raw),p=j.personalization||(j.state&&j.state.personalization),a=p&&p.appearance;if(a==="light"||a==="dark"){el.dataset.owdAppearance=a;return}}}catch(e){}el.dataset.owdAppearance="light"})();`

export function syncHtmlAppearance(appearance: PaperAppearance) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.owdAppearance = appearance
}
