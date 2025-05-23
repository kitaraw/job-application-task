// @mui
import { styled } from "@mui/material/styles";
// components
import Page from "../components/Page";
// sections
import { UsersHero } from "../sections/users";

// ----------------------------------------------------------------------

const RootStyle = styled("div")(() => ({
  height: "100%",
}));

// ----------------------------------------------------------------------

export default function Users() {
  
  return (
    <Page title="Пользователи">
    
      <RootStyle>
      
        <UsersHero />
      </RootStyle>
    </Page>
  );
}
