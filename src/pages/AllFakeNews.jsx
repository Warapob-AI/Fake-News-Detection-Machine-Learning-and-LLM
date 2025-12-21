import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import notfound from '../assets/404_notfound.jpg';
import Navbar from '../components/app_navigation-menu.jsx';

function AllTrueNews() {
  const navigate = useNavigate();

  // 1. State สำหรับจัดการข้อมูล
  const [relatedWebsites, setRelatedWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        setLoading(true);

        const endpointPath = "webhook/call-news";
        const mainUrl = `https://paintaisystemn8n.ggff.net/${endpointPath}`;
        const backupUrl = `https://udetectionnewsn8n.ggff.net/${endpointPath}`;

        // Payload ตามที่คุณต้องการ
        const payload = { category: 'ข่าวปลอม', index: 100 };

        let response;
        const fetchOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        };

        try {
          // 1. ลองยิงไปที่ Domain หลักก่อน
          response = await fetch(mainUrl, fetchOptions);
        } catch (err) {
          // 2. ถ้า Main พัง ให้ลองยิงไปที่ IP สำรอง
          console.warn(`Main URL failed, switching to Backup URL: ${backupUrl}`);
          response = await fetch(backupUrl, fetchOptions);
        }

        if (!response.ok) {
          throw new Error(`Server Error: ${response.statusText}`);
        }

        const responseData = await response.json();

        console.log("✅ Data from N8N:", responseData);

        // --- Step 2: จัดการข้อมูล (ไม่ต้องเรียก axios แล้ว) ---
        let dataToDisplay = [];

        // กรณี 1: N8N ส่งกลับมาเป็น Key ชื่อ 'news_list' (ถ้าแก้ใน n8n แล้ว)
        if (responseData.news_list && Array.isArray(responseData.news_list)) {
          dataToDisplay = responseData.news_list;
        }
        // กรณี 2: N8N ส่งกลับมาเป็น Array ตรงๆ
        else if (Array.isArray(responseData)) {
          dataToDisplay = responseData;
        }
        // กรณี 3: N8N ส่งกลับมาเป็น key ชื่อ 'array' (แบบเก่า)
        else if (responseData.array && Array.isArray(responseData.array)) {
          dataToDisplay = responseData.array;
        }
        // กรณี 4: ส่งมาแค่ Object เดียว ให้จับใส่ Array
        else if (responseData && typeof responseData === 'object' && Object.keys(responseData).length > 0) {
          dataToDisplay = [responseData];
        }

        console.log("Final List to Render:", dataToDisplay);
        setRelatedWebsites(dataToDisplay);

      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error("❌ Error fetching data:", err);
          let msg = err.message;
          if (msg === 'Failed to fetch') msg = 'ไม่สามารถเชื่อมต่อ Server N8N ได้';
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      console.log("Cleanup: Cancelling requests...");
      controller.abort();
    };
  }, []);

  // --- ส่วนแสดงผล (Render) ---

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#101225', flexDirection: 'column' }}>
        <CircularProgress sx={{ color: '#e94560', mb: 2 }} />
        <Typography sx={{ color: 'white' }}>กำลังโหลดข้อมูลข่าวปลอมทั้งหมด...</Typography>
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
    <Box sx={{ width: '100%', backgroundColor: '#101225', color: 'white', py: { xs: 6, md: 8 }, px: 2, }}>
      <Navbar />
      <Box sx={{ width: '100%', maxWidth: 'lg', mt: 5, mx: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          <Typography sx={{ color: '#e94560', fontSize: '2rem', fontWeight: 'bold' }}>
            ข่าวปลอม
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 12, sm: 3, md: 3, lg: 10 }}>
          {relatedWebsites.length > 0 ? (
            relatedWebsites.map((site, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
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
                    // รองรับทั้งชื่อตัวแปร image_url และ imageUrl
                    image={site.image_url || site.imageUrl || notfound}
                    alt={site.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', lineHeight: 1.3 }}>
                      {site.title || "ไม่มีหัวข้อข่าว"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {site.description ? `${site.description.substring(0, 100)}...` : 'ไม่มีรายละเอียด'}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 1 }}>
                    <Button
                      component="a"
                      href={site.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: '#2761aeff',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: '#1E4A8C'
                        }
                      }}
                    >
                      อ่านข่าวเต็ม
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center', mt: 5 }}>
              <Typography variant="h6" sx={{ color: 'gray' }}>
                กรุณารอซักครู่ ระบบกำลังแสดงผล..
              </Typography>
            </Box>
          )}
        </Grid>

      </Box>
    </Box>
  );
}

export default AllTrueNews;