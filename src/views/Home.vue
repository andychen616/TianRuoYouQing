<template>
  <!-- 你原来的全部页面主体（原封不动） -->
  <div class="flex flex-1 overflow-hidden relative">
    <Sidebar 
      :parent-categories="parentCategories"
      :parent-to-categories="parentToCategories"
      :category-icon-map="categoryIconMap"
      :isCollapsed="isSidebarCollapsed"
      @select-parent="handleSelectParent"
      @select-category="filterByCategory"
      @toggle-sidebar="toggleSidebar"
    />
    <main class="flex-1 flex flex-col p-4 overflow-y-auto">
      <Navbar 
        :darkMode="darkMode" 
        :categories="categories"
        @toggle-dark-mode="toggleDarkMode" 
        @submit-website="handleSubmitWebsite"
        class="mb-6"/>
      
      <div v-if="currentParentName" class="flex flex-wrap items-center gap-2 mb-6">
        <span class="text-lg font-bold text-red-60 dark:text-red-400 mr-2">
          {{ currentParentName }}丨
        </span>

        <button
          v-for="cat in currentChildCategories"
          :key="cat"
          @click="filterByCategory(cat)"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          :class="{
            'bg-red-100 dark:bg-red-900 text-red-60 dark:text-red-400': selectedCategory === cat
          }"
        >
          {{ cat }}
        </button>
      </div>

      <div class="flex-grow">
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="text-gray-50 dark:text-gray-400">
            <i class="fas fa-spinner fa-spin mr-2"></i>正在加载数据...
          </div>
        </div>
        
        <div v-else-if="error" class="bg-red-50 dark:bg-red-900/3 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center max-w-2xl mx-auto">
          <i class="fas fa-exclamation-circle text-red-50 text-4xl mb-4"></i>
          <h3 class="text-xl font-semibold text-red-70 dark:text-red-300 mb-2">{{ error }}</h3>
          <button 
            @click="$router.push('/settings')"
            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors mt-4"
          >
            <i class="fas fa-cog mr-2"></i>前往设置页面
          </button>
        </div>
        
        <div v-else>
          <div 
            class="grid gap-6 grid-auto-rows-fr" 
            :class="{
              'grid-cols-2 md:grid-cols-3': columns === 3,
              'grid-cols-2 md:grid-cols-4': columns === 4,
              'grid-cols-2 md:grid-cols-5': columns === 5,
              'grid-cols-2 md:grid-cols-6': columns === 6,
              'grid-cols-2 md:grid-cols-7': columns === 7,
              'grid-cols-2 md:grid-cols-8': columns === 8
            }"
          >
            <template v-for="(item, index) in filteredItems" :key="item.id">
              <Card :item="item" @favorite-changed="handleFavoriteChanged" />
            </template>
          </div>
        </div>
      </div>

      <Footer class="mt-8" />
    </main>
  </div>
</template>

<script>
import { fetchData, addWebsite, websiteData } from '../api/fetchData';
import Navbar from '../components/Navbar.vue';
import Sidebar from '../components/Sidebar.vue';
import Card from '../components/Card.vue';
import Footer from '../components/Footer.vue';

export default {
  components: { 
    Navbar, 
    Sidebar, 
    Card, 
    Footer,
  },
  data() {
    return {
      columns: parseInt(localStorage.getItem('columns')) || 5,
      items: [],
      categories: [],
      parentCategories: [],
      parentToCategories: {},
      categoryIconMap: {},
      currentChildCategories: [],
      currentParentName: '',
      selectedCategory: null,
      selectedParent: null,
      darkMode: localStorage.getItem('darkMode') === 'true',
      isSidebarCollapsed: window.innerWidth < 768,
      loading: false,
      error: null,
    };
  },
  computed: {
    filteredItems() {
      if (this.selectedCategory) {
        if (this.selectedCategory === '我的收藏') {
          const favoriteIds = JSON.parse(localStorage.getItem('favoriteItems')) || [];
          return this.items.filter(item => favoriteIds.includes(item.id));
        }
        return this.items.filter(item => item.category === this.selectedCategory);
      }
      if (this.selectedParent) {
        if (this.selectedParent === '我的收藏') {
          const favoriteIds = JSON.parse(localStorage.getItem('favoriteItems')) || [];
          return this.items.filter(item => favoriteIds.includes(item.id));
        }
        return this.items.filter(item => item.parentCategory === this.selectedParent);
      }
      return this.items;
    },
  },
  methods: {
    async loadData() {
      try {
        this.loading = true;
        this.error = null;
        const data = await fetchData();
        this.items = data;
        this.categories = ['我的收藏', ...new Set(data.map(item => item.category))];
        this.parentCategories = websiteData.parentCategories;
        this.categoryIconMap = websiteData.categoryIconMap;
        if (!this.parentCategories.includes('我的收藏')) {
          this.parentCategories.unshift('我的收藏');
        }
        this.parentToCategories = websiteData.parentToCategories;
        this.parentToCategories['我的收藏'] = [];
        localStorage.setItem('appCategories', JSON.stringify(this.categories));
      } catch (error) {
        console.error('数据加载失败:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    handleSelectParent(parent) {
      this.currentParentName = parent;
      this.selectedParent = parent;
      this.selectedCategory = null;
      if (parent === '我的收藏') {
        this.currentChildCategories = [];
        return;
      }
      this.currentChildCategories = this.parentToCategories[parent] || [];
    },
    filterByCategory(category) {
      this.selectedCategory = category;
      this.selectedParent = this.currentParentName;
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      this.darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', this.darkMode);
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    async handleSubmitWebsite(websiteData) {
      try {
        await addWebsite(websiteData);
        await this.loadData();
      } catch (error) {
        console.error('提交网站失败:', error);
        throw error;
      }
    },
    handleGlobalClick(){},
    handleResize() {
      this.isSidebarCollapsed = window.innerWidth < 768
    },
    handleFavoriteChanged() {
      this.$forceUpdate();
    },
  },
  created() {
    this.loadData();
  },
  mounted() {
    if (this.darkMode) document.documentElement.classList.add('dark');
    const savedColumns = localStorage.getItem('columns')
    if (savedColumns) this.columns = parseInt(savedColumns)
    const savedBg = localStorage.getItem('background')
    const savedImage = localStorage.getItem('backgroundImage')
    if (savedBg) {
      document.body.style.backgroundColor = savedBg
    } else if (savedImage) {
      document.body.style.backgroundImage = `url('${savedImage}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    }
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
};
</script>