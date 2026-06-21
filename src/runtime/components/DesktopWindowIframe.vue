<script setup lang="ts">
const props = defineProps<{
  config?: WindowConfig
  window?: IWindowController
  src: string
}>()
</script>

<template>
  <DesktopWindow v-bind="$props">
    <template #nav-prepend>
      <slot name="nav-prepend" />
    </template>
    <template #nav-append>
      <slot name="nav-append" />
    </template>
    <iframe :src="src" />
  </DesktopWindow>
</template>

<style scoped lang="scss">
iframe {
  display: block;
  flex: 1 1 auto;
  min-height: 0;
  border: 0;
  width: 100%;
  height: 100%;
}
</style>
