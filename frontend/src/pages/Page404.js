import { m } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
// @mui
import { styled } from "@mui/material/styles";
import { Box, Button, Typography, Container } from "@mui/material";
// components
import Page from "../components/Page";
import { MotionContainer, varBounce } from "../components/animate";
// assets

// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  alignItems: "center",
  paddingTop: theme.spacing(35),
}));

// ----------------------------------------------------------------------

export default function Page404() {
  return (
    <Page title="404 Страница не найдена" sx={{ height: 1 }}>
      <RootStyle>
        <Container component={MotionContainer}>
          <Box sx={{ maxWidth: 500, margin: "auto", textAlign: "center" }}>
            <m.div variants={varBounce().in}>
              <Typography variant="h3" paragraph>
                Ошибка 404
              </Typography>
            </m.div>

            <Typography sx={{ color: "text.secondary" }}>
              Извините эта страница не найдена!
            </Typography>

            <Button
              to="/"
              size="large"
              sx={{ mt: 5 }}
              variant="contained"
              component={RouterLink}
            >
              Главная
            </Button>
          </Box>
        </Container>
      </RootStyle>
    </Page>
  );
}
