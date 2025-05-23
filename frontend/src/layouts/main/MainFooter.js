// @mui
import { styled } from "@mui/material/styles";
import { Grid, Divider, Container, Typography } from "@mui/material";

import ChangeTheme from "src/components/ChangeTheme";
// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.background.default,
}));

// ----------------------------------------------------------------------

export default function MainFooter() {

  return (
    <RootStyle>
      <Divider />
      <Container sx={{ pt: 10, pb: 8 }}>
        <Grid
          container
          justifyContent={{ xs: "center", md: "space-between" }}
          sx={{ textAlign: { xs: "center", md: "left" } }}
        >
          <Grid item xs={8} md={5}>
            <Typography
              variant="body2"
              sx={{ pr: { md: 5 }, color: "text.secondary" }}
            >
              Тестовое задание на направление <br /> «Системы хранения и анализа
              данных»
            </Typography>
            <Typography
              variant="body2"
              sx={{
                py: 1,
                color: "text.primary",
                fontWeight: "bold",
              }}
            >
              Кравченко Никита Владимирович
            </Typography>

          </Grid>
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",

              my: "auto",
            }}
          >
            <ChangeTheme />
          </Grid>
        </Grid>
      </Container>
    </RootStyle>
  );
}
