const baseUrl = 'https://api.vika.cn/fusion/v1/datasheets';
const fieldKey = 'name';
const DEFAULT_ICON_URL = '/default.ico';

// ======================
// 安全公开配置（无 API KEY）
// ======================
const PUBLIC_SHARE_TOKEN = "shrKNHgTpgyKEqiRt41SH"; // 从分享链接里拿
const PUBLIC_DATASHEET_ID = "dstbDyo356Lw3WUoWF";       // 原来的表格ID
const PUBLIC_VIEW_ID = "viwt0unKYhFBz";             // 原来的视图ID

// 全局数据结构
export const websiteData = {
  originalList: [],
  parentCategories: [],
  parentToCategories: {},
  categoryToSites: {},
  categoryIconMap: {},
};

// ======================
// 公开只读获取数据（无 API KEY，绝对安全）
// ======================
export async function fetchData() {
  try {
    const apiUrl = `https://api.vika.cn/public/v1/share/${PUBLIC_SHARE_TOKEN}/datasheets/${PUBLIC_DATASHEET_ID}/records?viewId=${PUBLIC_VIEW_ID}&fieldKey=${fieldKey}&pageSize=1000`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('数据加载失败');

    const responseData = await response.json();
    if (!responseData?.data?.records) throw new Error('数据格式错误');

    // 处理数据
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
// 关闭用户添加/修改功能（保护你的表格）
// ======================
export async function addWebsite() {
  throw new Error('游客无法添加网站，请联系管理员');
}

// ======================
// 以下逻辑完全不变
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