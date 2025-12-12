import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, Typography, Box } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';

const AnimatedCircle = animated.circle;

function CircularProgressWithLabel(props) {
    const sizeCircle = 340;
    const strokeWidth = 10;
    const radius = (sizeCircle - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    // ✅ ปรับแก้ useSpring ที่นี่
    const { offset } = useSpring({
        from: { offset: circumference }, // เริ่มต้นที่ 0%
        to: { offset: circumference - (props.value / 100) * circumference },
        // ✨ 1. ปรับ config ให้ช้าและนุ่มนวลขึ้น
        config: {
            tension: 120, // ค่าน้อยลงจะทำให้ "เด้ง" น้อยลง
            friction: 60,  // ค่ามากขึ้นจะทำให้หยุดนิ่งเร็วขึ้น (Smooth)
        },
        // ✨ 2. ลบ reset: true เพื่อให้แอนิเมชันทำงานแค่ครั้งเดียว
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