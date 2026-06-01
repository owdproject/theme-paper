import { createResolver, addComponentsDir } from '@nuxt/kit'
import { registerTailwindPath } from '@owdproject/core'
import { defineDesktopTheme } from '@owdproject/core/runtime/utils/defineDesktopTheme'

export default defineDesktopTheme({
  meta: {
    name: 'owd-theme-paper',
  },
  defaults: {
    name: 'paper',
    systemBar: { enabled: true, position: 'top', startButton: true },
    dockBar: { enabled: false },
    workspaces: { enabled: false },
    windows: { position: 'fixed' },
  },
  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    addComponentsDir({
      path: resolve('./runtime/components'),
      global: true,
    })

    registerTailwindPath(
      nuxt,
      resolve('./runtime/components/**/*.{vue,mjs,ts}'),
    )
  },
})
