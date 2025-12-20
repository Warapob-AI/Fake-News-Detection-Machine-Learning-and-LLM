import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';

const AnimatedCircle = animated.circle;

function CircularProgressWithLabel(props) {
    // 1. เรียกใช้ Theme และ Media Query เพื่อเช็คขนาดหน้าจอ
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // จอเล็กกว่า 600px

    // 2. กำหนดขนาด (Config) ตามขนาดหน้าจอ
    let sizeCircle = 340; // ขนาดปกติ (Desktop)
    let strokeWidth = 10; // ความหนาเส้นปกติ
    let fontSizeVariant = "h3"; // ขนาดตัวอักษรปกติ

    if (isMobile) {
        sizeCircle = 300; // ลดขนาดลงสำหรับมือถือ
        strokeWidth = 10;  // ลดความหนาเส้น
        fontSizeVariant = "h3"; // ลดขนาดตัวอักษร
    } 

    // คำนวณค่าทางคณิตศาสตร์ใหม่ตาม sizeCircle ที่เปลี่ยนไป
    const radius = (sizeCircle - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    // useSpring
    const { offset } = useSpring({
        from: { offset: circumference },
        to: { offset: circumference - (props.value / 100) * circumference },
        config: {
            tension: 120,
            friction: 60,
        },
        // ใส่ dependencies เพื่อให้คำนวณใหม่เมื่อขนาดหน้าจอเปลี่ยน
        reset: false, 
    });

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'inline-flex',
                filter: 'drop-shadow(0px 8px 10px rgba(0, 0, 0, 0.4))'
            }}
        >
            <CircularProgress
                variant="determinate"
                value={100}
                sx={{
                    color: 'rgba(0, 0, 0, 0.2)',
                    filter: 'blur(1px)',
                }}
                size={sizeCircle}
                thickness={strokeWidth}
            />

            <svg
                width={sizeCircle}
                height={sizeCircle}
                style={{
                    position: 'absolute',
                    left: 0,
                    transform: 'rotate(-90deg)',
                }}
            >
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={props.color_stop_1} />
                        <stop offset="100%" stopColor={props.color_stop_2} />
                    </linearGradient>
                </defs>
                
                <AnimatedCircle
                    cx={sizeCircle / 2}
                    cy={sizeCircle / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>

            <Box
                sx={{
                    top: 0, left: 0, bottom: 0, right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="h3"
                    component="div"
                    color="white"
                    fontWeight="bold"
                    sx={{
                        textShadow: '0px 2px 5px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {`${(props.value)}`}%
                </Typography>
            </Box>
        </Box>
    );
}

CircularProgressWithLabel.propTypes = {
    value: PropTypes.number.isRequired,
    color_stop_1: PropTypes.string,
    color_stop_2: PropTypes.string,
};

export default CircularProgressWithLabel;