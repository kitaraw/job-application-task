import { styled } from "@mui/material/styles";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Container,
  Grid,
  Box,
  IconButton,
  Switch,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import React, { useState, useEffect } from "react";
import {
  getRoles,
  updatePermissions,
  deletePermissions,
} from "src/fetches/main";
import useAuth from "src/hooks/useAuth";
import AddRoleDialog from "./addRoleDialog";
import AddIcon from "@mui/icons-material/Add";
import CustomBreadcrumbs from "src/components/CustomBreadcrumbs";
// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.grey[400],
  [theme.breakpoints.up("md")]: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
  },
}));

// ----------------------------------------------------------------------

export default function RolesHero() {
  const [roles, setRoles] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null); // ID роли в режиме редактирования
  const [isAddRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (error) {
        console.error("Ошибка при загрузке ролей:", error);
      }
    };

    fetchRoles();
  }, []);

  const canAddRoles = user.currentRole.permissions.some(
    (perm) => perm.permission === "add_roles" && perm.allowed
  );

  const canEditRoles = user.currentRole.permissions.some(
    (perm) => perm.permission === "edit_roles" && perm.allowed
  );

  const canDeleteRoles = user.currentRole.permissions.some(
    (perm) => perm.permission === "delete_roles" && perm.allowed
  );

  const toggleEditMode = (roleId) => {
    setEditingRoleId((prev) => (prev === roleId ? null : roleId));
  };

  const handleSwitchChange = (roleId, permission) => {
    if (!canEditRoles) {
      alert("У вас нет прав на редактирование ролей.");
      return;
    }

    if (roleId === "admin" && user.currentRole.name !== "admin") {
      alert("Вы не можете редактировать роль admin.");
      return;
    }

    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: role.permissions.map((perm) =>
                perm.permission === permission
                  ? { ...perm, allowed: !perm.allowed }
                  : perm
              ),
            }
          : role
      )
    );
  };

  const handleDeleteRole = async (roleName) => {
    if (!canDeleteRoles) {
      alert("У вас нет прав на удаление ролей.");
      return;
    }

    try {
      await deletePermissions(roleName);

      setRoles((prevRoles) =>
        prevRoles.filter((role) => role.rolename !== roleName)
      );
      console.log(`Роль с именем ${roleName} удалена.`);
    } catch (error) {
      const errorMessage =
        error?.detail || "Не удалось удалить роль. Попробуйте снова.";
      alert(errorMessage);
    }
  };

  const handleSaveRole = async (role) => {
    if (!canEditRoles) {
      alert("У вас нет прав на редактирование ролей.");
      return;
    }

    const data = {
      rolename: role.rolename,
      permissions: role.permissions.map((perm) => ({
        permission: perm.permission,
        allowed: perm.allowed,
      })),
    };

    try {
      // Вызываем API для обновления роли
      const updatedRole = await updatePermissions(role.id, data);

      // Обновляем роль в списке
      setRoles((prevRoles) =>
        prevRoles.map((r) => (r.id === role.id ? updatedRole : r))
      );

      console.log(`Роль с ID ${role.id} обновлена.`);
    } catch (error) {
      // Обработка ошибок
      const errorMessage =
        error?.detail || "Не удалось обновить роль. Попробуйте снова.";
      alert(errorMessage);
    }
  };
  const handleAddRole = (newRole) => {
    // Просто добавляем новую роль в список
    setRoles((prevRoles) => [...prevRoles, newRole]);
    console.log("Добавлена новая роль:", newRole);
  };
  console.log("roles", roles);
  return (
    <RootStyle>
      <Container sx={{ py: 5 }}>
        <CustomBreadcrumbs />
        <Typography variant="h3" sx={{ mb: 2 }}>
          Управление ролями
        </Typography>
        <Typography sx={{ color: "text.primary", mb: 2 }}>
          Список ролей
        </Typography>
        {canAddRoles && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mb: 4 }}
            onClick={() => setAddRoleDialogOpen(true)}
          >
            Добавить новую роль
          </Button>
        )}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {roles.map((role) => (
            <Grid item xs={12} sm={6} md={4} key={role.id}>
              <Card>
                <CardHeader
                  title={`Роль - ${role.rolename}`}
                  action={
                    <Box>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => toggleEditMode(role.id)}
                        disabled={
                          (role.rolename === "admin" &&
                            user.currentRole.name !== "admin") ||
                          !canEditRoles
                        }
                      >
                        {editingRoleId === role.id ? (
                          <CloseIcon />
                        ) : (
                          <EditIcon />
                        )}
                      </IconButton>
                      <IconButton
                        color="secondary"
                        size="small"
                        onClick={() => handleDeleteRole(role.rolename)}
                        disabled={role.rolename === "admin" || !canDeleteRoles}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                />
                <CardContent>
                  <Box>
                    {role.permissions.map((perm) => (
                      <Box
                        key={perm.permission}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1.5,
                          p: 0.5,
                        }}
                      >
                        <Typography variant="caption">
                          {perm.description}
                        </Typography>
                        {editingRoleId === role.id ? (
                          <Switch
                            size="small"
                            checked={perm.allowed}
                            onChange={() =>
                              handleSwitchChange(role.id, perm.permission)
                            }
                          />
                        ) : perm.allowed ? (
                          <CheckCircleIcon
                            sx={{ color: "success.main", fontSize: "1rem" }}
                          />
                        ) : (
                          <CancelIcon
                            sx={{ color: "error.main", fontSize: "1rem" }}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
                {editingRoleId === role.id && (
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={() => handleSaveRole(role)}
                    >
                      Сохранить
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
        <AddRoleDialog
          open={isAddRoleDialogOpen}
          onClose={() => setAddRoleDialogOpen(false)}
          onSave={handleAddRole}
        />
      </Container>
    </RootStyle>
  );
}
