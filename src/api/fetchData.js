const baseUrl = 'https://api.vika.cn/fusion/v1';
const fieldKey = 'name';
const DEFAULT_ICON_URL = '/default.ico';
const PUBLIC_SHARE_ID = "shrKNHgTpgyKEqiRt41SH";

// 静态兜底数据（从你维格表里提取的前10条数据，接口失败时自动使用）
const STATIC_FALLBACK_DATA = [
  {
    id: "static-1",
    parentCategory: "影视",
    category: "在线影站",
    name: "FREEOK",
    url: "https://www.freeok.vip",
    description: "",
    icon: "https://www.freeok.shop/favicon.ico",
    parentIcon: "fa-film",
    sortOrder: 0,
    updatedAt: null,
    sort: 1
  },
  {
    id: "static-2",
    parentCategory: "影视",
    category: "在线影站",
    name: "两个BT",
    url: "https://www.2btv.net",
    description: "电影网站",
    icon: "https://bttwo.staticimgjs.org/uploads/2026/04/logo.png",
    parentIcon: "",
    sortOrder: 0,
    updatedAt: null,
    sort: 2
  },
  {
    id: "static-3",
    parentCategory: "影视",
    category: "在线影站",
    name: "555电影",
    url: "https://www.555dy.net",
    description: "",
    icon: "https://vpic.cms.qq.com/nj_vpic/3272248629/17385.png",
    parentIcon: "",
    sortOrder: 0,
    updatedAt: null,
    sort: 3
  },
  {
    id: "static-4",
    parentCategory: "影视",
    category: "在线影站",
    name: "HDmoli",
    url: "https://www.hdmoli.com",
    description: "",
    icon: "https://www.hdmoli.com/static/img/logo.png",
    parentIcon: "",
    sortOrder: 0,
    updatedAt: null,
    sort: 4
  },
  {
    id: "static-5",
    parentCategory: "影视",
    category: "在线影站",
    name: "电影天堂蓝光站",
    url: "https://www.dyttlg1.com",
    description: "",
    icon: "https://www.dyttlg1.com/template/default/images/logo.png",
    parentIcon: "",
    sortOrder: 0,
    updatedAt: null,
    sort: 5
  }
];

// 全局数据结构
export const websiteData = {
  originalList: [],
  parentCategories: [],
  parentToCategories: {},
  categoryToSites: {},
  categoryIconMap: {},
};

export async function fetchData() {
  let rawSites = [];

  try {
    // 优先尝试公开分享接口
    const apiUrl = `${baseUrl}/shares/${PUBLIC_SHARE_ID}/records?fieldKey=${fieldKey}&pageSize=1000`;
    const response = await fetch(apiUrl);

    if (response.ok) {
      const responseData = await response.json();
      if (responseData?.data?.records) {
        rawSites = responseData.data.records.map(record => {
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
      }
    }
  } catch (error) {
    console.error('公开接口请求失败，使用静态兜底数据:', error);
  }

  // 如果接口失败或返回数据为空，使用静态兜底数据
  if (!rawSites || rawSites.length === 0) {
    rawSites = STATIC_FALLBACK_DATA;
  }

  websiteData.originalList = rawSites;
  groupDataByParentCategory(rawSites);
  buildCategoryIconMap(rawSites);
  return rawSites;
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