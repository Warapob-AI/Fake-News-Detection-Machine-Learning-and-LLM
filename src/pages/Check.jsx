// 📁 src/pages/detectText.jsx (ที่แก้ไขแล้ว)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ 1. เพิ่ม Grid เข้าไปใน import
import { Box, Typography, TextField, Button, CircularProgress, Grid, Container, LinearProgress } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2'
// เพิ่ม State สำหรับสลับโหมด


// ตรวจสอบว่ามี import เหล่านี้แล้ว
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
// ✅ 2. ย้ายข้อมูลและ Component ออกมาไว้นอก DetectText
// สร้าง Array ของข้อมูลไว้นอก Component เพราะเป็นข้อมูลที่ไม่เปลี่ยนแปลง
const statsData = [
  {
    value: 'Google Search',
    label: 'เราใช้ Google Search ในการช่วยตัดสิน',
  },
  {
    value: 'AI : LLM',
    label: 'เราใช้ AI LLM ในการช่วยประมวลผล',
  },
  {
    value: 'Machine Learning',
    label: 'เราเทรนโมเดล จาก Dataset ศูนย์ต่อต้านข่าวปลอม',
  },
];

// สร้าง StatsSection Component แยกออกมาเป็นของตัวเอง
const StatsSection = () => {

  return (

    <Box
      sx={{
        width: '100%',
        backgroundColor: '#101125',
        color: 'white',
        py: { xs: 6, md: 8 },
        px: 2,
      }}
    >
      <Container maxWidth='lg' >
        <Grid container spacing={{ xs: 5, md: 3 }} justifyContent="center" data-aos="fade-up" data-aos-delay="200">
          {statsData.map((stat, index) => (
            <Grid size={{ xs: 12, lg: 4 }} key={index} sx={{ textAlign: 'center' }}>
              <Typography
                component="p"
                variant="h6"
                fontWeight={700}
                sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem', lg: '1.6rem' } }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#42bdffff', fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1.3rem' } }}
              >
                {stat.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Component หลักของคุณ
const DetectText = React.forwardRef((props, ref) => {
  const [newsText, setNewsText] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0); // ✅ 2. เพิ่ม State สำหรับเก็บ %
  const navigate = useNavigate();
  const [inputType, setInputType] = useState('text');

  const handleAnalyzeClick = async () => {
    // --- 1. ตรวจสอบความถูกต้องของข้อมูล (Validation) ---
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
      'i'
    );

    if (inputType === 'text') {
      if (!newsText.trim()) {
        return Swal.fire({
          icon: 'error',
          title: 'ข้อมูลผิดรูปแบบ!',
          text: 'กรุณาป้อนข้อความข่าวเพื่อใช้ในการตรวจสอบข่าว!',
          confirmButtonText: 'ลองอีกครั้ง',
          confirmButtonColor: '#d33',
        });
      } else if (urlPattern.test(newsText)) {
        return Swal.fire({
          icon: 'error',
          title: 'ข้อมูลผิดรูปแบบ!',
          text: 'กรุณาอย่าป้อนข้อความเป็นลิงก์!',
          confirmButtonText: 'ลองอีกครั้ง',
          confirmButtonColor: '#d33',
        });
      }

      // ✅ เพิ่ม Logic ตรวจสอบจำนวนคำ (ภาษาไทย)
      try {
        // ใช้ Intl.Segmenter ตัดคำภาษาไทย (แม่นยำกว่า split ทั่วไป)
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
        const segments = segmenter.segment(newsText);
        // นับเฉพาะที่เป็นคำจริง ๆ (isWordLike = true) เพื่อไม่นับช่องว่างหรือเครื่องหมาย
        const wordCount = [...segments].filter(s => s.isWordLike).length;

        if (wordCount < 5) {
          return Swal.fire({
            icon: 'warning', // ใช้ icon warning เพื่อเตือน
            title: 'ข้อความสั้นเกินไป!',
            text: 'ข้อความของคุณน้อยเกินไป (น้อยกว่า 5 คำ) กรุณาพิมพ์เพิ่มเพื่อให้ AI วิเคราะห์ได้แม่นยำขึ้น',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#f39c12', // สีส้ม
          });
        }
      } catch (error) {
        // Fallback: กรณี Browser เก่ามากที่ไม่รองรับ Intl.Segmenter ให้ใช้วิธีนับความยาวตัวอักษรแทน (เช่น < 20 ตัว)
        if (newsText.trim().length < 20) {
           return Swal.fire({
            icon: 'warning',
            title: 'ข้อความสั้นเกินไป!',
            text: 'กรุณาพิมพ์ข้อความให้ยาวกว่านี้ เพื่อความแม่นยำในการวิเคราะห์',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#f39c12',
          });
        }
      }

    } else {
      // กรณี inputType === 'link' (เหมือนเดิม)
      if (!newsText.trim()) {
        return Swal.fire({
          icon: 'error',
          title: 'ข้อมูลผิดรูปแบบ!',
          text: 'กรุณาวางลิงก์ข่าวเพื่อใช้ในการตรวจสอบข่าว',
          confirmButtonText: 'ลองอีกครั้ง',
          confirmButtonColor: '#d33',
        });
      } else if (!urlPattern.test(newsText)) {
        return Swal.fire({
          icon: 'error',
          title: 'ข้อมูลผิดรูปแบบ!',
          text: 'กรุณาป้อนลิงก์ อย่าป้อนข้อความใส่เข้ามา',
          confirmButtonText: 'ลองอีกครั้ง',
          confirmButtonColor: '#d33',
        });
      }
    }

    // --- 2. เริ่มต้นกระบวนการทำงาน (เหมือนเดิม) ---
    setIsLoading(true);

    try {
      // กำหนด Webhook URL
      let webhookUrl = '';
      if (inputType === 'link') {
        webhookUrl = "https://paintaisystemn8n.ggff.net/webhook/ai-check-linknews-thai";
      } else {
        webhookUrl = "https://paintaisystemn8n.ggff.net/webhook/ai-check-textnews-thai";
      }

      const payload = { taskUser: newsText };

      const controller = new AbortController();
      const signal = controller.signal;
      let timerIds = []; 

      const clearAllTimers = () => {
        timerIds.forEach((id) => clearTimeout(id));
        timerIds = [];
      };

      const apiRequestPromise = fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: signal,
      });

      Swal.fire({
        title: 'กำลังวิเคราะห์ข่าว...',
        html: 'กำลังนำ Keyword มา Search หาข้อมูล..',
        allowOutsideClick: false,
        showCancelButton: true,
        cancelButtonText: 'ยกเลิก',
        cancelButtonColor: '#d33',
        didOpen: () => {
          Swal.showLoading();
          const b = Swal.getCancelButton();
          if (b) {
            b.onclick = () => {
              controller.abort(); 
              clearAllTimers(); 
              Swal.close(); 
            };
          }
        },
      });

      const updateSwalText = (text) => {
        if (Swal.getHtmlContainer() && Swal.isVisible()) {
          Swal.getHtmlContainer().innerText = text;
        }
      };

      timerIds.push(setTimeout(() => { updateSwalText('กำลังวิเคราะห์ผลการทำนาย..อย่างละเอียด!'); }, 10000));
      timerIds.push(setTimeout(() => { updateSwalText('รอซักครู่น้า..กำลังประมวลผลอยู่'); }, 25000));
      timerIds.push(setTimeout(() => { updateSwalText('ระบบกำลังตรวจสอบให้อยู่ อย่าพึ่งปิดหน้านี้'); }, 40000));

      const response = await apiRequestPromise;
      clearAllTimers(); 

      if (!response.ok) {
        throw new Error(`Server Error: ${response.statusText}`);
      }

      const responseText = await response.json();
      console.log('✅ รับข้อมูลสำเร็จ:', responseText);

      if (responseText.output === 'ไม่สามารถตรวจสอบลิงก์นี้ได้ กรุณาลองใหม่..') {
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถตรวจสอบลิงก์นี้ได้ กรุณาลองใหม่..',
          confirmButtonText: 'ตกลง',
        });
        return;
      }

      await Swal.fire({
        icon: 'success',
        title: 'วิเคราะห์สำเร็จ!',
        confirmButtonText: 'ดูผลลัพธ์',
      });

      navigate('/validation', {
        state: {
          prediction: responseText.output.confidence,
          result: responseText.output,
          textUser: newsText,
          searchResult: responseText.searchResponse,
        },
      });

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('User cancelled the operation');
        Swal.close(); 
      } else {
        console.error('Process Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ หรือเกิดข้อผิดพลาดภายใน',
          confirmButtonText: 'ตกลง',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <> {/* ✅ ใช้ Fragment ครอบเพื่อ return สองอย่างพร้อมกัน */}

      <StatsSection />


      <Box
        ref={ref}
        id="/#detectText"
        sx={{
          minHeight: '680px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          scrollSnapAlign: 'start',
          backgroundColor: '#101125',
          p: 4,
          gap: 2,
          pb: 5
        }}
      >
        <Typography variant="h3" color="white" fontWeight={600} gutterBottom data-aos="fade-up" sx={{ fontSize: { xs: '1.2rem', sm: '2rem', md: '2.5rem' } }}>
          ตรวจจับข้อความข่าวและลิงก์ข่าว
        </Typography>
        <Typography color="white" data-aos="fade-up" data-aos-delay="100" sx={{ fontSize: { xs: '0.7rem', sm: '1rem', md: '1.5rem' }, mb: 1 }}>
          วางข้อความหรือลิงก์ข่าวที่ต้องการวิเคราะห์ลงในช่องด้านล่าง
        </Typography>

        <ToggleButtonGroup
          value={inputType}
          exclusive
          onChange={(event, newType) => {
            if (newType !== null) {
              setInputType(newType);
            }
          }}
          aria-label="Input type"
          size="small"
          sx={{
            mb: 1.5,
            width: '100%',
            maxWidth: '300px',

            // สไตล์เริ่มต้นสำหรับปุ่มทุกอัน
            '& .MuiToggleButton-root': {
              backgroundColor: '#283481', // สีพื้นหลังเริ่มต้น
              color: '#FFFFFF',
              flex: 1,
              transition: 'background 0.4s ease-in-out, color 0.4s ease-in-out',
            },

            // ✅ 1. กำหนด hover effect ให้ทำงาน "เฉพาะปุ่มที่ยังไม่ถูกเลือก"
            '& .MuiToggleButton-root:not(.Mui-selected):hover': {
              background: 'linear-gradient(90deg,rgba(166, 227, 255, 1) 0%, rgba(106, 170, 251, 1) 100%)',
              color: '#FFFFFF'
            },

            // ✅ 2. กำหนดให้ปุ่มที่ "ถูกเลือก" มีสไตล์ gradient ค้างไว้เลย
            '& .Mui-selected': {
              background: 'linear-gradient(90deg,rgba(166, 227, 255, 1) 0%, rgba(106, 170, 251, 1) 100%)',
              color: '#FFFFFF'
            },

            // สไตล์ borderRadius ยังคงเหมือนเดิม
            '& .MuiToggleButton-root:first-of-type': {
              borderRadius: '20px 0 0 0',
            },
            '& .MuiToggleButton-root:last-of-type': {
              borderRadius: '0 20px 0 0',
            },
          }}
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <ToggleButton value="text">ข้อความ</ToggleButton>
          <ToggleButton value="link">ลิงก์</ToggleButton>
        </ToggleButtonGroup>

        {/* ✅ TextField เหมือนเดิมทุกอย่าง แค่เปลี่ยน placeholder */}
        <TextField
          value={newsText}
          onChange={(e) => setNewsText(e.target.value)}
          multiline
          rows={8}
          placeholder={
            inputType === 'text'
              ? "วางเนื้อหาข่าวของคุณที่นี่..."
              : "วางลิงก์ (URL) ของคุณที่นี่..."
          }
          variant="filled"
          fullWidth
          sx={{
            maxWidth: '980px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            textarea: { color: 'white' }
          }}
          data-aos="fade-up"
          data-aos-delay="200"
        />

        <Button
          onClick={handleAnalyzeClick}
          disabled={isLoading}
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
          {isLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ข่าว'}
        </Button>
      </Box>

    </>
  );
});

export default DetectText;