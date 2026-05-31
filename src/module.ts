import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
} from '@nuxt/kit'
import { defu } from 'defu'
import { registerTailwindPath } from '@owdproject/core/runtime/utils/utilApp'

export default defineNuxtModule({
  meta: {
    name: 'owd-theme-paper',
    configKey: 'desktop',
  },
  defaults: {
    name: 'paper',
    systemBar: { enabled: true, position: 'top', startButton: true },
    dockBar: { enabled: false },
    workspaces: { enabled: false },
    windows: { position: 'fixed' },
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public ??= {}
    nuxt.options.runtimeConfig.public.desktop = defu(
      nuxt.options.runtimeConfig.public.desktop ?? {},
      options,
    )

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
