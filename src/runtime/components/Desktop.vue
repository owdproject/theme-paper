<script setup lang="ts">
import { ref } from 'vue'
import PaperSystemBar from './PaperSystemBar.vue'
import PaperWindowSnapHints from './PaperWindowSnapHints.vue'
import { useDesktopWorkArea } from '@owdproject/core/runtime/composables/useDesktopWorkArea'

const shellStageRef = ref<HTMLElement | null>(null)
useDesktopWorkArea(shellStageRef)
</script>

<template>
  <DesktopCore v-bind="$props" class="owd-desktop--paper">
    <PaperSystemBar />
    <PaperWindowSnapHints />
    <div ref="shellStageRef" class="paper-shell__stage">
      <DesktopContent>
        <slot />
      </DesktopContent>
      <DesktopCoreApplicationRender />
    </div>
  </DesktopCore>
</template>
