import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Box, keyframes } from "@mui/material";
import useSettings from "../hooks/useSettings";
import { IconButtonAnimate } from "./animate";
import { Icon } from "@iconify/react";

const rotateScale = keyframes`
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(0.5);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
`;

const ChangeTheme = forwardRef(({ isOffset, isHome }, ref) => {
  const { themeMode, onToggleMode } = useSettings();
  const [isAnimating, setIsAnimating] = useState(false);
  const [icon, setIcon] = useState(
    themeMode === "dark" ? "eva:moon-fill" : "eva:loader-outline"
  );

  const iconColor = isOffset
    ? "text.primary"
    : isHome
    ? "common.white"
    : "text.primary";

  useImperativeHandle(ref, () => ({
    handleIconClick,
  }));

  const handleIconClick = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        onToggleMode();
        setIcon(themeMode === "dark" ? "eva:loader-outline" : "eva:moon-fill");
      }, 300);

      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }
  };

  return (
    <Box sx={{ textAlign: "center", mx: 2.5, marginBottom: "auto" }}>
      <IconButtonAnimate
        onClick={handleIconClick}
        disabled={isAnimating}
        sx={{
          animation: isAnimating
            ? `${rotateScale} 0.6s ease-in-out forwards`
            : "none",
          color: iconColor,
          transition: "color 0.3s",
        }}
        size="small"
      >
        <Icon icon={icon} />
      </IconButtonAnimate>
    </Box>
  );
});

export default ChangeTheme;
