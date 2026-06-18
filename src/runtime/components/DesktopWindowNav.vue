<script setup lang="ts">
import { inject } from 'vue'

const windowController = inject<IWindowController>('windowController')

function onClose() {
  if (!windowController?.instanced) return
  windowController.actions.destroy()
}
</script>

<template>
  <DesktopCoreWindowNav class="paper-window-nav">
    <div
      v-if="$slots.prepend"
      class="owd-window-nav__btn-group owd-window-nav__btn-group--prepend"
    >
      <slot name="prepend" />
    </div>

    <div v-if="windowController?.windowTitle" class="paper-window-nav__title-container">
      <Icon
        v-if="windowController?.icon"
        :name="windowController.icon"
        class="paper-window-nav__icon"
      />
      <span class="paper-window-nav__title">
        {{ windowController.windowTitle }}
      </span>
    </div>

    <div class="owd-window-nav__btn-group owd-window-nav__btn-group--append">
      <slot name="append" />

      <DesktopWindowNavButton
        v-if="!windowController?.instanced || windowController?.isDestroyable"
        class="paper-window-nav__close"
        aria-label="Close"
        @click="onClose"
      >
        <svg width="9.5" height="9.5" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M1 1l10 10M11 1L1 11"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      </DesktopWindowNavButton>
    </div>
  </DesktopCoreWindowNav>
</template>

<style scoped>
.paper-window-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-shrink: 0;
  min-height: 2rem;
  padding: 0 0.5rem;
  border-bottom: 1px solid var(--paper-border-window);
  background: var(--paper-surface);
}

.paper-window-nav__title-container {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.paper-window-nav__icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--paper-text-secondary);
}

.paper-window-nav__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.2;
  color: var(--paper-text);
}

.paper-window-nav__close {
  position: relative;
  z-index: 2;
}

.owd-window-nav__btn-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
