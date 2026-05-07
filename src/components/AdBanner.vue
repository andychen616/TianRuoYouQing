<template>
  <div class="ad-container
    h-auto
    /* 重点：这里 完全 不留任何上下间距！ */
    m-0
    rounded-lg 
    p-0 
    flex 
    items-center 
    justify-center 
    border-2 
    border-dashed 
    border-transparent
    dark:border-gray-800/30 
    overflow-hidden">

    <img 
      v-if="imageUrl"
      :src="imageUrl"
      alt="图片"
      class="h-full w-full object-cover object-center"
    >
  </div>
</template>

<script>
export default {
  props: {
    imageUrl: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.ad-container {
  background-color: transparent !important;
  margin: 0 !important; /* 强制清除所有间距 */
  padding: 0 !important;
}
</style>