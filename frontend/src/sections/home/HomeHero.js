import { styled } from "@mui/material/styles";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Container,
  Grid,
  Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getStatistics } from "src/fetches/main";
import React, { useState, useEffect } from "react";
import { PATH_DASHBOARD, PATH_AUTH } from "src/routes/paths";
// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.grey[500],
  [theme.breakpoints.up("md")]: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
  },
}));

// ----------------------------------------------------------------------

export default function HomeHero() {
  const [statistics, setStatistics] = useState({
    rolesCount: null,
    usersCount: null,
    softCount: null,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await getStatistics();
        setStatistics(data);
      } catch (err) {
        setError("Ошибка получения данных");
      }
    };

    fetchStatistics();
  }, []);

  const { rolesCount, usersCount, softCount } = statistics;

  return (
    <RootStyle>
      <Container sx={{ pt: 15 }}>
        <Typography variant="h1" sx={{  mb: 4 }}>
          Управление системой
        </Typography>
        <Typography sx={{ color: "common.white", mb: 6 }}>
          Вкладки доступны только авторизованным пользователям
        </Typography>
        <Grid container spacing={4}>
          {/* Карточки Роли, Пользователи, Пакеты */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Роли
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Управляйте ролями пользователей.
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Количество ролей:{" "}
                  {rolesCount !== null ? rolesCount : error || "Загрузка..."}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  component={RouterLink}
                  to={PATH_DASHBOARD.general.roles}
                  variant="contained"
                  size="small"
                >
                  Перейти
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Пользователи
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Управляйте пользователями системы.
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Количество пользователей:{" "}
                  {usersCount !== null ? usersCount : error || "Загрузка..."}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  component={RouterLink}
                  to={PATH_DASHBOARD.general.users}
                  variant="contained"
                  size="small"
                >
                  Перейти
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Пакеты
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Управляйте доступными пакетами.
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Количество пакетов:{" "}
                  {softCount !== null ? softCount : error || "Загрузка..."}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  component={RouterLink}
                  to={PATH_DASHBOARD.general.packages}
                  variant="contained"
                  size="small"
                >
                  Перейти
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Карточки Вход и Регистрация */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Вход
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Войдите в свою учетную запись, чтобы получить доступ к
                  системе.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  component={RouterLink}
                  to={PATH_AUTH.login}
                  variant="contained"
                  size="small"
                >
                  Перейти
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Регистрация
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Создайте новую учетную запись, чтобы начать работу.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  component={RouterLink}
                  to={PATH_AUTH.register}
                  variant="contained"
                  size="small"
                >
                  Перейти
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
}
