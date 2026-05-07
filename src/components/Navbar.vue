<template>
  <!-- 半透明+毛玻璃 -->
  <nav class="h-12 sticky top-0 z-30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md px-4 py-2 flex justify-between items-center backdrop-blur-light">
    <!-- 修改为 router-link 以实现跳转 -->
    <router-link to="/" class="text-xl font-bold text-blue-500">
      <i class="fas fa-heart"></i> 实用导航·以简为美
    </router-link>
    
    <!-- 修改搜索区域显示逻辑 -->
    <div class="hidden md:flex items-center gap-2 flex-1 max-w-2xl mx-4">
      <div class="relative">
        <!-- 调整当前选择项的宽度和图标间距 -->
        <a href="javascript:;" 
          class="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1 flex items-center min-w-[120px]"
          @click="showEngines = !showEngines">
          <i :class="engineIcons[selectedEngine]" class="mr-2 text-sm w-4"></i>
          <span class="truncate">{{ engines[selectedEngine].name }}</span>
        </a>
        
        <!-- 调整下拉菜单宽度和选项对齐 -->
        <div v-show="showEngines" 
          class="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg min-w-[160px] z-50">
          <a 
            v-for="(engine, key) in engines" 
            href="javascript:;" 
            class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            @click="selectedEngine = key; showEngines = false"
          >
            <i :class="engineIcons[key]" class="mr-3 w-4 text-center"></i>
            <span class="truncate">{{ engine.name }}</span>
          </a>
        </div>
      </div>

      <!-- 保持原有的 input 和 button 不变 -->
      <input
        type="text"
        v-model="searchQuery"
        :placeholder="engines[selectedEngine].placeholder"
        class="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-1"
        @keyup.enter="search"
      />
      <button 
        @click="search"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg"
      >
        <i class="fas fa-search"></i>  <!-- 使用Font Awesome的搜索图标 -->
      </button>
    </div>
    
    <!-- 右侧按钮区域 -->
    <div class="flex items-center gap-0">
      <!-- 新增提交按钮 -->
      <div class="relative group w-8 h-8 flex items-center justify-center">
        <button
          @click="showPasswordDialog = true"
          class="w-full h-full flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
        >
          <i class="fas fa-plus-circle hover:scale-110 transition-transform duration-300"></i>
        </button>
        <span class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-center">添加网站</span>
      </div>
      
      <!-- 新增设置按钮 -->
      <div class="relative group w-8 h-8 flex items-center justify-center">
        <router-link 
          to="/settings"
          class="w-full h-full flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
        >
          <i class="fas fa-cog hover:rotate-90 transition-transform duration-300"></i>
        </router-link>
        <span class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-center">设置</span>
      </div>
      
      <!-- ====================== 【新增】留言按钮 ====================== -->
      <div class="relative group w-8 h-8 flex items-center justify-center">
        <button
          @click="openMessageBoard"
          class="w-full h-full flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
        >
          <i class="fas fa-comment hover:scale-110 transition-transform duration-300"></i>
        </button>
        <span class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-center">留言</span>
      </div>
      
      <!-- 原有的暗黑模式切换按钮 -->
      <div class="relative group w-8 h-8 flex items-center justify-center">
        <button 
          @click="$emit('toggle-dark-mode')" 
          class="w-full h-full flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
        >
          <i class="fas hover:rotate-12 transition-transform" :class="darkMode ? 'fa-sun' : 'fa-moon' "></i>
        </button>
        <span class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-center">{{ darkMode ? '浅色模式' : '暗黑模式' }}</span>
      </div>
    </div>
    
    <!-- 密码验证对话框 -->
    <PasswordDialog
      :visible="showPasswordDialog"
      :categories="categories"
      @close="showPasswordDialog = false"
      @password-validated="showAddWebsiteDialog = true"
    />
    
    <!-- 网址添加对话框 -->
    <AddWebsiteDialog
      :visible="showAddWebsiteDialog"
      :categories="categories"
      @close="showAddWebsiteDialog = false"
      @submit="handleSubmitWebsite"
    />
    
    <!-- ====================== 【新增】留言板弹窗 ====================== -->
    <MessageBoard
      :visible="showMessageBoard"
      @close="closeMessageBoard"
    />
  </nav>
</template>

<script>
import PasswordDialog from './PasswordDialog.vue';
import AddWebsiteDialog from './AddWebsiteDialog.vue';

// ====================== 【新增】留言板组件 ======================
const MessageBoard = {
  name: 'MessageBoard',
  props: ['visible'],
  emits: ['close'],
  data() {
    return {
      messages: [],        // 留言列表
      nickname: '',        // 昵称
      content: '',         // 留言内容
      loading: false,      // 加载中
      submitting: false,   // 提交中
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadMessages(); // 打开时自动加载留言
      }
    }
  },
  methods: {
    // 加载所有留言
    async loadMessages() {
      this.loading = true;
      try {
        const apiKey = localStorage.getItem('apiKey');
        const datasheetId = localStorage.getItem('datasheetId');
        const viewId = localStorage.getItem('viewId');
        
        const res = await fetch(`https://api.vika.cn/fusion/v1/datasheets/${datasheetId}/records?viewId=${viewId}&fieldKey=name`, {
          headers: { Authorization: `Bearer ${apiKey}` }
        });
        const data = await res.json();
        if (data.success) {
          this.messages = data.data.records
            .map(i => i.fields)
            .filter(i => i.nickname && i.content)
            .reverse();
        }
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
    
    // 提交留言
    async submitMessage() {
      if (!this.nickname.trim() || !this.content.trim()) {
        alert('请输入昵称和留言内容');
        return;
      }
      this.submitting = true;
      try {
        const apiKey = localStorage.getItem('apiKey');
        const datasheetId = localStorage.getItem('datasheetId');
        
        await fetch(`https://api.vika.cn/fusion/v1/datasheets/${datasheetId}/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
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
        });
        alert('留言提交成功！');
        this.nickname = '';
        this.content = '';
        this.loadMessages();
      } catch (e) {
        alert('提交失败');
      } finally {
        this.submitting = false;
      }
    },
    
    // 关闭
    close() { this.$emit('close'); }
  },
  template: `
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>
    <div class="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[80vh] rounded-lg shadow-xl overflow-hidden relative flex flex-col">
      <div class="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 class="text-lg font-bold">网友留言板</h3>
        <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">&times;</button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="loading" class="text-center text-gray-500">加载中...</div>
        <div v-else-if="messages.length === 0" class="text-center text-gray-500">暂无留言，快来抢沙发～</div>
        <div v-for="(msg, i) in messages" :key="i" class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
          <div class="font-medium text-blue-600 dark:text-blue-400">{{ msg.nickname }}</div>
          <div class="text-sm mt-1 whitespace-pre-wrap">{{ msg.content }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ msg.createTime }}</div>
        </div>
      </div>
      
      <div class="p-4 border-t dark:border-gray-700 space-y-2">
        <input v-model="nickname" type="text" placeholder="输入你的昵称" class="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600">
        <textarea v-model="content" rows="3" placeholder="分享你的想法..." class="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"></textarea>
        <button @click="submitMessage" :disabled="submitting" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded disabled:opacity-50">
          {{ submitting ? '提交中...' : '提交留言' }}
        </button>
      </div>
    </div>
  </div>
  `
};
// ====================== 【新增结束】 ======================

export default {
  components: {
    PasswordDialog,
    AddWebsiteDialog,
    MessageBoard // 注册留言板组件
  },
  props: ['darkMode', 'categories'],
  data() {
    return {
      showEngines: false,
      searchQuery: '',
      selectedEngine: 'baidu',
      engines: {
        bing: { 
          name: 'Bing', 
          url: 'https://www.bing.com/search?q=', 
          placeholder: '必应搜索...' 
        },
        baidu: { 
          name: '百度', 
          url: 'https://www.baidu.com/s?wd=', 
          placeholder: '百度一下...' 
        },
        google: { 
          name: '谷歌', 
          url: 'https://www.google.com/search?q=',
          placeholder: 'Google搜索...' 
        },
        local: { 
          name: '本地', 
          url: '/search?q=',
          placeholder: '站内搜索...' 
        }
      },
      engineIcons: {
        bing: 'fab fa-microsoft',
        baidu: 'fas fa-paw',
        google: 'fab fa-google', 
        local: 'fas fa-search'
      },
      showPasswordDialog: false,
      showAddWebsiteDialog: false,
      showMessageBoard: false // 留言板显示控制
    };
  },
  methods: {
    search() {
      if (this.searchQuery.trim()) {
        if (this.selectedEngine === 'local') {
          this.$router.push({ 
            path: '/search',
            query: { q: this.searchQuery.trim() }
          });
        } else {
          const url = this.engines[this.selectedEngine].url + encodeURIComponent(this.searchQuery);
          window.open(url, '_blank');
        }
      }
    },
    
    async handleSubmitWebsite(websiteData) {
      try {
        await this.$emit('submit-website', websiteData);
      } catch (error) {
        console.error('提交网站失败:', error);
      }
    },
    
    // ====================== 【新增】留言板方法 ======================
    openMessageBoard() { this.showMessageBoard = true; },
    closeMessageBoard() { this.showMessageBoard = false; }
  }
};
</script>