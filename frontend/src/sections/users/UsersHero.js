import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Container, Grid, Box, Button } from "@mui/material";
import { CircularProgress } from "@mui/material";
import { getUsers } from "src/fetches/main";
import useAuth from "src/hooks/useAuth";
import CustomBreadcrumbs from "src/components/CustomBreadcrumbs";
import { useTheme } from "@mui/material/styles";

import UserTable from "./UserTable";
import { getRegistrationRoles, updateUserPermission } from "src/fetches/main";
import AddUserDialog from "./AddUserDialog";

const RootStyle = styled("div")(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.grey[200],
  [theme.breakpoints.up("md")]: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
  },
}));

export default function UsersHero() {
  const theme = useTheme();

  // Список всех пользователей
  const [users, setUsers] = useState([]);
  const [editableRoles, setEditableRoles] = useState([]); // Роли, которые можно редактировать

  // Текущий пользователь (из контекста авторизации)
  const { user: currentUser } = useAuth();

  console.log("user", currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Загружаем пользователей один раз при монтировании
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Ошибка при загрузке пользователей:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // --- Проверяем, может ли текущий пользователь редактировать ЧУЖИЕ permissions (edit_roles)
  const canEditRoles = currentUser?.currentRole?.permissions?.some(
    (perm) => perm.permission === "edit_roles" && perm.allowed
  );

  // --- Проверяем, может ли текущий пользователь добавлять пользователей (add_user)
  const canAddUsers = currentUser?.currentRole?.permissions?.some(
    (perm) => perm.permission === "add_users" && perm.allowed
  );

  // --- Проверяем, может ли текущий пользователь удалять пользователей (delete_users)
  const canDeleteUsers = currentUser?.currentRole?.permissions?.some(
    (perm) => perm.permission === "add_users" && perm.allowed
  );

  useEffect(() => {
    const fetchEditableRoles = async () => {
      if (!canEditRoles) return; // Если пользователь не может редактировать роли, выходим

      try {
        const roles = await getRegistrationRoles({ excludeAdmin: false });

        setEditableRoles(roles);
      } catch (error) {
        console.error("Ошибка при загрузке ролей:", error);
      }
    };
    fetchEditableRoles();
  }, [canEditRoles]);

  // Обработчик переключения конкретного permission для конкретного пользователя
  const handleTogglePermission = async (userId, permName) => {
    try {
      // Если нет права "edit_roles", выходим
      if (!canEditRoles) return;

      // Для примера запрещаем изменять СВОИ права
      if (userId === currentUser.id) return;

      // Находим пользователя
      const user = users.find((u) => u.id === userId);
      if (!user) {
        console.error(`Пользователь с ID ${userId} не найден.`);
        return;
      }

      // Находим разрешение и вычисляем новое значение
      const permission = user.role.permissions.find(
        (p) => p.permission === permName
      );
      if (!permission) {
        console.error(
          `Разрешение "${permName}" не найдено у пользователя ${userId}.`
        );
        return;
      }

      const newValue = !permission.allowed;
      console.log(
        `Изменяем разрешение "${permName}" для пользователя ${userId} на значение:`,
        newValue
      );

      // Получаем имя роли пользователя, у которого кликнули Switch
      const userRoleName = user.role.rolename;
      // Обновляем локально стейт (оптимистический апдейт)
      // у ВСЕХ пользователей с той же role.rolename
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.role.rolename === userRoleName) {
            const updatedPermissions = u.role.permissions.map((p) => {
              if (p.permission === permName) {
                return { ...p, allowed: newValue };
              }
              return p;
            });
            return {
              ...u,
              role: { ...u.role, permissions: updatedPermissions },
            };
          }
          return u;
        })
      );
      // -------------------------------------------------------------------

      // Вызываем API для сохранения изменений
      await updateUserPermission(userId, permName, newValue);
      console.log(
        `Разрешение "${permName}" для пользователя ${userId} успешно обновлено.`
      );
    } catch (error) {
      console.error("Ошибка обновления разрешения:", error);

      // Если API вернул детализированное сообщение
      if (error.detail) {
        alert(`Ошибка: ${error.detail}`);
      } else {
        // Общая ошибка
        alert("Произошла ошибка при обновлении разрешения. Попробуйте снова.");
      }

      // Откат изменений в локальном состоянии
      const user = users.find((u) => u.id === userId);
      if (user) {
        const permission = user.role.permissions.find(
          (p) => p.permission === permName
        );
        if (permission) {
          const originalValue = permission.allowed;

          // Имя роли, у которой меняли разрешение
          const userRoleName = user.role.rolename;

          // Откат для всех пользователей с тем же именем роли
          setUsers((prevUsers) =>
            prevUsers.map((u) => {
              if (u.role.rolename === userRoleName) {
                const updatedPermissions = u.role.permissions.map((p) => {
                  if (p.permission === permName) {
                    return { ...p, allowed: originalValue };
                  }
                  return p;
                });
                return {
                  ...u,
                  role: { ...u.role, permissions: updatedPermissions },
                };
              }
              return u;
            })
          );
        }
      }
      // -------------------------------------------------------------------
    }
  };

  // Обработчик сохранения изменений пользователя (имени, фамилии, email)
  const handleSaveUser = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };
  // Проверка наличия пользователей
  const hasUsers = Array.isArray(users) && users.length > 0;

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  const handleCreateUser = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
    setIsDialogOpen(false);
  };

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
          Управление пользователями
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            {canAddUsers && (
              <Button
                variant="contained"
                color="primary"
                sx={{ mb: 3 }}
                onClick={handleOpenDialog}
              >
                Добавить пользователя
              </Button>
            )}

            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "70vh",
                }}
              >
                <CircularProgress />
              </Box>
            ) : hasUsers ? (
              <UserTable
                users={users}
                currentUser={currentUser}
                onTogglePermission={handleTogglePermission}
                onSaveUser={handleSaveUser}
                editableRoles={editableRoles}
                canDeleteUsers={canDeleteUsers}
                onDeleteUser={(userId) => {
                  setUsers((prevUsers) =>
                    prevUsers.filter((user) => user.id !== userId)
                  );
                }}
              />
            ) : (
              <Typography variant="h6" sx={{ textAlign: "center" }}>
                Пользователей пока нет
              </Typography>
            )}
          </Grid>
        </Grid>

        <AddUserDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onCreate={handleCreateUser}
        />
      </Container>
    </RootStyle>
  );
}
