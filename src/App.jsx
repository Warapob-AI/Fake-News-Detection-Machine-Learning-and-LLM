// App.jsx
import React from 'react';
import './App.css'

import {
  AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemText,
  Box, Container, CssBaseline, useTheme, useMediaQuery, Grid,
} from '@mui/material';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Validation from './pages/Validation.jsx';
import Footer from './pages/Footer.jsx';
import Check from './pages/Check.jsx';
import Home from './pages/Home.jsx';
import Fakenews from './pages/Fakenews.jsx';
import Truenews from './pages/Truenews.jsx';
import AllFakeNews from './pages/AllFakeNews.jsx';
import AllTrueNews from './pages/AllTrueNews.jsx';

const theme = createTheme({
  typography: {
    fontFamily: '"Noto Sans Thai Looped", sans-serif;',
  },
});

function App() {
  return (
    <>
      {/* Navbar */}
      <ThemeProvider theme={theme}>
        {/* พื้นหลังฟองอากาศ */}

        <CssBaseline />

        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  {/* 1. สร้าง section พร้อมกับกำหนด ID ให้แต่ละส่วน */}
                  <section id="home">
                    <Home />
                  </section>
                  <section id="check"> {/* <-- ตั้ง ID ให้ตรงกับชื่อลิงก์ */}
                    <Check />
                  </section>
                  <section id="truenews">
                    <Truenews />
                  </section>
                  <section id="fakenews">
                    <Fakenews />
                  </section>
                  <section id="contact">
                    <Footer />
                  </section>
                </>
              }
            />

            {/* 2. ลบ Route ที่ถูกรวมไปแล้วออก */}
            {/* <Route path="/detectText" element={<Check />} /> -- เอาออก */}

            {/* Route อื่นๆ ที่เป็นหน้าแยกจริงๆ ยังคงไว้ */}
            <Route path="/validation" element={<Validation />} />
            <Route path="/fake-news-all" element={<AllFakeNews />} />
            <Route path="/true-news-all" element={<AllTrueNews />} />
            
          </Routes>
        </Router>


      </ThemeProvider>
    </>
  );
}

export default App;
