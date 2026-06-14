<template>
  <DesktopCoreWindowContent class="paper-window__body">
    <slot />
  </DesktopCoreWindowContent>
</template>

<style scoped>
.paper-window__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: var(--paper-surface);
}
</style>
