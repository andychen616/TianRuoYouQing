const baseUrl = 'https://api.vika.cn/fusion/v1/datasheets';
const fieldKey = 'name';
const DEFAULT_ICON_URL = '/default.ico';

// ======================
// 【默认配置】打开直接用，用户不需要填
// ======================
const DEFAULT_API_KEY = "uskKXXQPNBx078SB7OsZOF0";
const DEFAULT_DATASHEET_ID = "dstbDyo356Lw3WUoWF";
const DEFAULT_VIEW_ID = "viwt0unKYhFBz";

export async function fetchData() {
  try {
    // ==============================================
    // 核心逻辑：用户没配置 → 自动用我的；用户配置了 → 用用户的
    // ==============================================
    const apiKey = localStorage.getItem('apiKey') || DEFAULT_API_KEY;
    const datasheetId = localStorage.getItem('datasheetId') || DEFAULT_DATASHEET_ID;
    const viewId = localStorage.getItem('viewId') || DEFAULT_VIEW_ID;

    // 永远不会报错，永远不会弹配置
    const apiUrl = `${baseUrl}/${datasheetId}/records?viewId=${viewId}&fieldKey=${fieldKey}&pageSize=1000`;

    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    const responseData = await response.json();

    return responseData.data.records.map(record => {
      if (!record.fields || !record.fields.category || !record.fields.name) {
        console.warn('缺少必填字段的记录:', record);
        return null;
      }
      return {
        id: record.recordId,
        category: record.fields.category,
        name: record.fields.name,
        url: record.fields.url,
        description: record.fields.description || '',
        icon: record.fields.icon || DEFAULT_ICON_URL,
        sortOrder: record.fields.order ? parseInt(record.fields.order) : 0,
        updatedAt: record.updatedAt || record.fields.updatedAt || null
      };
    }).filter(Boolean).sort((a, b) => b.sortOrder - a.sortOrder);
  } catch (error) {
    console.error('数据获取失败:', error.message);
    throw error;
  }
}

// 添加网址（保留功能）
export async function addWebsite(websiteData) {
  try {
    const apiKey = localStorage.getItem('apiKey') || DEFAULT_API_KEY;
    const datasheetId = localStorage.getItem('datasheetId') || DEFAULT_DATASHEET_ID;

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