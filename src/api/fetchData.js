const baseUrl = 'https://api.vika.cn/fusion/v1';
const fieldKey = 'name';
const DEFAULT_ICON_URL = '/default.ico';

// 公开分享ID（已填好）
const PUBLIC_SHARE_ID = "shrKNHgTpgyKEqiRt41SH";

// 全局数据结构
export const websiteData = {
  originalList: [],
  parentCategories: [],
  parentToCategories: {},
  categoryToSites: {},
  categoryIconMap: {},
};

// 彻底移除用户API配置检查，强制使用公开接口
export async function fetchData() {
  try {
    // 直接调用公开分享接口，不需要任何用户配置
    const apiUrl = `${baseUrl}/shares/${PUBLIC_SHARE_ID}/records?fieldKey=${fieldKey}&pageSize=1000`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    const responseData = await response.json();
    if (!responseData?.data?.records) {
      throw new Error('数据格式不正确');
    }

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
        sort: record.sort || 0
      };
    }).filter(Boolean).sort((a, b) => a.sort - b.sort);

    websiteData.originalList = rawSites;
    groupDataByParentCategory(rawSites);
    buildCategoryIconMap(rawSites);
    return rawSites;

  } catch (error) {
    console.error('数据获取失败:', error);
    throw error;
  }
}

function groupDataByParentCategory(sites) {
  const parentSet = new Set();
  const parentMap = {};
  const siteMap = {};

  sites.forEach(item => {
    const parent = item.parentCategory;
    const category = item.category;
    parentSet.add(parent);
    parentMap[parent] = parentMap[parent] || new Set();
    parentMap[parent].add(category);
    siteMap[category] = siteMap[category] || [];
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

// 添加网站功能（仅你自己用，保留API Key逻辑）
export async function addWebsite(websiteData) {
  try {
    const apiKey = import.meta.env.VITE_VIKA_API_KEY || localStorage.getItem('apiKey');
    const datasheetId = import.meta.env.VITE_VIKA_DATASHEET_ID || localStorage.getItem('datasheetId');
    
    if (!apiKey || !datasheetId) {
      throw new Error('API配置不完整，请前往设置页面配置');
    }
    
    const apiUrl = `${baseUrl}/datasheets/${datasheetId}/records?fieldKey=name`;
    
    const requestBody = {
      records: [{
        fields: {
          parentCategory: websiteData.parentCategory || '未分类',
          category: websiteData.category,
          name: websiteData.name,
          url: websiteData.url,
          icon: websiteData.icon,
          description: websiteData.description,
          order: (websiteData.order || 0).toString()
        }
      }],
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
    
    if (!response.ok) throw new Error('提交失败');
    const res = await response.json();
    return res.data.records[0];
  } catch (e) {
    console.error(e);
    throw e;
  }
}