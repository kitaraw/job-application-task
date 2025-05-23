import React from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Box } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { HEADER } from "src/config";
import { PATH_DASHBOARD } from "src/routes/paths";

export default function CustomBreadcrumbs({ adjustColor = false }) {
  const location = useLocation();
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const links = [
    { label: "Главная", path: "/" },
    { label: "Роли", path: PATH_DASHBOARD.general.roles },
    { label: "Пользователи", path: PATH_DASHBOARD.general.users },
    { label: "Пакеты", path: PATH_DASHBOARD.general.packages },
  ];

  return (
    <Box
      sx={{
        mt: `${HEADER.MAIN_DESKTOP_HEIGHT}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pb: 2,
      }}
    >
      <Breadcrumbs aria-label="breadcrumb">
        {links.map(({ label, path }, index) => {
          const isActive = location.pathname === path;

          // Если путь активен — отображаем Typography
          if (isActive) {
            return (
              <Typography
                key={index}
                color={adjustColor && !isLight ? theme.palette.common.black : "text.primary"}
              >
                {label}
              </Typography>
            );
          }

          // Иначе — делаем ссылку
          return (
            <MuiLink
              key={index}
              component={RouterLink}
              to={path}
              color="inherit"
              underline="hover"
            >
              {label}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
