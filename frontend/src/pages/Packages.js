// @mui
import { styled } from "@mui/material/styles";
// components
import Page from "../components/Page";
// sections
import { PackagesHero } from "../sections/packages";

// ----------------------------------------------------------------------

const RootStyle = styled("div")(() => ({
  height: "100%",
}));

// ----------------------------------------------------------------------

export default function Packages() {
  return (
    <Page title="Пакеты">
      <RootStyle>
        <PackagesHero />
      </RootStyle>
    </Page>
  );
}
