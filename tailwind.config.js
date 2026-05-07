module.exports = {
  darkMode: 'class', // 使用class策略的黑暗模式
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  safelist: [
    { pattern: /grid-cols-[3-8]/ },
    // 添加黑暗模式相关的安全列表
    'dark',
    'dark:bg-gray-700',
    'dark:bg-gray-800',
    'dark:bg-gray-900',
    'dark:text-gray-100',
    'dark:text-gray-200',
    'dark:text-gray-300',
    'dark:text-gray-400',
    'dark:hover:bg-gray-600',
    'dark:hover:bg-gray-700',
    'dark:border-gray-600',
    'dark:border-gray-700',
    'dark:shadow-lg',
    'dark:bg-blue-900',
    'dark:text-purple-400',
    'dark:text-blue-400'
  ],
  theme: {
    extend: {
      // 可以在这里扩展黑暗模式的颜色配置
    }
  }
}