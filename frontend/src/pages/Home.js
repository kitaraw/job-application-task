// @mui
import { styled } from "@mui/material/styles";
// components
import Page from "../components/Page";
// sections
import { HomeHero, CheatMenu } from "../sections/home";

// ----------------------------------------------------------------------

const RootStyle = styled("div")(() => ({
  height: "100%",
}));

// ----------------------------------------------------------------------

export default function HomePage() {
  return (
    <Page title="Тестовое задание">
      <RootStyle>
        <HomeHero />
        <CheatMenu />
      </RootStyle>
    </Page>
  );
}
