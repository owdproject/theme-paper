import { watchEffect } from 'vue'
import { useDesktopStore } from '@owdproject/core/runtime/stores/storeDesktop'
import {
  readPersistedAppearance,
  syncHtmlAppearance,
} from '../utils/paperAppearance'

/**
 * Paper defaults to light appearance. Syncs store → <html data-owd-appearance>.
 * Respects persisted user choice from Pinia; head inline script prevents first-paint flash.
 */
export default defineNuxtPlugin(async () => {
  const desktopStore = useDesktopStore()

  if (desktopStore.$persistedState?.isReady) {
    await desktopStore.$persistedState.isReady()
  }

  const persisted = readPersistedAppearance()
  if (!persisted) {
    desktopStore.setAppearance('light')
  }

  syncHtmlAppearance(desktopStore.state.personalization.appearance)

  watchEffect(() => {
    syncHtmlAppearance(desktopStore.state.personalization.appearance)
  })
})
