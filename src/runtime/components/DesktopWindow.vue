<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useWindowDragHandlers } from '@owdproject/core/runtime/composables/useWindowDragHandlers'

const props = defineProps<{
  window?: IWindowController
  content?: WindowContent
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const windowRef = computed(
  () => (props.window ?? attrs.window) as IWindowController | undefined,
)
const contentRef = computed(
  () => (props.content ?? attrs.content) as WindowContent | undefined,
)

const { onDragStart, onDragEnd } = useWindowDragHandlers(
  () => windowRef.value,
)
</script>

<template>
  <DesktopCoreWindow
    :window="windowRef"
    :content="contentRef"
    v-show="windowRef?.state?.active !== false"
    class="paper-window"
    @drag:start="onDragStart"
    @drag:end="onDragEnd"
  >
    <div class="paper-window__frame">
      <DesktopWindowNav />
      <DesktopWindowContent>
        <slot />
      </DesktopWindowContent>
    </div>
  </DesktopCoreWindow>
</template>

<style scoped>
.paper-window {
  border-radius: var(--paper-radius);
  overflow: hidden;
}

.paper-window__frame {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--paper-surface);
  border: 1px solid var(--paper-border);
  border-radius: var(--paper-radius);
}

.paper-window :deep(.owd-window__content) {
  flex: 1;
  min-height: 0;
}
</style>
