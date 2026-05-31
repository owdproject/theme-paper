<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useApplicationManager } from '@owdproject/core/runtime/composables/useApplicationManager'
import { useApplicationEntries } from '@owdproject/core/runtime/composables/useApplicationEntries'

const open = ref(false)
const time = ref('')
const menuBtn = ref<HTMLElement | null>(null)
const panelPos = ref({ top: '2.5rem', left: '1rem', minWidth: '11rem' })

const applicationManager = useApplicationManager()
const apps = useApplicationEntries().sortedAppEntries('title', 'primary')

function isIconUrl(icon: string) {
  return (
    icon.startsWith('http://') ||
    icon.startsWith('https://') ||
    icon.startsWith('/') ||
    icon.startsWith('data:')
  )
}

function tick() {
  time.value = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function updatePanelPosition() {
  const el = menuBtn.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  panelPos.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    minWidth: `${Math.max(rect.width, 176)}px`,
  }
}

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

async function launch(entry: ApplicationEntryWithInherited) {
  if (!entry.application?.id || !entry.command) return
  await applicationManager.execAppCommand(entry.application.id, entry.command)
  close()
}

let timer: ReturnType<typeof setInterval>

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) close()
}

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  updatePanelPosition()
})

onMounted(() => {
  tick()
  timer = setInterval(tick, 30_000)
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', updatePanelPosition)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', updatePanelPosition)
})
</script>

<template>
  <header class="paper-bar owd-desktop__system-bar">
    <button
      ref="menuBtn"
      type="button"
      class="paper-bar__menu"
      :class="{ 'paper-bar__menu--open': open }"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle()"
    >
      Menu
    </button>
    <span class="paper-bar__spacer" />
    <span class="paper-bar__time">{{ time }}</span>
  </header>

  <Teleport to="body">
    <div v-if="open" class="paper-menu" role="presentation">
      <button
        type="button"
        class="paper-menu__backdrop"
        aria-label="Close menu"
        @click="close()"
      />
      <nav
        class="paper-menu__panel"
        role="menu"
        :style="{
          top: panelPos.top,
          left: panelPos.left,
          minWidth: panelPos.minWidth,
        }"
      >
        <p v-if="apps.length === 0" class="paper-menu__empty">
          No applications
        </p>
        <button
          v-for="(entry, i) in apps"
          :key="`${entry.application.id}:${entry.command}:${i}`"
          type="button"
          role="menuitem"
          class="paper-menu__item"
          @click="launch(entry)"
        >
          <span class="paper-menu__icon" aria-hidden="true">
            <img
              v-if="entry.icon && isIconUrl(entry.icon)"
              class="paper-menu__icon-img"
              :src="entry.icon"
              alt=""
            />
            <Icon
              v-else-if="entry.icon"
              :name="entry.icon"
              :size="16"
            />
          </span>
          <span class="paper-menu__label">{{ entry.title }}</span>
        </button>
      </nav>
    </div>
  </Teleport>
</template>

<style scoped>
.paper-bar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 2.5rem;
  padding: 0 1rem;
  border-bottom: 1px solid var(--paper-line);
  background: var(--paper-surface);
}

.paper-bar__menu {
  margin: 0;
  padding: 0.375rem 0;
  border: none;
  background: none;
  color: var(--paper-text);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
}

.paper-bar__menu:hover,
.paper-bar__menu--open {
  color: var(--paper-accent);
}

.paper-bar__spacer {
  flex: 1;
}

.paper-bar__time {
  font-family: var(--paper-mono);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--paper-text-secondary);
}

.paper-menu {
  position: fixed;
  inset: 0;
  z-index: 10060;
}

.paper-menu__backdrop {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: rgba(24, 24, 27, 0.16);
  cursor: default;
}

.paper-menu__panel {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.375rem;
  max-width: min(18rem, calc(100vw - 1rem));
  max-height: min(18rem, calc(100dvh - 4rem));
  overflow-y: auto;
  border: 1px solid var(--paper-line-strong);
  background: var(--paper-surface);
  box-shadow: 0 4px 16px rgba(24, 24, 27, 0.06);
}

.paper-menu__empty {
  margin: 0;
  padding: 0.5rem 0.625rem;
  font-size: 0.8125rem;
  color: var(--paper-text-secondary);
}

.paper-menu__item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  margin: 0;
  padding: 0.5rem 0.625rem;
  border: none;
  border-radius: 4px;
  background-color: var(--paper-surface);
  color: var(--paper-text);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.paper-menu__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  color: var(--paper-text-secondary);
}

.paper-menu__icon-img {
  width: 1rem;
  height: 1rem;
  object-fit: contain;
}

.paper-menu__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.paper-menu__item:hover,
.paper-menu__item:focus-visible {
  background-color: var(--paper-bg);
  color: var(--paper-accent);
  outline: none;
}

.paper-menu__item:hover .paper-menu__icon,
.paper-menu__item:focus-visible .paper-menu__icon {
  color: var(--paper-accent);
}
</style>
