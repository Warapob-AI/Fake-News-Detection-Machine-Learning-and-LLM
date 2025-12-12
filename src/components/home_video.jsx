import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import videoBg1 from '../assets/animations/videoBg1.mp4';
import videoBg2 from '../assets/animations/videoBg2.mp4';
import videoBg3 from '../assets/animations/videoBg3.mp4';
import videoBg4 from '../assets/animations/videoBg4.mp4';

const videoSources = [videoBg2, videoBg3, videoBg4];
const FADE_OFFSET = 1.5; // ตั้งค่าว่าจะให้เริ่ม Fade ก่อนวิดีโอจะจบกี่วินาที

const LoopingVideoBackground = () => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoRefs = useRef([]);
    // ❗ KEY CHANGE: นำ Ref สำหรับป้องกันการ trigger ซ้ำกลับมาใช้
    const triggeredIndexRef = useRef(null);
    const cleanupTimeoutRef = useRef(null);

    useEffect(() => {
        // ยกเลิก timeout เก่า (ถ้ามี) เพื่อป้องกันการทำงานซ้ำซ้อน
        if (cleanupTimeoutRef.current) {
            clearTimeout(cleanupTimeoutRef.current);
        }

        const currentVideoEl = videoRefs.current[currentVideoIndex];
        if (currentVideoEl) {
            // --- จัดการวิดีโอตัวใหม่ ---
            currentVideoEl.style.opacity = 1;
            currentVideoEl.play().catch(error => console.log("Video play error:", error));
            // ❗ KEY CHANGE: รีเซ็ตตัวล็อค เพื่อให้วิดีโอตัวใหม่นี้สามารถ trigger fade ได้เมื่อถึงเวลา
            triggeredIndexRef.current = null;
        }

        // --- จัดการวิดีโอตัวอื่นๆ (ตัวเก่า) ---
        videoRefs.current.forEach((videoEl, index) => {
            if (!videoEl || index === currentVideoIndex) return;

            videoEl.style.opacity = 0; // สั่งให้ Fade Out

            // หน่วงเวลาการหยุดวิดีโอเก่า ให้มันเล่นต่อไปจนจบช่วง fade
            const fadeDurationInMs = FADE_OFFSET * 1000;
            cleanupTimeoutRef.current = setTimeout(() => {
                if (videoEl.paused) return;
                videoEl.pause();
                videoEl.currentTime = 0;
            }, fadeDurationInMs);
        });

        return () => {
            if (cleanupTimeoutRef.current) {
                clearTimeout(cleanupTimeoutRef.current);
            }
        };

    }, [currentVideoIndex]);

    const handleTimeUpdate = (event, index) => {
        // ทำงานเฉพาะกับวิดีโอที่ active และยังไม่เคยถูก trigger มาก่อนเท่านั้น
        if (index === currentVideoIndex && triggeredIndexRef.current !== index) {
            const video = event.target;
            const timeLeft = video.duration - video.currentTime;

            if (timeLeft <= FADE_OFFSET) {
                // ❗ KEY CHANGE: ล็อคทันทีที่ trigger และสั่งเปลี่ยนวิดีโอ (ไม่มี video.pause() ที่นี่)
                triggeredIndexRef.current = index;
                setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
            }
        }
    };

    return (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2 }}>
            {videoSources.map((videoSrc, index) => (
                <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    key={videoSrc}
                    src={videoSrc}
                    muted
                    playsInline
                    preload="auto"
                    onTimeUpdate={(e) => handleTimeUpdate(e, index)}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '680px',
                        objectFit: 'cover',
                        opacity: index === 0 ? 1 : 0,
                        transition: `opacity ${FADE_OFFSET}s ease-in-out`,
                    }}
                />
            ))}
        </Box>
    );
};

export default LoopingVideoBackground;