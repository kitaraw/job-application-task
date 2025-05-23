// @mui
import { styled } from "@mui/material/styles";
// components
import Page from "../components/Page";
// sections
import { RolesHero } from "../sections/roles";

// ----------------------------------------------------------------------

const RootStyle = styled("div")(() => ({
  height: "100%",
}));

// ----------------------------------------------------------------------

export default function Roles() {
  return (
    <Page title="Роли">
      <RootStyle>
        <RolesHero />
      </RootStyle>
    </Page>
  );
}
