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

<style>
@import '../assets/paper-theme.css';

.owd-desktop--paper {
  display: flex;
  flex-direction: column;
  background: var(--paper-bg);
  color: var(--paper-text);
  font-family: var(--paper-font);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.paper-shell__stage {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
