import React, { useEffect } from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/app_navigation-menu.jsx';
import LoopingVideoBackground from '../components/home_video';
import { Box, Typography, Button } from '@mui/material';


const Home = React.forwardRef((props, ref) => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  <LoopingVideoBackground />

  return (
    
    <Box>
      <Navbar />
      {/* 1. เรียกใช้ Component พื้นหลังวิดีโอ */}
      <LoopingVideoBackground />

      {/* 2. เนื้อหาหลักของคุณจะอยู่ตรงนี้ */}


      <Box
        sx={{
          height: '680px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
        }}

      >
        <Typography variant="h3" fontWeight={700} color='#FFF' opacity={1} data-aos="fade-up" data-aos-delay="200" gutterBottom sx = {{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }}}>
          UDetectionNews
        </Typography>
        <Typography variant="h6" fontWeight={400} color='#FFF' opacity={1} data-aos="fade-up" data-aos-delay="300" gutterBottom sx = {{ fontSize: { xs: '1rem', sm: '1rem', md: '1.5rem' }}}>
          เว็บไซต์การให้บริการวิเคราะห์และตรวจจับข่าวเท็จ
        </Typography>
        <Typography variant="h6" fontWeight={300} color='#FFF' opacity={1} data-aos="fade-up" data-aos-delay="400" sx={{ pt: 1, lineHeight: '1.8rem' }} fontSize="14px">
          เว็บไซต์ของเราให้บริการ วิเคราะห์และตรวจจับข่าวเท็จ เพื่อช่วยให้ผู้ใช้งาน สามารถแยกแยะระหว่างข่าวจริงและข่าวปลอมได้อย่างแม่นยำ โดยใช้เทคโนโลยี <br />
          ปัญญาประดิษฐ์ (AI) และการใช้ LLM เข้ามาช่วยประเมินเนื้อหาข่าวและแหล่งที่มาของข้อมูล
        </Typography>
        <Button
          component={Link}
          // ✅ 2. เปลี่ยน 'to' จาก "/detectText" เป็น "/#check"
          //    เพื่อชี้ไปที่ <section id="check">
          to="/#check"
          // ✅ 3. (แนะนำ) เพิ่ม prop 'smooth' เพื่อให้การเลื่อนนุ่มนวล
          smooth
          variant="contained"
          size="large"
          sx={{
            width: '10rem',
            height: '2.8rem',
            mt: 2,
            backgroundImage: 'linear-gradient(to right, #1A9AD5, #69A9FB)',
            color: 'white',
            boxShadow: 'none',
            '&:hover': {
              backgroundImage: 'linear-gradient(to right, #178ec6, #5898ea)',
              boxShadow: 'none',
            },
          }}
          data-aos="fade-up"
          data-aos-delay="500"
        >
          เริ่มเลย!
        </Button>
      </Box>
    </Box>

  );
});

export default Home