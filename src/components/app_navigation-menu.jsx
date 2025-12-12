import React, { useState } from 'react';
// ✅ 1. Import HashLink และตั้งชื่อเล่นให้เป็น Link เพื่อง่ายต่อการใช้งาน
import { HashLink as Link } from 'react-router-hash-link';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
  CssBaseline, Container, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TypewriterTypography from './app_typewriter-typography';

// ✅ 2. สร้าง Object สำหรับจับคู่ชื่อเมนูกับ path และ id
const navLinks = {
  'หน้าแรก': '/#home',
  'ตรวจสอบ': '/#check',
  'ข่าวจริง': '/#truenews',
  'ข่าวปลอม': '/#fakenews',
  'เกี่ยวกับเรา': '/#contact', // หรือ /#about ตามที่คุณตั้ง id ไว้
};
const navItems = Object.keys(navLinks); // ['หน้าแรก', 'ตรวจสอบ', ...]

const navButtonStyle = {
  fontWeight: 600,
  mx: 1.5,
  fontSize: '0.85rem',
  transition: '0.3s',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: 'rgba(30, 41, 59)',
    color: '#FFFFFF',
  },
};

export default function Navbar() {
  const isMobile = useMediaQuery('(max-width:869px)');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      <CssBaseline />
      <AppBar sx={{ background: 'linear-gradient(to right, #101125, #101125)' }}>
        <Container maxWidth="xl">
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontFamily: '"IBM Plex Sans Thai", sans-serif', fontWeight: 600 }}
            >
              <TypewriterTypography variant="h6" fontWeight={600} text={'UDetectionNews'} speed={80} />
            </Typography>

            {isMobile ? (
              // --- ส่วนของ Mobile ---
              <>
                <IconButton color="inherit" onClick={handleMenuOpen}>
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {navItems.map((item) => (
                    // ✅ 4. ทำให้ MenuItem เป็น Link ที่สามารถเลื่อนได้
                    <MenuItem
                      key={item}
                      component={Link}
                      to={navLinks[item]} // ดึง path จาก object navLinks
                      smooth // ทำให้เลื่อนแบบนุ่มนวล
                      onClick={handleMenuClose}
                    >
                      {item}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              // --- ส่วนของ Desktop ---
              navItems.map((item) => (
                // ✅ 3. ทำให้ Button เป็น Link ที่สามารถเลื่อนได้
                <Button
                  key={item}
                  component={Link}
                  to={navLinks[item]} // ดึง path จาก object navLinks
                  smooth // ทำให้เลื่อนแบบนุ่มนวล
                  color="inherit"
                  sx={navButtonStyle}
                >
                  {item}
                </Button>
              ))
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
}