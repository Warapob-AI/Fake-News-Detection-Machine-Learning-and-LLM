import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';

// หากยังไม่ได้ติดตั้ง MUI Icons ให้ติดตั้งก่อนด้วยคำสั่ง:
// npm install @mui/icons-material
// หรือ
// yarn add @mui/icons-material
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1A1A1A', // สีเทาเข้มเกือบดำ
        color: '#FFFFFF',
        py: 6, // Padding ด้านบนและล่าง
        borderTop: '1px solid #333',
        height: '100%'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5} justifyContent="space-between">

          {/* ส่วนที่ 1: เกี่ยวกับแบรนด์ */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" gutterBottom fontWeight="700">
              UDetectionNews
            </Typography>
            <Typography variant="body2" sx={{ color: '#BDBDBD' }}>
              บริการวิเคราะห์และตรวจจับข่าวเท็จด้วยเทคโนโลยีปัญญาประดิษฐ์ (AI) เพื่อสร้างสังคมข้อมูลข่าวสารที่น่าเชื่อถือ
            </Typography>
          </Grid>


        </Grid>
        
        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#BDBDBD' }}>
            © {new Date().getFullYear()} UDetectionNews. All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;