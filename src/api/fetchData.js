const baseUrl = 'https://api.vika.cn/fusion/v1/datasheets';
const fieldKey = 'name';
const DEFAULT_ICON_URL = '/default.ico';

// ======================
// 在这里填写你的 3 个公开信息（无API KEY）
// ======================
const PUBLIC_SHARE_TOKEN = "uskKXXQPNBx078SB7OsZOF0";
const PUBLIC_DATASHEET_ID = "dstbDyo356Lw3WUoWF";
const PUBLIC_VIEW_ID = "viwt0unKYhFBz";

// 全局数据结构
export const websiteData = {
  originalList: [],
  parentCategories: [],
  parentToCategories: {},
  categoryToSites: {},
  categoryIconMap: {},
};

// ======================
// 自动加载数据，永远不需要配置
// ======================
export async function fetchData() {
  try {
    // 直接用公开接口，无密钥、无校验、不读本地存储
    const apiUrl = `https://api.vika.cn/public/v1/share/${PUBLIC_SHARE_TOKEN}/datasheets/${PUBLIC_DATASHEET_ID}/records?viewId=${PUBLIC_VIEW_ID}&fieldKey=${fieldKey}&pageSize=1000`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('数据加载失败');

    const responseData = await response.json();
    if (!responseData?.data?.records) throw new Error('数据格式错误');

    const rawSites = responseData.data.records.map(record => {
      if (!record.fields?.category || !record.fields?.name) return null;
      return {
        id: record.recordId,
        parentCategory: record.fields.parentCategory || '未分类',
        category: record.fields.category,
        name: record.fields.name,
        url: record.fields.url,
        description: record.fields.description || '',
        icon: record.fields.icon || DEFAULT_ICON_URL,
        parentIcon: record.fields.parentIcon || '',
        sortOrder: record.fields.order ? parseInt(record.fields.order) : 0,
        updatedAt: record.updatedAt || null,
        sort: record.sort || 0,
      };
    }).filter(Boolean).sort((a, b) => a.sort - b.sort);

    websiteData.originalList = rawSites;
    groupDataByParentCategory(rawSites);
    buildCategoryIconMap(rawSites);
    return rawSites;
  } catch (error) {
    console.error('数据加载失败', error);
    throw error;
  }
}

// ======================
// 禁用添加功能（游客不可编辑，保护数据）
// ======================
export async function addWebsite() {
  throw new Error('游客模式不可添加');
}

// ======================
// 内部工具函数（不动）
// ======================
function groupDataByParentCategory(sites) {
  const parentSet = new Set();
  const parentMap = {};
  const siteMap = {};

  sites.forEach(item => {
    const parentCategory = item.parentCategory;
    const category = item.category;
    parentSet.add(parentCategory);
    if (!parentMap[parentCategory]) parentMap[parentCategory] = new Set();
    parentMap[parentCategory].add(category);
    if (!siteMap[category]) siteMap[category] = [];
    siteMap[category].push(item);
  });

  websiteData.parentCategories = Array.from(parentSet);
  websiteData.parentToCategories = Object.fromEntries(
    Object.entries(parentMap).map(([k, v]) => [k, Array.from(v)])
  );
  websiteData.categoryToSites = siteMap;
}

function buildCategoryIconMap(sites) {
  const iconMap = {};
  sites.forEach(item => {
    const parent = item.parentCategory;
    const icon = item.parentIcon;
    if (parent && icon && !iconMap[parent]) iconMap[parent] = icon;
  });
  iconMap['我的收藏'] ||= 'fa-star';
  iconMap['关于本站'] ||= 'fa-info-circle';
  websiteData.categoryIconMap = iconMap;
}