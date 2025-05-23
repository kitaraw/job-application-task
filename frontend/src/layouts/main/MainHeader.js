// @mui
import { styled, useTheme,alpha } from "@mui/material/styles";
import {
  Box,
  Link,
  Button,
  AppBar,
  Toolbar,
  Container,
  Typography,
  Tooltip,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
// config
import { HEADER } from "../../config";
// components
import { Link as RouterLink } from "react-router-dom";

import { PATH_AUTH } from "src/routes/paths";
import useAuth from "src/hooks/useAuth";

import CheckCircleIcon from "@mui/icons-material/CheckCircle"; 
import CancelIcon from "@mui/icons-material/Cancel";

// -----------------------------------------------------------------------

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  height: HEADER.MOBILE_HEIGHT,
  transition: theme.transitions.create(["height", "background-color"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  [theme.breakpoints.up("md")]: {
    height: HEADER.MAIN_DESKTOP_HEIGHT,
  },
}));

// ----------------------------------------------------------------------

export default function MainHeader() {
  const { user, logout } = useAuth();
  const theme = useTheme();

  const renderPermissionsTooltip = () => (
    <Box>
      {user?.currentRole?.permissions.map((permission) => (
        <Box
          key={permission.permission}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            p: 0.5,
          }}
        >
          <Typography variant="caption">{permission.description}</Typography>
          {permission.allowed ? (
            <CheckCircleIcon sx={{ color: "success.main", fontSize: "1rem" }} />
          ) : (
            <CancelIcon sx={{ color: "error.main", fontSize: "1rem" }} />
          )}
        </Box>
      ))}
    </Box>
  );

  return (
    <AppBar sx={{ bgcolor: "transparent" }}>
      <ToolbarStyle
        disableGutters
        sx={{
          backdropFilter: `blur(6px)`,
          WebkitBackdropFilter: `blur(6px)`,
          backgroundColor: alpha(
            theme?.palette.background.default || "#000000",
            0.8
          ), 
        }}
      >
        <Container
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Ссылка на главную */}
          <Link
            variant="body2"
            component={RouterLink}
            to="/"
            sx={{
              lineHeight: 2,
              display: "flex",
              alignItems: "center",
              color: "text.primary",
              "& > div": { display: "inherit" },
            }}
          >
            Главная
          </Link>

          <Box sx={{ flexGrow: 1 }} />

          {/* Информация о пользователе, если он авторизован */}
          {user && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: 1,
                px: 2,
                py: 1,
                mr: 4,
                bgcolor: "background.paper",
              }}
            >
              <ListItem sx={{ p: 0 }}>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.username}
                  secondary={user.currentRole?.name}
                  primaryTypographyProps={{
                    variant: "subtitle1",
                    color: "text.primary",
                  }}
                  secondaryTypographyProps={{
                    variant: "caption",
                    color: "text.secondary",
                  }}
                />
              </ListItem>

              <Tooltip
                title={renderPermissionsTooltip()}
                placement="bottom"
                arrow
              >
                <Typography
                  variant="caption"
                  sx={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    ml: 2,
                    color: "text.primary",
                  }}
                >
                  Права
                </Typography>
              </Tooltip>
            </Box>
          )}

          {user ? (
            <Button
              variant="contained"
              size="small"
              color="warning"
              onClick={logout}
              sx={{
                lineHeight: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              Выход
            </Button>
          ) : (
            // Кнопки "Вход" и "Регистрация" для неавторизованных пользователей
            <>
              <Link
                variant="body2"
                component={RouterLink}
                to={PATH_AUTH.login}
                sx={{
                  lineHeight: 2,
                  mr: 4,
                  display: "flex",
                  alignItems: "center",
                  color: "text.primary",
                  "& > div": { display: "inherit" },
                }}
              >
                Вход
              </Link>
              <Link
                variant="body2"
                component={RouterLink}
                to={PATH_AUTH.register}
                sx={{
                  lineHeight: 2,
                  display: "flex",
                  alignItems: "center",
                  color: "text.primary",
                  "& > div": { display: "inherit" },
                }}
              >
                Регистрация
              </Link>
            </>
          )}
        </Container>
      </ToolbarStyle>
    </AppBar>
  );
}
