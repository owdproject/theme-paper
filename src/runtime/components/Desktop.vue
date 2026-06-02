<script setup lang="ts">
import PaperSystemBar from './PaperSystemBar.vue'
</script>

<template>
  <DesktopCore v-bind="$props" class="owd-desktop--paper">
    <PaperSystemBar />
    <DesktopContent class="paper-shell__stage">
      <slot />
    </DesktopContent>
    <DesktopApplicationRender />
  </DesktopCore>
</template>
