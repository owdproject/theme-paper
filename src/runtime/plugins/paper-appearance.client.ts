import { watch } from 'vue'
import {
  DEFAULT_PAPER_APPEARANCE,
  PAPER_APPEARANCE_STORAGE_KEY,
  paperAppearanceId,
  readPersistedAppearance,
  syncHtmlAppearance,
} from '../utils/paperAppearance'

/**
 * Paper light/dark: localStorage → shared ref → html[data-owd-appearance].
 * Head bootstrap script prevents first-paint flash on reload.
 */
export default defineNuxtPlugin(() => {
  paperAppearanceId.value =
    readPersistedAppearance() ?? DEFAULT_PAPER_APPEARANCE
  syncHtmlAppearance(paperAppearanceId.value)

  watch(paperAppearanceId, (appearance) => {
    localStorage.setItem(PAPER_APPEARANCE_STORAGE_KEY, appearance)
    syncHtmlAppearance(appearance)
  })
})
