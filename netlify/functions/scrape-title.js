import * as cheerio from 'cheerio';

export const handler = async (event) => {
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
    // 🔥 เทคนิคใหม่: ปลอมตัวเป็น Google Bot
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // บอกว่าเป็น Google Bot (เว็บข่าวชอบสิ่งนี้ เพราะอยากติดหน้าแรก Google)
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        // บอกว่ากดมาจากหน้า Google
        'Referer': 'https://www.google.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!response.ok) {
      // ถ้ายังโดนบล็อกอยู่ ให้ส่ง error กลับไปบอก Frontend
      return { 
        statusCode: response.status, 
        body: JSON.stringify({ error: `โดนบล็อก (Status ${response.status}) - ลองใช้ Proxy API` }) 
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // --- (โค้ดแกะข้อมูลเหมือนเดิม) ---
    // Clean up ขยะ
    $('script, style, iframe, nav, footer, aside').remove();

    // 1. Title
    let titleText = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    
    // 2. Image
    let imageText = $('meta[property="og:image"]').attr('content') || '';

    // 3. Content (Logic ใหม่)
    let contentText = "";
    // พยายามหาเนื้อหาจาก Class ยอดฮิตของเว็บข่าวไทย
    const selectors = [
        "div.entry-content", "div.td-post-content", "div.news-content", 
        "div.detail-content", "article", "div#content-area"
    ];
    
    for (const sel of selectors) {
        const container = $(sel);
        if (container.length > 0) {
            // เอาเฉพาะ tag <p>
            const paragraphs = container.find('p').map((i, el) => $(el).text().trim()).get();
            // กรองเอาเฉพาะย่อหน้าที่มีเนื้อหา (ยาวกว่า 10 ตัวอักษร)
            contentText = paragraphs.filter(t => t.length > 10).join("\n\n");
            if (contentText) break;
        }
    }
    
    // Fallback ถ้าหาไม่เจอจริงๆ
    if (!contentText) {
        contentText = $('p').filter((i, el) => $(el).text().trim().length > 30).map((i, el) => $(el).text().trim()).get().join("\n\n");
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
          title: titleText.trim(),
          image: imageText.trim(),
          content: contentText || "ไม่พบเนื้อหาข่าว"
      }),
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};