import { Link as RouterLink } from "react-router-dom";
// @mui
import { styled } from "@mui/material/styles";
import {
  Box,
  Stack,
  Link,
  Alert,
  Container,
  Typography,
} from "@mui/material";
// routes
import { PATH_AUTH } from "../../routes/paths";

// components
import Page from "../../components/Page";

// sections
import { LoginForm } from "src/sections/auth/register";

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

export default function Login() {


  return (
    <Page title="Логин">
      <RootStyle>
        <Container maxWidth="sm">
          <ContentStyle>
            <Stack direction="row" alignItems="center" sx={{ mb: 5 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                  Вход
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  Введите свои данные ниже.
                </Typography>
              </Box>
            </Stack>

            <Alert severity="info" sx={{ mb: 3 }}>
              Роль admin логин: <strong>root</strong> / Пароль :
              <strong> toor</strong>
            </Alert>

            <LoginForm />

            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              Не зарегестрированны?{" "}
              <Link
                variant="subtitle2"
                component={RouterLink}
                to={PATH_AUTH.register}
              >
                Начнать
              </Link>
            </Typography>
          </ContentStyle>
        </Container>
      </RootStyle>
    </Page>
  );
}
