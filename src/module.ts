import { createResolver, addComponentsDir, addPlugin, installModule } from '@nuxt/kit'
import { defu } from 'defu'
import { registerTailwindPath } from '@owdproject/core'
import { defineDesktopTheme } from '@owdproject/core/runtime/utils/defineDesktopTheme'
import { paperAppearanceBootstrapScript } from './runtime/utils/paperAppearance'

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

    await installModule('@owdproject/kit-theme')

    addComponentsDir({
      path: resolve('./runtime/components'),
      global: true,
    })

    registerTailwindPath(
      nuxt,
      resolve('./runtime/components/**/*.{vue,mjs,ts}'),
    )

    nuxt.options.css.push(resolve('./runtime/assets/styles/index.scss'))

    const head = nuxt.options.app.head ?? {}
    const existingScripts = Array.isArray(head.script)
      ? head.script
      : head.script
        ? [head.script]
        : []

    nuxt.options.app.head = {
      ...head,
      htmlAttrs: defu({ 'data-owd-appearance': 'light' }, head.htmlAttrs ?? {}),
      script: [
        {
          key: 'paper-appearance-bootstrap',
          innerHTML: paperAppearanceBootstrapScript,
          tagPosition: 'head',
          type: 'text/javascript',
        },
        ...existingScripts,
      ],
    }

    addPlugin({
      src: resolve('./runtime/plugins/paper-appearance.client.ts'),
      mode: 'client',
      order: 1,
    })
  },
})
