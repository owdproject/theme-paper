<template>
  <DesktopWindowContent class="paper-window__body">
    <slot />
  </DesktopWindowContent>
</template>

<style scoped>
.paper-window__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: var(--paper-surface);
}
</style>
