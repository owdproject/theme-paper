<template>
  <DesktopCoreWindowContent class="paper-window__body">
    <div class="paper-window-body">
      <slot />
    </div>
  </DesktopCoreWindowContent>
</template>

<style scoped lang="scss">
:deep(.owd-window__content) {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.paper-window__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  background: var(--paper-surface);
}

.paper-window-body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.paper-window__body.owd-window__content--padded .paper-window-body {
  padding: 16px;
  box-sizing: border-box;
}
</style>
