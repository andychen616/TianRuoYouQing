const baseUrl = 'https://api.vika.cn/fusion/v1';
const fieldKey = 'name';
const DEFAULT_ICON_URL = '/default.ico';

// 在这里填入你 维格云公开分享的 shareId
const PUBLIC_SHARE_ID = "shrKNHgTpgyKEqiRt41SH";

// 全局数据结构
export const websiteData = {
  originalList: [],
  parentCategories: [],
  parentToCategories: {},
  categoryToSites: {},
  categoryIconMap: {}, // 新增图标映射
};

export async function fetchData() {
  try {
    // ==============================================
    // 核心修改：使用公开分享接口，不需要 API Key
    // ==============================================
    const apiUrl = `${baseUrl}/shares/${PUBLIC_SHARE_ID}/records?fieldKey=${fieldKey}&pageSize=1000`;

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API请求失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error('API请求失败');
    }

    const responseData = await response.json();

    if (!responseData || !responseData.data || !Array.isArray(responseData.data.records)) {
      throw new Error(`返回数据格式不正确: ${JSON.stringify(responseData)}`);
    }

    // 处理原始数据
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
        sort: record.sort  // 添加维格表内置拖拽排序字段
      };
    }).filter(Boolean)
      .sort((a, b) => a.sort - b.sort); // 按表格拖拽顺序排序

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
    const parentCategory = item.parentCategory;
    const category = item.category;

    parentSet.add(parentCategory);

    if (!parentMap[parentCategory]) {
      parentMap[parentCategory] = new Set();
    }
    parentMap[parentCategory].add(category);

    if (!siteMap[category]) {
      siteMap[category] = [];
    }
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
    if (parent && icon && !iconMap[parent]) {
      iconMap[parent] = icon;
    }
  });

  iconMap['我的收藏'] = iconMap['我的收藏'] || 'fa-star';
  iconMap['关于本站'] = iconMap['关于本站'] || 'fa-info-circle';

  websiteData.categoryIconMap = iconMap;
}

// 原有 addWebsite 逻辑 100% 不变（仅修复一处错误）
export async function addWebsite(websiteData) {
  try {
    const apiKey = import.meta.env.VITE_VIKA_API_KEY || localStorage.getItem('apiKey');
    const datasheetId = import.meta.env.VITE_VIKA_DATASHEET_ID || localStorage.getItem('datasheetId');
    
    if (!apiKey || !datasheetId) {
      throw new Error('API配置不完整，请前往设置页面配置');
    }
    
    const apiUrl = `${baseUrl}/datasheets/${datasheetId}/records?fieldKey=name`;
    
    const requestBody = {
      records: [
        {
          fields: {
            parentCategory: websiteData.parentCategory || '未分类',
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
      const errorData = await response.json();
      console.error('API请求失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error('API请求失败');
    }
    
    const responseData = await response.json();
    return responseData.data.records[0];
  } catch (error) {
    console.error('数据提交失败:', error);
    throw error;
  }
}