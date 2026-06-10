import {
  DEFAULT_PAPER_APPEARANCE,
  paperAppearanceId,
  type PaperAppearance,
} from '../utils/paperAppearance'

/** Read/write Paper light/dark appearance (theme-local, not core store). */
export function usePaperAppearance() {
  function setAppearance(appearance: PaperAppearance) {
    paperAppearanceId.value = appearance
  }

  function toggleAppearance() {
    paperAppearanceId.value =
      paperAppearanceId.value === 'dark'
        ? 'light'
        : 'dark'
  }

  return {
    appearance: paperAppearanceId,
    defaultAppearance: DEFAULT_PAPER_APPEARANCE,
    setAppearance,
    toggleAppearance,
  }
}
