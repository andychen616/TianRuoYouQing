const baseUrl = 'https://api.vika.cn/fusion/v1/datasheets';
const fieldKey = 'name';
const DEFAULT_ICON_URL = '/default.ico';

// ======================
// 你的默认配置（打开直接用）
// ======================
const DEFAULT_API_KEY = "uskKXXQPNBx078SB7OsZOF0";
const DEFAULT_DATASHEET_ID = "dstbDyo356Lw3WUoWF";
const DEFAULT_VIEW_ID = "viwt0unKYhFBz";

// 全局数据结构（必须保留！否则报错）
export const websiteData = {
  originalList: [],
  parentCategories: [],
  parentToCategories: {},
  categoryToSites: {},
  categoryIconMap: {},
};

// ======================
// 核心：自动使用默认配置，不弹框
// ======================
export async function fetchData() {
  try {
    // 优先用户配置 → 没有就用你的默认配置
    const apiKey = localStorage.getItem('apiKey') || DEFAULT_API_KEY;
    const datasheetId = localStorage.getItem('datasheetId') || DEFAULT_DATASHEET_ID;
    const viewId = localStorage.getItem('viewId') || DEFAULT_VIEW_ID;

    const apiUrl = `${baseUrl}/${datasheetId}/records?viewId=${viewId}&fieldKey=${fieldKey}&pageSize=1000`;

    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    const responseData = await response.json();

    const rawSites = responseData.data.records.map(record => {
      if (!record.fields || !record.fields.category || !record.fields.name) {
        console.warn('缺少必填字段的记录:', record);
        return null;
      }
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
        updatedAt: record.updatedAt || record.fields.updatedAt || null,
        sort: record.sort || 0,
      };
    }).filter(Boolean).sort((a, b) => b.sortOrder - a.sortOrder);

    // 给全局数据赋值（必须保留）
    websiteData.originalList = rawSites;
    groupDataByParentCategory(rawSites);
    buildCategoryIconMap(rawSites);

    return rawSites;
  } catch (error) {
    console.error('数据获取失败:', error);
    throw error;
  }
}

// ======================
// 添加网站（保留功能）
// ======================
export async function addWebsite(websiteData) {
  try {
    const apiKey = localStorage.getItem('apiKey') || DEFAULT_API_KEY;
    const datasheetId = localStorage.getItem('datasheetId') || DEFAULT_DATASHEET_ID;

    if (!apiKey || !datasheetId) {
      throw new Error('API配置不完整，请前往设置页面配置');
    }

    const apiUrl = `${baseUrl}/${datasheetId}/records?fieldKey=name`;

    const requestBody = {
      records: [
        {
          fields: {
            category: websiteData.category,
            name: websiteData.name,
            url: websiteData.url,
            icon: websiteData.icon,
            description: websiteData.description,
            order: websiteData.order.toString()
          }
        }
      ],
      fieldKey: "name"
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    const responseData = await response.json();
    return responseData.data.records[0];
  } catch (error) {
    console.error('数据提交失败:', error);
    throw error;
  }
}

// ======================
// 工具函数（全部保留）
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
  iconMap['我的收藏'] = iconMap['我的收藏'] || 'fa-star';
  iconMap['关于本站'] = iconMap['关于本站'] || 'fa-info-circle';
  websiteData.categoryIconMap = iconMap;
}