import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Container, CircularProgress } from "@mui/material";
import useAuth from "src/hooks/useAuth";
import CustomBreadcrumbs from "src/components/CustomBreadcrumbs";
import { useTheme } from "@mui/material/styles";
import { getSofts } from "src/fetches/main";
import AdminSoftsCards from "./AdminSoftsCards";
import UsersSoftsCards from "./UsersSoftsCards";

const RootStyle = styled("div")(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.grey[200],
  [theme.breakpoints.up("md")]: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
  },
}));

export default function PackagesHero() {
  const theme = useTheme();
  const [softs, setSofts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const isAdmin = currentUser.currentRole?.name === "admin";

  useEffect(() => {
    const fetchSofts = async () => {
      try {
        const data = await getSofts();
        setSofts(data);
      } catch (error) {
        console.error("Ошибка при загрузке softs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSofts();
  }, []);

  if (loading) {
    return (
      <RootStyle>
        <Container sx={{ py: 5, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      </RootStyle>
    );
  }

  return (
    <RootStyle>
      <Container sx={{ py: 5 }}>
        <CustomBreadcrumbs adjustColor={true} />

        <Typography
          variant="h3"
          sx={{
            mb: 4,
            color:
              theme.palette.mode === "light"
                ? "inherit"
                : theme.palette.common.black,
          }}
        >
          Управление пакетами
        </Typography>

        {isAdmin ? (
          <AdminSoftsCards softs={softs} setSofts={setSofts} />
        ) : (
          <UsersSoftsCards softs={softs} />
        )}
      </Container>
    </RootStyle>
  );
}
