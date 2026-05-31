import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
} from '@nuxt/kit'
import { registerTailwindPath } from '@owdproject/core/runtime/utils/utilApp'
import deepMerge from 'deepmerge'

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
  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const paperShell = {
      name: 'paper',
      systemBar: { enabled: true, position: 'top', startButton: true },
      dockBar: { enabled: false },
      workspaces: { enabled: false },
      windows: { position: 'fixed' as const },
    }

    nuxt.options.runtimeConfig.public ??= {}
    nuxt.options.runtimeConfig.public.desktop ??= {}
    nuxt.options.runtimeConfig.public.desktop = deepMerge(
      deepMerge(nuxt.options.runtimeConfig.public.desktop, _options),
      paperShell,
    )
    nuxt.options.runtimeConfig.public.desktop.systemBar = paperShell.systemBar

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
