import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

// --- START: ส่วนที่แก้ไข ---
const StyledTypography = styled(Typography)(({ theme, variant }) => ({
  display: 'inline-block',
  position: 'relative',
  // กำหนดความสูงขั้นต่ำให้เท่ากับขนาดฟอนต์ของ variant นั้นๆ
  minHeight: theme.typography[variant || 'h6'].fontSize,
  '&::after': {
    content: '"|"',
    position: 'absolute',
    right: -10,
    animation: 'blink 1s step-end infinite',
  },
  '@keyframes blink': {
    'from, to': {
      color: 'transparent',
    },
    '50%': {
      color: 'inherit',
    },
  },
}));
// --- END: ส่วนที่แก้ไข ---


const TypewriterTypography = ({
  text,
  speed = 150,
  deleteSpeed = 150,
  pauseDuration = 3000,
  ...props
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleTyping = setTimeout(() => {
      if (!isDeleting && displayText.length < text.length) {
        setDisplayText(text.substring(0, displayText.length + 1));
      } else if (isDeleting && displayText.length > 0) {
        setDisplayText(text.substring(0, displayText.length - 1));
      } else if (!isDeleting && displayText.length === text.length) {
        setTimeout(() => setIsDeleting(true), pauseDuration);
      } else if (isDeleting && displayText.length === 0) {
        setIsDeleting(false);
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(handleTyping);
  }, [displayText, isDeleting, text, speed, deleteSpeed, pauseDuration]);

  return <StyledTypography {...props}>{displayText}</StyledTypography>;
};

export default TypewriterTypography;