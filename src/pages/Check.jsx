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

// Compone// ✅ ฟังก์ชันช่วยนับคำภาษาไทย (แยกออกมาไว้นอก Component หรือไว้ข้างในก็ได้)
const countWords = (text) => {
  if (!text) return 0;
  try {
    const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
    const segments = segmenter.segment(text);
    return [...segments].filter(s => s.isWordLike).length;
  } catch (error) {
    return text.trim().split(/\s+/).length; // Fallback
  }
};

// Component หลักของคุณ
const DetectText = React.forwardRef((props, ref) => {
  const [newsText, setNewsText] = useState('');
  // const [status, setStatus] = useState(''); // (ไม่ได้ใช้ ลบออกได้)
  const [isLoading, setIsLoading] = useState(false);
  // const [progress, setProgress] = useState(0); // (ถ้าไม่ได้ใช้ ลบออกได้)
  const navigate = useNavigate();
  const [inputType, setInputType] = useState('text');
  const [isFocused, setIsFocused] = useState(false);

  // ✅ คำนวณจำนวนคำปัจจุบันแบบ Real-time
  const currentWordCount = inputType === 'text' ? countWords(newsText) : 0;
  const linkCount = (newsText.match(/https?:\/\//gi) || []).length;
  // ✅ ฟังก์ชันจัดการเมื่อข้อความเปลี่ยน (พร้อม Limit 100 คำ)
  const handleTextChange = (e) => {
    const newValue = e.target.value;

    if (inputType === 'text') {
      // ✅ เปลี่ยนเป็น: รับค่าทุกอย่างที่พิมพ์/วางเข้ามาก่อน (เพื่อให้ Paste ติด)
      setNewsText(newValue);
    } else {
      setNewsText(newValue);
    }

  };

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
      // 1.1 เช็คค่าว่าง
      if (!newsText.trim()) {
        return Swal.fire({
          icon: 'error',
          title: 'ข้อมูลผิดรูปแบบ!',
          text: 'กรุณาป้อนข้อความข่าวเพื่อใช้ในการตรวจสอบข่าว!',
          confirmButtonText: 'ลองอีกครั้ง',
          confirmButtonColor: '#d33',
        });
      } 
      // 1.2 เช็คว่าเป็นลิงก์หรือไม่ (ห้ามใส่ลิงก์ในช่องข้อความ)
      else if (urlPattern.test(newsText)) {
        return Swal.fire({
          icon: 'error',
          title: 'อย่ากรอกลิงก์ในช่องข้อความ!',
          text: 'เปลี่ยนไปใช้ช่องลิงก์ เพื่อให้สามารถกรอกลิงก์ได้',
          confirmButtonText: 'ลองอีกครั้ง',
          confirmButtonColor: '#d33',
        });
      }

      // ✅ ย้ายการประกาศตัวแปร wordCount มาไว้ตรงนี้ (ก่อนจะเช็คเงื่อนไข < 5 หรือ > 100)
      const wordCount = countWords(newsText);

      // 1.3 เช็คจำนวนคำน้อยเกินไป
      if (wordCount < 5) {
        return Swal.fire({
          icon: 'warning',
          title: 'ข้อความสั้นเกินไป!',
          text: 'ข้อความของคุณน้อยเกินไป (น้อยกว่า 5 คำ)...',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#f39c12',
        });
      }
      // 1.4 เช็คจำนวนคำมากเกินไป
      else if (wordCount > 100) {
        return Swal.fire({
          icon: 'warning',
          title: 'ข้อความยาวเกินไป!',
          text: `คุณใส่ข้อความมา ${wordCount} คำ (จำกัดไม่เกิน 100 คำ) กรุณาลบข้อความบางส่วนออก`,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#f39c12',
        });
      }

    } else {
      // กรณี inputType === 'link'
      
      // 2.1 เช็คค่าว่าง
      if (!newsText.trim()) {
        return Swal.fire({
          icon: 'error',
          title: 'ข้อมูลผิดรูปแบบ!',
          text: 'กรุณาวางลิงก์ข่าวเพื่อใช้ในการตรวจสอบข่าว',
          confirmButtonText: 'ลองอีกครั้ง',
          confirmButtonColor: '#d33',
        });
      }

      // เช็คจำนวนโปรโตคอลและช่องว่าง
      const protocolCount = (newsText.match(/https?:\/\//gi) || []).length;
      const hasSpace = newsText.trim().split(/\s+/).length > 1;

      // 2.2 เช็คว่าใส่มาหลายลิงก์หรือไม่
      if (protocolCount > 1) {
        return Swal.fire({
          icon: 'warning',
          title: 'ใส่ลิงก์เกิน 1 รายการ!',
          text: 'ระบบรองรับการตรวจสอบทีละ 1 ลิงก์เท่านั้น กรุณาลบลิงก์ส่วนเกินออก',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#f39c12',
        });
      }

      else if (hasSpace) {
        return Swal.fire({
          icon: 'warning',
          title: 'อย่ากรอกข้อความในช่องลิงก์ข่าว!',
          text: 'เปลี่ยนไปใช้ช่องข้อความ เพื่อให้สามารถกรอกข้อความได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#f39c12',
        });
      }

      // 2.3 ตรวจสอบรูปแบบ URL ว่าถูกต้องหรือไม่
      else if (!urlPattern.test(newsText)) {
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
    <>
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

        {/* Toggle Button Group (คงเดิม) */}
        <ToggleButtonGroup
          value={inputType}
          exclusive
          onChange={(event, newType) => {
            if (newType !== null) { setInputType(newType); setNewsText(''); }
          }}
          size="small"
          sx={{
            mb: 1.5, width: '100%', maxWidth: '300px',
            '& .MuiToggleButton-root': { backgroundColor: '#283481', color: '#FFFFFF', flex: 1, transition: 'all 0.4s' },
            '& .MuiToggleButton-root:not(.Mui-selected):hover': { background: 'linear-gradient(90deg,rgba(166, 227, 255, 1) 0%, rgba(106, 170, 251, 1) 100%)', color: '#FFFFFF' },
            '& .Mui-selected': { background: 'linear-gradient(90deg,rgba(166, 227, 255, 1) 0%, rgba(106, 170, 251, 1) 100%)', color: '#FFFFFF' },
            '& .MuiToggleButton-root:first-of-type': { borderRadius: '20px 0 0 0' },
            '& .MuiToggleButton-root:last-of-type': { borderRadius: '0 20px 0 0' },
          }}
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <ToggleButton value="text">ข้อความ</ToggleButton>
          <ToggleButton value="link">ลิงก์</ToggleButton>
        </ToggleButtonGroup>

        {/* ✅ เริ่มส่วน Custom Input Box */}
        <Box
          data-aos="fade-up"
          data-aos-delay="200"
          sx={{ width: '100%', maxWidth: '980px' }} // กำหนดความกว้างให้เท่ากับตัวข้างใน
        >
          {/* ✅ ตัว Input Box ของเดิม (ลบ data-aos ออกแล้ว) */}
          <Box
            sx={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              // Logic เส้นขอบยังคงทำงานได้ปกติโดยไม่ตีกับ AOS
              borderBottom: isFocused ? '2px solid #69A9FB' : '2px solid rgba(255,255,255,0.05)',
              transition: 'border-bottom 0.3s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <TextField
              value={newsText}
              onChange={handleTextChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              multiline
              rows={8}
              placeholder={inputType === 'text' ? "วางเนื้อหาข่าวของคุณที่นี่..." : "วางลิงก์ (URL) ของคุณที่นี่..."}
              variant="standard"
              fullWidth
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                p: 2,
                textarea: { color: 'white' }
              }}
            />

            {/* แถบ Footer ด้านล่าง */}
            {/* แถบ Footer ด้านล่าง */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              p: '8px 16px',
              flexWrap: 'wrap',
              gap: 1
            }}>
              {/* ข้อความเตือนทางซ้าย */}
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                {"* เนื้อหาข่าวควรมีความชัดเจนมาก เพื่อผลลัพธ์ที่ดีที่สุด"}
              </Typography>

              {/* ✅ ปรับแก้ตัวนับคำ/ลิงก์ */}
              <Typography variant="caption" sx={{ 
                color: (
                  // กรณี 1: อยู่หน้า Text แต่ (คำเกิน 100 หรือ ดันมี Link โผล่มา)
                  (inputType === 'text' && (currentWordCount >= 100 || linkCount > 0)) || 
                  
                  // กรณี 2: อยู่หน้า Link แต่ (Link เกิน 1 หรือ ดันพิมพ์ Text ธรรมดาที่ไม่มี Link)
                  (inputType === 'link' && (linkCount > 1 || (linkCount === 0 && newsText.trim().length > 0)))
                ) 
                  ? '#ff4444' // สีแดง
                  : 'rgba(255,255,255,0.8)', // สีปกติ
                fontWeight: 500 
              }}>
                {inputType === 'text'
                  // 🟢 Logic หน้า Text (เหมือนเดิม)
                  ? (linkCount > 0 ? `จำนวนลิงก์: ${linkCount} / 0` : `จำนวนคำ: ${currentWordCount} / 100`)
                  
                  // 🔵 Logic หน้า Link (เพิ่มเงื่อนไขใหม่)
                  : (linkCount === 0 && newsText.trim().length > 0 
                      ? `จำนวนคำ: ${currentWordCount} / 0` // ถ้าไม่มี Link เลย แต่มีข้อความ -> ขึ้นจำนวนคำ / 0 (แดง)
                      : `จำนวนลิงก์: ${linkCount > 0 ? linkCount : (newsText.trim() ? 1 : 0)} / 1` // ปกติ
                    )
                }
              </Typography>
            </Box>
          </Box>
        </Box>
        {/* จบส่วน Custom Input Box */}

        <Box
          data-aos="fade-up"
          data-aos-delay="500"
          sx={{ mt: 2 }} // ย้าย Margin top มาที่กล่องหุ้มแทน
        >
          <Button
            onClick={handleAnalyzeClick}
            disabled={isLoading}
            smooth
            variant="contained"
            size="large"
            sx={{
              width: '10rem',
              height: '2.8rem',
              // mt: 2,  <-- ลบอันนี้ออก (ย้ายไป Box ด้านบนแล้ว)
              backgroundImage: 'linear-gradient(to right, #1A9AD5, #69A9FB)',
              color: 'white',
              boxShadow: 'none',

              '&:hover': {
                backgroundImage: 'linear-gradient(to right, #178ec6, #5898ea)',
                boxShadow: 'none',
              },

              // ✅ เพิ่มส่วนนี้: ป้องกันปุ่มสีจางลงตอนกำลังโหลด (ถ้าต้องการให้สีสดเหมือนเดิม)
              '&.Mui-disabled': {
                backgroundImage: 'linear-gradient(to right, #1A9AD5, #69A9FB)', // ใช้สีเดิม
                color: 'rgba(255, 255, 255, 0.7)', // ปรับสีตัวอักษรให้ดูจางนิดเดียวพอ (ให้รู้ว่าโหลด)
                opacity: 1, // บังคับไม่ให้ปุ่มโปร่งแสง
              }
            }}
          // ❌ ลบ data-aos ออกจากตรงนี้
          // data-aos="fade-up"
          // data-aos-delay="500"
          >
            {isLoading ? (
              // เพิ่ม CircularProgress เล็กๆ ให้ดูดีขึ้น (Optional)
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                กำลังวิเคราะห์
              </>
            ) : (
              'วิเคราะห์ข่าว'
            )}
          </Button>
        </Box>
      </Box>
    </>
  );
})
export default DetectText;