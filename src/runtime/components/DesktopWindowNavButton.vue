<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <button
    type="button"
    class="owd-window-nav__button"
    :title="title"
    :aria-label="title"
    @mousedown.stop
  >
    <slot />
  </button>
</template>

<style scoped>
.owd-window-nav__button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--paper-radius);
  background: transparent;
  color: var(--paper-text-secondary);
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease;
}

.owd-window-nav__button:hover {
  background: var(--paper-bg);
  color: var(--paper-text);
}

.owd-window-nav__button :deep(.iconify),
.owd-window-nav__button :deep(svg) {
  width: 12px;
  height: 12px;
  pointer-events: none;
}
</style>
