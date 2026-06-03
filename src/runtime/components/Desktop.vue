<script setup lang="ts">
import { ref } from 'vue'
import PaperSystemBar from './PaperSystemBar.vue'
import PaperWindowSnapHints from './PaperWindowSnapHints.vue'
import { useDesktopWorkArea } from '@owdproject/kit-theme/runtime/composables/useDesktopWorkArea'
import {
  provideDesktopShellStage,
  provideDesktopWorkArea,
} from '@owdproject/kit-theme/runtime/composables/provideDesktopShellStage'

const shellStageRef = ref<HTMLElement | null>(null)
const { workArea } = useDesktopWorkArea(shellStageRef)
provideDesktopShellStage(shellStageRef)
provideDesktopWorkArea(workArea)
</script>

<template>
  <DesktopCore v-bind="$props" class="owd-desktop--paper">
    <PaperSystemBar />
    <PaperWindowSnapHints />
    <div ref="shellStageRef" class="paper-shell__stage">
      <DesktopContent>
        <slot />
      </DesktopContent>
      <DesktopApplicationRender />
    </div>
  </DesktopCore>
</template>
