import * as cheerio from 'cheerio';

export const handler = async (event) => {
  // รับ URL
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  
  const { url } = body;
  if (!url) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No URL provided' }) };
  }

  try {
    // 🔥 เทคนิคการปลอมตัว: ใส่ Header ให้ครบชุดเหมือน Browser
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1'
      }
    });

    if (!response.ok) {
      // กรณีเว็บล็อก หรือ 404
      return { 
        statusCode: response.status, 
        body: JSON.stringify({ error: `Access failed: ${response.status} ${response.statusText}` }) 
      };
    }

    // ดึง HTML ออกมา
    const html = await response.text();
    
    // ใช้ Cheerio แกะ Title
    const $ = cheerio.load(html);
    let titleText = null;

    // 1. ลอง og:title
    const ogTag = $('meta[property="og:title"]').attr('content');
    if (ogTag && ogTag.trim()) titleText = ogTag.trim();

    // 2. ลอง <title>
    if (!titleText) {
      const pageTitle = $('title').text();
      if (pageTitle && pageTitle.trim()) titleText = pageTitle.trim();
    }

    // 3. Fallback
    if (!titleText) titleText = "ไม่พบหัวข้อข่าว";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleText }),
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};