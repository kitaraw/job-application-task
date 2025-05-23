import { Link as RouterLink } from "react-router-dom";
// @mui
import { styled } from "@mui/material/styles";
import {
  Box,
  Link,
  Container,
  Typography,
  Button,
  useTheme,
  Collapse,
} from "@mui/material";

// routes
import { PATH_AUTH } from "../../routes/paths";
// components
import Page from "../../components/Page";

// sections
import { RegisterForm } from "src/sections/auth/register";
import React, { useState } from "react";

// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 480,
  margin: "auto",
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export function AdminInfo() {
  const theme = useTheme(); 

  return (
    <Box
      sx={{
        mt: 2,
        mb: 2,
        p: 2,
        backgroundColor: theme.palette.primary.lighter,
        borderRadius: 2,
      }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
        Если ролей нет, добавьте их с помощью команды
        <code style={{ margin: "0 4px", fontStyle: "italic" }}>
          python manage.py create_default_roles
        </code>
        или через админку:{" "}
        <Link href="http://localhost:8000/admin" target="_blank" rel="noopener">
          http://localhost:8000/admin
        </Link>
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mt: 2, mb: 1 }}
      >
        <strong>Альтернативный способ:</strong> Используйте команду для
        добавления пользовательских ролей:
      </Typography>
      <Box
        component="code"
        sx={{
          display: "block",
          margin: "8px 0",
          padding: "8px",
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText,
          borderRadius: "4px",
        }}
      >
        python manage.py add_role
      </Box>

      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
        После запуска вы сможете вручную указать:
      </Typography>
      <Box
        component="ul"
        sx={{
          ml: 2,
          pl: 2,
          color: "text.secondary",
        }}
      >
        <Box component="li">
          <strong>Название роли:</strong> (например, manager, moderator)
        </Box>
        <Box component="li">
          Разрешения для роли:
          <Box
            component="ul"
            sx={{
              ml: 2,
              color: "text.secondary", 
            }}
          >
            <Box component="li">Добавление, редактирование или удаление ролей</Box>
            <Box component="li">Добавление, редактирование или удаление пользователей</Box>
          </Box>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
        <strong>Пример диалога:</strong>
      </Typography>
      <Box
        component="code"
        sx={{
          display: "block",
          margin: "8px 0",
          padding: "8px",
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText,
          borderRadius: "4px",
        }}
      >
        Введите название роли: manager
        <br />
        Разрешить добавление ролей? (y/n): y<br />
        Разрешить редактирование ролей? (y/n): n<br />
        Разрешить удаление ролей? (y/n): n<br />
        Разрешить добавление пользователей? (y/n): y<br />
        Разрешить редактирование пользователей? (y/n): y<br />
        Разрешить удаление пользователей? (y/n): n<br />
        Роль 'manager' успешно создана!
      </Box>

      <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
        Подробное описание указано в backend/README.md.
      </Typography>
    </Box>
  );
}

export default function Register() {
  const [showInfo, setShowInfo] = useState(false); // Состояние для управления отображением информации

  const toggleInfo = () => setShowInfo((prev) => !prev);

  return (
    <Page title="Регистрация">
      <RootStyle>
        <Container>
          <ContentStyle>
            <Box sx={{ textAlign: "end", mt: 3 }}>
              <Button variant="soft" onClick={toggleInfo}>
                {showInfo ? "Скрыть информацию" : "Информация"}
              </Button>
            </Box>
            <Collapse in={showInfo} timeout={{ enter: 1000, exit: 500 }}>
              <AdminInfo />
            </Collapse>
            <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                  Регистрация
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  Пользователь создается с ролью по умолчанию user
                </Typography>
              </Box>
            </Box>

            <RegisterForm />

            <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
              Есть профиль?{" "}
              <Link
                variant="subtitle2"
                to={PATH_AUTH.login}
                component={RouterLink}
              >
                Войти
              </Link>
            </Typography>
          </ContentStyle>
        </Container>
      </RootStyle>
    </Page>
  );
}
