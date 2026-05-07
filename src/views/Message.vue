<template>
  <div class="h-screen flex flex-col">
    <div class="flex flex-1 overflow-hidden relative">
      <main class="flex-1 flex flex-col p-4 overflow-y-auto">
        <div class="max-w-4xl mx-auto w-full">
          <!-- ====================== 点击这里 → 直接返回主页 ====================== -->
          <h2 
            class="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-8 text-center hover:text-purple-800 dark:hover:text-purple-300 transition-colors cursor-pointer"
            @click="$router.push('/')"
          >
            网友留言板
          </h2>

          <!-- 留言列表 -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div v-if="loading" class="text-center py-8 text-gray-500">
              加载中...
            </div>
            <div v-else-if="messages.length === 0" class="text-center py-8 text-gray-500">
              暂无留言，快来抢沙发～
            </div>
            <div v-else class="space-y-4">
              <div v-for="(msg, idx) in messages" :key="idx" class="p-4 border dark:border-gray-700 rounded-lg">
                <div class="font-bold text-blue-500">{{ msg.nickname }}</div>
                <div class="my-2 whitespace-pre-wrap">{{ msg.content }}</div>
                <div class="text-xs text-gray-400">{{ msg.createTime }}</div>
              </div>
            </div>
          </div>

          <!-- 提交留言 -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">我要留言</h3>
            <input
              v-model="nickname"
              type="text"
              placeholder="输入昵称"
              class="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:border-gray-600 mb-3"
            >
            <textarea
              v-model="content"
              rows="4"
              placeholder="分享你的想法..."
              class="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:border-gray-600 mb-3"
            ></textarea>
            <button
              @click="submitMessage"
              :disabled="submitting"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {{ submitting ? '提交中...' : '提交留言' }}
            </button>
          </div>
        </div>

        <Footer class="mt-8" />
      </main>
    </div>
  </div>
</template>

<script>
import Footer from '../components/Footer.vue'

export default {
  components: { Footer },
  data() {
    return {
      loading: false,
      submitting: false,
      messages: [],
      nickname: '',
      content: ''
    }
  },
  mounted() {
    this.loadMessages()
  },
  methods: {
    async loadMessages() {
      this.loading = true
      try {
        const apiKey = localStorage.getItem('messageApiKey') || localStorage.getItem('apiKey')
        const dst = localStorage.getItem('messageDatasheetId')
        const view = localStorage.getItem('messageViewId')

        const res = await fetch(`https://api.vika.cn/fusion/v1/datasheets/${dst}/records?viewId=${view}`, {
          headers: { Authorization: 'Bearer ' + apiKey }
        })
        const data = await res.json()
        if (data.success) {
          this.messages = data.data.records.map(r => r.fields).reverse()
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async submitMessage() {
      if (!this.nickname || !this.content) {
        alert('请输入昵称和内容')
        return
      }
      this.submitting = true
      try {
        const apiKey = localStorage.getItem('messageApiKey') || localStorage.getItem('apiKey')
        const dst = localStorage.getItem('messageDatasheetId')

        await fetch(`https://api.vika.cn/fusion/v1/datasheets/${dst}/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + apiKey
          },
          body: JSON.stringify({
            records: [{
              fields: {
                nickname: this.nickname,
                content: this.content,
                createTime: new Date().toLocaleString()
              }
            }]
          })
        })
        alert('提交成功！')
        this.nickname = ''
        this.content = ''
        this.loadMessages()
      } catch (e) {
        alert('提交失败')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>