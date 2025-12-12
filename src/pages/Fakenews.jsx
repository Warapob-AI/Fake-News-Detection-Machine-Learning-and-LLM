import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

function Fakenews() {
  const navigate = useNavigate();

  const [relatedWebsites, setRelatedWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        setLoading(true);

        // --- Step 1: ยิงไปหา N8N ---
        // (ใช้ URL ตามที่คุณตั้งค่า Active ไว้)
        const webhookUrl = 'https://paintaisystemn8n.ggff.net/webhook/call-news';
        const payload = { category: 'ข่าวปลอม', index: 3 };

        console.log("🚀 Calling N8N...");
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: signal,
        });

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text();
          throw new Error(`N8N Error (${webhookResponse.status}): ${errorText}`);
        }

        const responseData = await webhookResponse.json();
        console.log("✅ Data from N8N:", responseData);

        // --- Step 2: ดึงข้อมูลออกมา (ปรับ Logic ตรงนี้) ---
        let dataToDisplay = [];

        // แบบใหม่: ถ้าแก้ n8n แล้ว ข้อมูลจะอยู่ใน key ชื่อ 'news_list'
        if (responseData.news_list && Array.isArray(responseData.news_list)) {
          dataToDisplay = responseData.news_list;
        }
        // แบบสำรอง: ถ้า n8n ส่งมาเป็น Array ตรงๆ (Root Array)
        else if (Array.isArray(responseData)) {
          dataToDisplay = responseData;
        }
        // แบบสำรอง 2: ถ้าส่งมาเป็น Object แล้วมี key 'array' (จากโค้ดเก่าๆ)
        else if (responseData.array && Array.isArray(responseData.array)) {
          dataToDisplay = responseData.array;
        }
        // แบบสุดท้าย: ถ้าส่งมาแค่อันเดียวจริงๆ ให้จับใส่ Array
        else if (responseData && typeof responseData === 'object') {
          // เช็คว่าไม่ใช่ object ว่างๆ
          if (Object.keys(responseData).length > 0) {
            dataToDisplay = [responseData];
          }
        }

        console.log("Final List to Render:", dataToDisplay);
        setRelatedWebsites(dataToDisplay);

      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error("❌ Error:", err);
          let msg = err.message;
          if (msg === 'Failed to fetch') msg = 'เชื่อมต่อ Server ไม่ได้';
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  // --- Render (ส่วนแสดงผล) ---

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#101225', flexDirection: 'column' }}>
        <CircularProgress sx={{ color: '#e94560', mb: 2 }} />
        <Typography sx={{ color: 'white' }}>กำลังโหลดข้อมูล...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#101225', color: 'white' }}>
        <Typography variant="h6" color="error">เกิดข้อผิดพลาด: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', backgroundColor: '#101225', color: 'white', py: 8, px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 'lg', mx: 'auto' }}>
        <Typography sx={{ color: '#e94560', fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', mb: 4 }} data-aos="fade-up" data-aos-delay="200">
          ข่าวปลอม
        </Typography>

        <Grid container spacing={{ xs: 12, sm: 3, md: 3, lg: 10}} data-aos="fade-up" data-aos-delay="200">
          {relatedWebsites.length > 0 ? (
            relatedWebsites.map((site, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4}} key={index}>
                <Card sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#fff',
                  color: '#000',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="160"
                    // รองรับทั้ง image_url (จาก MongoDB/Python) และ imageUrl (จาก n8n บางโหนด)
                    image={site.image_url || site.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={site.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {site.title || "ไม่มีหัวข้อ"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {site.description ? (site.description.length > 100 ? site.description.substring(0, 100) + "..." : site.description) : "ไม่มีรายละเอียด"}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      href={site.link}
                      target="_blank"
                      sx={{ bgcolor: '#2761ae' }}
                    >
                      อ่านข่าวเต็ม
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
              <Typography color="gray">ไม่พบข้อมูลข่าว</Typography>
            </Box>
          )}
        </Grid>
        <Grid container justifyContent="center">
          <Button
            variant="contained"
            sx={{
              width: 'auto',
              height: '2.8rem',
              mt: 2,
              backgroundImage: 'linear-gradient(to right, #872B2B, #872B2B)',
              color: 'white',
              boxShadow: 'none'
            }}
            data-aos="fade-up"
            data-aos-delay="500"
            onClick={() => navigate('/fake-news-all')}
          >
            ดูข่าวปลอมเพิ่มเติม
          </Button>
        </Grid>
      </Box>
    </Box>
  );
}

export default Fakenews;