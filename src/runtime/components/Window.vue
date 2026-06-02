<script setup lang="ts">
import { computed, useAttrs } from 'vue'

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
</script>

<template>
  <DesktopWindow
    :window="windowRef"
    :content="contentRef"
    v-show="windowRef?.state?.active !== false"
    class="paper-window"
  >
    <div class="paper-window__frame">
      <WindowNav />
      <WindowContent>
        <slot />
      </WindowContent>
    </div>
  </DesktopWindow>
</template>

<style scoped>
.paper-window__frame {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--paper-surface);
  border: 1px solid var(--paper-border);
}

.paper-window :deep(.owd-window__content) {
  flex: 1;
  min-height: 0;
}
</style>
