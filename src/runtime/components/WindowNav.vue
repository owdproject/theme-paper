<script setup lang="ts">
import { inject } from 'vue'

const windowController = inject<IWindowController>('windowController')

function onClose() {
  if (!windowController?.instanced) return
  windowController.actions.destroy()
}
</script>

<template>
  <DesktopWindowNav class="paper-window-nav">
    <span v-if="windowController?.title" class="paper-window-nav__title">
      {{ windowController.title }}
    </span>
    <div class="owd-window-nav__btn-group owd-window-nav__btn-group--append">
      <button
        v-if="!windowController?.instanced || windowController?.isDestroyable"
        type="button"
        class="paper-window-nav__close"
        aria-label="Close"
        @mousedown.stop
        @click.stop="onClose"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M1 1l10 10M11 1L1 11"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </DesktopWindowNav>
</template>

<style scoped>
.paper-window-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 2.5rem;
  padding: 0 0.875rem;
  border-bottom: 1px solid var(--paper-line);
  background: var(--paper-surface);
}

.paper-window-nav__title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--paper-text);
}

.paper-window-nav__close {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--paper-text-secondary);
  cursor: pointer;
}

.paper-window-nav__close:hover {
  background: var(--paper-bg);
  color: var(--paper-text);
}
</style>
