<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useApplicationManager } from '@owdproject/core/runtime/composables/useApplicationManager'
import { useApplicationEntries } from '@owdproject/core/runtime/composables/useApplicationEntries'
import { useDesktopVolumeStore } from '@owdproject/core/runtime/stores/storeDesktopVolume'
import { usePaperAppearance } from '../composables/usePaperAppearance'

const open = ref(false)
const calendarOpen = ref(false)
const time = ref('')
const barRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const clockRef = ref<HTMLButtonElement | null>(null)
const panelPos = ref({ top: '0px', left: '0px', minWidth: '18rem' })
const calendarPos = ref({ top: '0px', left: '0px', minWidth: '17.5rem' })
const volumeOpen = ref(false)
const volumeRef = ref<HTMLButtonElement | null>(null)
const volumePos = ref({ top: '0px', left: '0px', minWidth: '11.5rem' })
const volumeBeforeMute = ref(100)
const muted = ref(false)

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const today = startOfDay(new Date())
const selectedDate = ref(startOfDay(new Date()))
const viewDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))

const applicationManager = useApplicationManager()
const apps = useApplicationEntries().sortedAppEntries('title', 'primary')
const { appearance, toggleAppearance } = usePaperAppearance()
const volumeStore = useDesktopVolumeStore()

const appCount = computed(() => apps.value.length)

const runningApps = computed(() => applicationManager.appsRunning.value)

const isDark = computed(() => appearance.value === 'dark')

const appearanceLabel = computed(() =>
  isDark.value ? 'Switch to light mode' : 'Switch to dark mode',
)

const volumeLevel = computed(() => volumeStore.master)

const isVolumeMuted = computed(
  () => muted.value || volumeLevel.value === 0,
)

const volumeLabel = computed(() => {
  if (isVolumeMuted.value) return 'Volume, muted'
  return `Volume, ${volumeLevel.value}%`
})

const { te, t } = useI18n()

const groupedApps = computed(() => {
  const map = new Map<string, ApplicationEntryWithInherited[]>()
  for (const entry of apps.value) {
    const category = entry.category?.trim() || 'Programs'
    const list = map.get(category) ?? []
    list.push(entry)
    map.set(category, list)
  }
  return [...map.entries()]
    .map(([category, entries]) => {
      const translationKey = `applications.categories.${category}`
      const translatedName = te(translationKey) ? t(translationKey) : category
      return { category, translatedName, entries }
    })
    .sort((a, b) => a.translatedName.localeCompare(b.translatedName))
    .map(({ category, entries }) => ({
      category,
      entries: [...entries].sort((a, b) =>
        (a.title || '').localeCompare(b.title || ''),
      ),
    }))
})

const showGroupHeaders = computed(() => {
  const groups = groupedApps.value
  if (groups.length <= 1) return false
  return !(
    groups.length === 1 &&
    (groups[0]?.category === 'Programs' ||
      groups[0]?.category === 'Other')
  )
})

function entrySubtitle(entry: ApplicationEntryWithInherited) {
  const desc = entry.application.config.description?.trim()
  if (desc && desc !== entry.title) return desc
  return ''
}

function isIconUrl(icon: string) {
  return (
    icon.startsWith('http://') ||
    icon.startsWith('https://') ||
    icon.startsWith('/') ||
    icon.startsWith('data:')
  )
}

function isAppFocused(application: IApplicationController) {
  return [...application.windows.values()].some(
    (w) => w.state.active && w.state.focused,
  )
}

function getAppTargetWindow(application: IApplicationController) {
  const windows = [...application.windows.values()]
  if (windows.length === 0) return undefined
  const focused = windows.find((w) => w.state.focused && w.state.active)
  if (focused) return focused
  const active = windows.find((w) => w.state.active)
  if (active) return active
  return windows[windows.length - 1]
}

function focusRunningApp(application: IApplicationController) {
  const window = getAppTargetWindow(application)
  if (!window) return
  if (window.state.active && window.state.focused) {
    window.actions.minimize()
    return
  }
  if (!window.state.active) {
    window.actions.setActive(true)
  }
  window.actions.bringToFront()
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const monthLabel = computed(() =>
  viewDate.value.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  }),
)

const calendarCells = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: { date: Date | null; key: string }[] = []

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ date: null, key: `pad-${year}-${month}-${i}` })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      date: new Date(year, month, day),
      key: `${year}-${month}-${day}`,
    })
  }
  return cells
})

function tick() {
  time.value = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function updatePanelPosition() {
  const trigger = triggerRef.value
  const bar = barRef.value
  if (!trigger || !bar) return
  const triggerRect = trigger.getBoundingClientRect()
  const barRect = bar.getBoundingClientRect()
  const panelMin = 288
  const panelMax = Math.min(360, window.innerWidth - 24)
  const width = Math.max(panelMin, Math.min(panelMax, panelMax))
  let left = triggerRect.left
  if (left + width > window.innerWidth - 12) {
    left = window.innerWidth - 12 - width
  }
  left = Math.max(12, left)

  panelPos.value = {
    top: `${barRect.bottom + 6}px`,
    left: `${left}px`,
    minWidth: `${width}px`,
  }
}

function updateCalendarPosition() {
  const trigger = clockRef.value
  const bar = barRef.value
  if (!trigger || !bar) return
  const triggerRect = trigger.getBoundingClientRect()
  const barRect = bar.getBoundingClientRect()
  const width = 280
  let left = triggerRect.right - width
  left = Math.max(12, Math.min(left, window.innerWidth - width - 12))

  calendarPos.value = {
    top: `${barRect.bottom + 6}px`,
    left: `${left}px`,
    minWidth: `${width}px`,
  }
}

function updateVolumePosition() {
  const trigger = volumeRef.value
  const bar = barRef.value
  if (!trigger || !bar) return
  const triggerRect = trigger.getBoundingClientRect()
  const barRect = bar.getBoundingClientRect()
  const width = 184
  let left = triggerRect.right - width
  left = Math.max(12, Math.min(left, window.innerWidth - width - 12))

  volumePos.value = {
    top: `${barRect.bottom + 6}px`,
    left: `${left}px`,
    minWidth: `${width}px`,
  }
}

function toggleApps() {
  calendarOpen.value = false
  volumeOpen.value = false
  open.value = !open.value
}

function closeApps() {
  open.value = false
}

function toggleCalendar() {
  open.value = false
  volumeOpen.value = false
  if (!calendarOpen.value) {
    const now = startOfDay(new Date())
    selectedDate.value = now
    viewDate.value = new Date(now.getFullYear(), now.getMonth(), 1)
  }
  calendarOpen.value = !calendarOpen.value
}

function closeCalendar() {
  calendarOpen.value = false
}

function toggleVolume() {
  open.value = false
  calendarOpen.value = false
  volumeOpen.value = !volumeOpen.value
}

function closeVolume() {
  volumeOpen.value = false
}

function onVolumeInput(e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  muted.value = false
  volumeStore.setMasterVolume(value)
}

function toggleMute() {
  if (isVolumeMuted.value) {
    volumeStore.setMasterVolume(volumeBeforeMute.value || 50)
    muted.value = false
  } else {
    volumeBeforeMute.value = volumeLevel.value
    volumeStore.setMasterVolume(0)
    muted.value = true
  }
}

function selectDay(date: Date) {
  selectedDate.value = startOfDay(date)
}

function prevMonth() {
  const d = viewDate.value
  viewDate.value = new Date(d.getFullYear(), d.getMonth() - 1, 1)
}

function nextMonth() {
  const d = viewDate.value
  viewDate.value = new Date(d.getFullYear(), d.getMonth() + 1, 1)
}

async function launch(entry: ApplicationEntryWithInherited) {
  if (!entry.application?.id || !entry.command) return
  await applicationManager.execAppCommand(entry.application.id, entry.command)
  closeApps()
}

let timer: ReturnType<typeof setInterval>

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (volumeOpen.value) closeVolume()
  else if (calendarOpen.value) closeCalendar()
  else if (open.value) closeApps()
}

function onResize() {
  if (open.value) updatePanelPosition()
  if (calendarOpen.value) updateCalendarPosition()
  if (volumeOpen.value) updateVolumePosition()
}

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  updatePanelPosition()
})

watch(calendarOpen, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  updateCalendarPosition()
})

watch(volumeOpen, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  updateVolumePosition()
})

onMounted(() => {
  tick()
  timer = setInterval(tick, 30_000)
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <header
    ref="barRef"
    class="paper-bar owd-desktop__system-bar"
    :class="{ 'paper-bar--menu-open': open || calendarOpen || volumeOpen }"
  >
    <div class="paper-bar__start">
      <button
        ref="triggerRef"
        type="button"
        class="paper-bar__trigger"
        :class="{ 'paper-bar__trigger--open': open }"
        :aria-expanded="open"
        aria-haspopup="menu"
        @click="toggleApps()"
      >
        <span class="paper-bar__trigger-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect
              x="2"
              y="2"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
            />
            <rect
              x="9"
              y="2"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
            />
            <rect
              x="2"
              y="9"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
            />
            <rect
              x="9"
              y="9"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
            />
          </svg>
        </span>
        <span class="paper-bar__trigger-label">Applications</span>
        <span v-if="appCount > 0" class="paper-bar__trigger-badge">{{
          appCount
        }}</span>
      </button>
      <div
        v-if="runningApps.length > 0"
        class="paper-bar__running"
        role="list"
        aria-label="Open applications"
      >
        <button
          v-for="application in runningApps"
          :key="`${application.id}-${application.openWindowCount.value}`"
          type="button"
          role="listitem"
          class="paper-bar__app-btn"
          :class="{ 'paper-bar__app-btn--active': isAppFocused(application) }"
          :title="application.config.title"
          :aria-label="application.config.title"
          @click="focusRunningApp(application)"
        >
          <img
            v-if="application.config.icon && isIconUrl(application.config.icon)"
            class="paper-bar__app-btn-img"
            :src="application.config.icon"
            alt=""
          />
          <Icon
            v-else-if="application.config.icon"
            :name="application.config.icon"
            :size="16"
          />
          <span v-else class="paper-bar__app-btn-fallback">
            {{ (application.config.title || '?').charAt(0).toUpperCase() }}
          </span>
        </button>
      </div>

    </div>

    <div class="paper-bar__end">
      <button
        type="button"
        class="paper-bar__icon-btn"
        :aria-label="appearanceLabel"
        :aria-pressed="isDark"
        @click="toggleAppearance()"
      >
        <svg
          v-if="isDark"
          class="paper-bar__icon-btn-svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="3.25" stroke="currentColor" stroke-width="1.5" />
          <path
            d="M8 1.25v1.5M8 13.25v1.5M1.25 8h1.5M13.25 8h1.5M3.1 3.1l1.06 1.06M11.84 11.84l1.06 1.06M3.1 12.9l1.06-1.06M11.84 4.16l1.06-1.06"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <svg
          v-else
          class="paper-bar__icon-btn-svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 2.5a5.5 5.5 0 1 0 0 11 4 4 0 0 1 0-11z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        ref="volumeRef"
        type="button"
        class="paper-bar__icon-btn"
        :class="{ 'paper-bar__icon-btn--open': volumeOpen }"
        :aria-expanded="volumeOpen"
        aria-haspopup="dialog"
        :aria-label="volumeLabel"
        @click="toggleVolume()"
      >
        <svg
          v-if="isVolumeMuted"
          class="paper-bar__icon-btn-svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6.5v3h2.5L9 13V3L5.5 6.5H3z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <path
            d="M11.5 6l3 4-3 4M14.5 6l-3 4 3 4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <svg
          v-else-if="volumeLevel <= 33"
          class="paper-bar__icon-btn-svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6.5v3h2.5L9 13V3L5.5 6.5H3z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <path
            d="M11 8.5c0-1-.5-1.75-1-2.25"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <svg
          v-else-if="volumeLevel <= 66"
          class="paper-bar__icon-btn-svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6.5v3h2.5L9 13V3L5.5 6.5H3z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <path
            d="M10.5 6.5a3 3 0 0 1 0 3M12.5 5a5 5 0 0 1 0 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <svg
          v-else
          class="paper-bar__icon-btn-svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6.5v3h2.5L9 13V3L5.5 6.5H3z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <path
            d="M10.5 5.5a4.5 4.5 0 0 1 0 5M12.5 3.5a7.5 7.5 0 0 1 0 9"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <button
        ref="clockRef"
        type="button"
        class="paper-bar__icon-btn paper-bar__time"
        :class="{ 'paper-bar__icon-btn--open': calendarOpen }"
        :aria-expanded="calendarOpen"
        aria-haspopup="dialog"
        :aria-label="`Calendar, ${monthLabel}`"
        @click="toggleCalendar()"
      >
        <time :datetime="selectedDate.toISOString().slice(0, 10)">{{ time }}</time>
      </button>
    </div>
  </header>

  <Teleport to="body">
    <Transition name="paper-menu">
      <div v-if="open" class="paper-menu" role="presentation">
        <button
          type="button"
          class="paper-menu__scrim"
          aria-label="Close menu"
          @click="closeApps()"
        />
        <nav
          class="paper-menu__panel"
          role="menu"
          aria-label="Applications"
          :style="{
            top: panelPos.top,
            left: panelPos.left,
            minWidth: panelPos.minWidth,
          }"
        >
          <header class="paper-menu__header">
            <p class="paper-menu__eyebrow">Launch</p>
            <p class="paper-menu__title">Applications</p>
          </header>

          <p v-if="apps.length === 0" class="paper-menu__empty">
            No applications installed.
          </p>

          <div v-else class="paper-menu__body">
            <section
              v-for="group in groupedApps"
              :key="group.category"
              class="paper-menu__section"
            >
              <h2
                v-if="showGroupHeaders"
                class="paper-menu__section-title"
              >
                {{ $te(`applications.categories.${group.category}`) ? $t(`applications.categories.${group.category}`) : group.category }}
              </h2>
              <ul class="paper-menu__list" role="none">
                <li
                  v-for="(entry, i) in group.entries"
                  :key="`${entry.application.id}:${entry.command}:${i}`"
                  role="none"
                >
                  <button
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
                        :size="18"
                      />
                      <span v-else class="paper-menu__icon-fallback">
                        {{ (entry.title || '?').charAt(0).toUpperCase() }}
                      </span>
                    </span>
                    <span class="paper-menu__copy">
                      <span class="paper-menu__label">{{ entry.title }}</span>
                      <span
                        v-if="entrySubtitle(entry)"
                        class="paper-menu__meta"
                      >
                        {{ entrySubtitle(entry) }}
                      </span>
                    </span>
                    <span class="paper-menu__chevron" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <path
                          d="M5 3l4 4-4 4"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </li>
              </ul>
            </section>
          </div>
        </nav>
      </div>
    </Transition>

    <Transition name="paper-menu">
      <div v-if="calendarOpen" class="paper-menu" role="presentation">
        <button
          type="button"
          class="paper-menu__scrim"
          aria-label="Close calendar"
          @click="closeCalendar()"
        />
        <div
          class="paper-calendar paper-menu__panel"
          role="dialog"
          aria-label="Calendar"
          :style="{
            top: calendarPos.top,
            left: calendarPos.left,
            minWidth: calendarPos.minWidth,
          }"
        >
          <header class="paper-calendar__nav">
            <button
              type="button"
              class="paper-calendar__nav-btn"
              aria-label="Previous month"
              @click="prevMonth()"
            >
              ‹
            </button>
            <p class="paper-calendar__month">{{ monthLabel }}</p>
            <button
              type="button"
              class="paper-calendar__nav-btn"
              aria-label="Next month"
              @click="nextMonth()"
            >
              ›
            </button>
          </header>

          <div class="paper-calendar__weekdays" aria-hidden="true">
            <span
              v-for="label in WEEKDAYS"
              :key="label"
              class="paper-calendar__weekday"
            >
              {{ label }}
            </span>
          </div>

          <div class="paper-calendar__grid" role="grid">
            <button
              v-for="cell in calendarCells"
              :key="cell.key"
              type="button"
              class="paper-calendar__day"
              :class="{
                'paper-calendar__day--empty': !cell.date,
                'paper-calendar__day--today':
                  cell.date && isSameDay(cell.date, today),
                'paper-calendar__day--selected':
                  cell.date && isSameDay(cell.date, selectedDate),
              }"
              role="gridcell"
              :tabindex="cell.date ? 0 : -1"
              :disabled="!cell.date"
              :aria-label="
                cell.date
                  ? cell.date.toLocaleDateString(undefined, {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : undefined
              "
              :aria-selected="
                cell.date ? isSameDay(cell.date, selectedDate) : undefined
              "
              @click="cell.date && selectDay(cell.date)"
            >
              {{ cell.date?.getDate() }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="paper-menu">
      <div v-if="volumeOpen" class="paper-menu" role="presentation">
        <button
          type="button"
          class="paper-menu__scrim"
          aria-label="Close volume"
          @click="closeVolume()"
        />
        <div
          class="paper-volume paper-menu__panel"
          role="dialog"
          aria-label="Volume"
          :style="{
            top: volumePos.top,
            left: volumePos.left,
            minWidth: volumePos.minWidth,
          }"
        >
          <div class="paper-volume__row">
            <button
              type="button"
              class="paper-volume__mute"
              :aria-label="isVolumeMuted ? 'Unmute' : 'Mute'"
              :aria-pressed="isVolumeMuted"
              @click="toggleMute()"
            >
              <svg
                v-if="isVolumeMuted"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 6.5v3h2.5L9 13V3L5.5 6.5H3z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
                <path
                  d="M11.5 6l3 4-3 4M14.5 6l-3 4 3 4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              <svg
                v-else
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 6.5v3h2.5L9 13V3L5.5 6.5H3z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
                <path
                  d="M10.5 5.5a4.5 4.5 0 0 1 0 5M12.5 3.5a7.5 7.5 0 0 1 0 9"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
            <input
              type="range"
              class="paper-volume__slider"
              min="0"
              max="100"
              step="1"
              :value="volumeLevel"
              :aria-valuenow="volumeLevel"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Volume level"
              @input="onVolumeInput"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.paper-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  height: var(--paper-bar-height);
  padding: 0 1rem;
  border-bottom: 1px solid var(--paper-border);
  background: var(--paper-surface);
}

.paper-bar--menu-open {
  border-bottom-color: var(--paper-border);
}

.paper-bar__start {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
}

.paper-bar__running {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  min-width: 0;
  max-width: min(40vw, 24rem);
  overflow-x: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.paper-bar__running::-webkit-scrollbar {
  display: none;
}

.paper-bar__app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.625rem;
  height: 1.625rem;
  margin: 0;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--paper-radius);
  background: none;
  color: var(--paper-text-secondary);
  cursor: pointer;
  opacity: 0.72;
  transition:
    border-color 0.12s ease,
    background-color 0.12s ease,
    color 0.12s ease,
    opacity 0.12s ease;
}

.paper-bar__app-btn:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--paper-bg) 80%, transparent);
}

.paper-bar__app-btn--active,
.paper-bar__app-btn--active:hover {
  opacity: 1;
  border-color: var(--paper-border);
  background: var(--paper-accent-soft);
  color: var(--paper-accent);
}

.paper-bar__app-btn-img {
  width: 1rem;
  height: 1rem;
  object-fit: contain;
}

.paper-bar__app-btn-fallback {
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1;
}

.paper-bar__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.375rem 0.75rem 0.375rem 0.625rem;
  border: 1px solid var(--paper-border);
  border-radius: var(--paper-radius);
  background: var(--paper-surface);
  color: var(--paper-text);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease,
    color 0.15s ease;
}

.paper-bar__trigger:hover {
  border-color: var(--paper-border);
  background: var(--paper-bg);
}

.paper-bar__trigger--open,
.paper-bar__trigger--open:hover {
  border-color: color-mix(in srgb, var(--paper-accent) 35%, var(--paper-border));
  background: var(--paper-accent-soft);
  color: var(--paper-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--paper-accent) 12%, transparent);
}

.paper-bar__trigger-icon {
  display: flex;
  color: var(--paper-text-secondary);
}

.paper-bar__trigger--open .paper-bar__trigger-icon {
  color: var(--paper-accent);
}

.paper-bar__trigger-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.125rem;
  height: 1.125rem;
  padding: 0 0.25rem;
  border-radius: var(--paper-radius-pill);
  background: var(--paper-bg);
  color: var(--paper-text-secondary);
  font-size: 0.6875rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.paper-bar__trigger--open .paper-bar__trigger-badge {
  background: var(--paper-accent-soft);
  color: var(--paper-accent);
}

.paper-bar__end {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  margin-left: auto;
  margin-right: -0.375rem;
}

.paper-bar__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0.25rem 0.375rem;
  border: none;
  border-radius: var(--paper-radius);
  background: none;
  color: var(--paper-text-secondary);
  font: inherit;
  cursor: pointer;
  transition:
    background-color 0.12s ease,
    color 0.12s ease;
}

.paper-bar__icon-btn-svg {
  display: block;
}

.paper-bar__time {
  font-family: var(--paper-mono);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.paper-bar__icon-btn:hover {
  color: var(--paper-text);
  background: color-mix(in srgb, var(--paper-bg) 80%, transparent);
}

.paper-bar__icon-btn--open,
.paper-bar__icon-btn--open:hover {
  color: var(--paper-accent);
  background: var(--paper-accent-soft);
}

/* Menu overlay */
.paper-menu {
  position: fixed;
  inset: 0;
  z-index: var(--paper-z-menu);
  pointer-events: none;
}

.paper-menu__scrim {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--paper-scrim);
  cursor: default;
  pointer-events: auto;
}

.paper-menu__panel {
  position: fixed;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-height: min(28rem, calc(100dvh - var(--paper-bar-height) - 1.5rem));
  overflow: hidden;
  border: 1px solid var(--paper-border);
  border-radius: var(--paper-radius);
  background-color: var(--paper-menu-bg);
  box-shadow: none;
  pointer-events: auto;
}

.paper-menu__header {
  flex-shrink: 0;
  padding: 0.875rem 1rem 0.625rem;
  border-bottom: 1px solid var(--paper-border);
  background-color: var(--paper-menu-header-bg);
}

.paper-menu__eyebrow {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--paper-accent);
}

.paper-menu__title {
  margin: 0.125rem 0 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--paper-text);
}

.paper-menu__body {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.25rem 0 0.375rem;
  background-color: var(--paper-menu-bg);
}

.paper-menu__section + .paper-menu__section {
  margin-top: 0.25rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--paper-border);
}

.paper-menu__section-title {
  margin: 0;
  padding: 0.5rem 1rem 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--paper-text-tertiary);
}

.paper-menu__list {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin: 0;
  padding: 0 0.375rem;
  list-style: none;
}

.paper-menu__empty {
  margin: 0;
  padding: 1rem 1rem 1.125rem;
  font-size: 0.8125rem;
  color: var(--paper-text-secondary);
  background-color: var(--paper-menu-bg);
}

.paper-menu__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  margin: 0;
  padding: 0.5rem 0.625rem;
  border: none;
  border-radius: var(--paper-radius);
  background: none;
  color: var(--paper-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.12s ease,
    color 0.12s ease;
}

.paper-menu__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--paper-radius);
  background: var(--paper-bg);
  color: var(--paper-text-secondary);
}

.paper-menu__icon-img {
  width: 1.125rem;
  height: 1.125rem;
  object-fit: contain;
}

.paper-menu__icon-fallback {
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;
}

.paper-menu__copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.paper-menu__label {
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.paper-menu__meta {
  overflow: hidden;
  font-size: 0.75rem;
  line-height: 1.2;
  color: var(--paper-text-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.paper-menu__chevron {
  flex-shrink: 0;
  color: var(--paper-text-tertiary);
  opacity: 0;
  transform: translateX(-4px);
  transition:
    opacity 0.12s ease,
    transform 0.12s ease,
    color 0.12s ease;
}

.paper-menu__item:hover,
.paper-menu__item:focus-visible {
  background: var(--paper-accent-soft);
  outline: none;
}

.paper-menu__item:hover .paper-menu__label,
.paper-menu__item:focus-visible .paper-menu__label {
  color: var(--paper-accent);
}

.paper-menu__item:hover .paper-menu__icon,
.paper-menu__item:focus-visible .paper-menu__icon {
  background: color-mix(in srgb, var(--paper-accent) 12%, white);
  color: var(--paper-accent);
}

.paper-menu__item:hover .paper-menu__chevron,
.paper-menu__item:focus-visible .paper-menu__chevron {
  opacity: 1;
  transform: translateX(0);
  color: var(--paper-accent);
}

/* Enter / leave */
.paper-menu-enter-active,
.paper-menu-leave-active {
  transition: opacity 0.18s ease;
}

.paper-menu-enter-active .paper-menu__panel,
.paper-menu-leave-active .paper-menu__panel {
  transition:
    opacity 0.18s ease,
    transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}

.paper-menu-enter-from,
.paper-menu-leave-to {
  opacity: 0;
}

.paper-menu-enter-from .paper-menu__panel,
.paper-menu-leave-to .paper-menu__panel {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

/* Calendar */
.paper-calendar {
  padding: 0.75rem;
  background-color: var(--paper-menu-bg);
}

.paper-calendar__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.paper-calendar__month {
  margin: 0;
  flex: 1;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  color: var(--paper-text);
}

.paper-calendar__nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  margin: 0;
  padding: 0;
  border: 1px solid var(--paper-border);
  border-radius: var(--paper-radius);
  background: var(--paper-surface);
  color: var(--paper-text-secondary);
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
}

.paper-calendar__nav-btn:hover {
  border-color: var(--paper-border);
  color: var(--paper-text);
  background: var(--paper-bg);
}

.paper-calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.125rem;
  margin-bottom: 0.25rem;
}

.paper-calendar__weekday {
  font-size: 0.6875rem;
  font-weight: 600;
  text-align: center;
  color: var(--paper-text-tertiary);
}

.paper-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.125rem;
}

.paper-calendar__day {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  min-height: 2rem;
  margin: 0;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--paper-radius);
  background: none;
  color: var(--paper-text);
  font: inherit;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.paper-calendar__day--empty {
  visibility: hidden;
  pointer-events: none;
}

.paper-calendar__day:not(.paper-calendar__day--empty):hover {
  background: var(--paper-bg);
}

.paper-calendar__day--today:not(.paper-calendar__day--selected) {
  border-color: var(--paper-border);
  font-weight: 600;
}

.paper-calendar__day--selected {
  border-color: color-mix(in srgb, var(--paper-accent) 40%, var(--paper-border));
  background: var(--paper-accent-soft);
  color: var(--paper-accent);
  font-weight: 600;
}

.paper-calendar__day--selected:hover {
  background: var(--paper-accent-soft);
}

/* Volume */
.paper-volume {
  padding: 0.625rem 0.75rem;
  background-color: var(--paper-menu-bg);
}

.paper-volume__row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.paper-volume__mute {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  margin: 0;
  padding: 0;
  border: 1px solid var(--paper-border);
  border-radius: var(--paper-radius);
  background: var(--paper-surface);
  color: var(--paper-text-secondary);
  cursor: pointer;
}

.paper-volume__mute:hover {
  border-color: var(--paper-border);
  color: var(--paper-text);
  background: var(--paper-bg);
}

.paper-volume__slider {
  flex: 1;
  min-width: 0;
  height: 0.25rem;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--paper-radius-pill);
  background: var(--paper-border);
  accent-color: var(--paper-accent);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.paper-volume__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 0.875rem;
  height: 0.875rem;
  border: 1px solid var(--paper-border);
  border-radius: var(--paper-radius-circle);
  background: var(--paper-surface);
  box-shadow: none;
  cursor: pointer;
}

.paper-volume__slider::-moz-range-thumb {
  width: 0.875rem;
  height: 0.875rem;
  border: 1px solid var(--paper-border);
  border-radius: var(--paper-radius-circle);
  background: var(--paper-surface);
  box-shadow: none;
  cursor: pointer;
}

.paper-volume__slider:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--paper-accent) 40%, transparent);
  outline-offset: 2px;
}
</style>
