<script setup lang="ts">
defineProps<{
  title?: string
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="owd-window-nav__button"
    :title="title"
    :aria-label="title"
    :disabled="disabled"
    @mousedown.stop
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
/* Sizing only — colors/hover in window-chrome.scss */
.owd-window-nav__button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
  width: var(--paper-nav-button-size);
  min-width: var(--paper-nav-button-size);
  height: var(--paper-nav-button-size);
  min-height: var(--paper-nav-button-size);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--paper-radius);
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: default;
    pointer-events: none;
  }

  :deep(.iconify),
  :deep(svg) {
    width: 12px;
    height: 12px;
    pointer-events: none;
  }
}
</style>
