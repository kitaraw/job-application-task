// ============================================================================
//                      Компонент UserRow (строка таблицы)
// ============================================================================
import {
  Typography,
  Switch,
  IconButton,
  ListItemText,
  TextField,
  Box,
  MenuItem,
  Tooltip,
  Stack
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

import { StyledTableRow, StyledTableCell } from ".";

import React, { useState } from "react";

import { updateUser, deleteUser } from "src/fetches/main";

export default function UserRow({

  userData,
  currentUser,
  onTogglePermission,
  onSaveUser,
  editableRoles,
  canDeleteUsers,
  onDeleteUser,
}) {
  //   console.log("editableRoles", editableRoles);

  // Проверка, является ли это наша собственная запись
  const isCurrentUser = userData.id === currentUser.id;

  // Проверяем права текущего пользователя
  const canEditUsers = currentUser.currentRole.permissions.some(
    (perm) => perm.permission === "edit_users" && perm.allowed
  );

  // Можно ли *редактировать* (именно поля first_name, last_name, email) этого пользователя?
  const canEditThisRow = isCurrentUser || canEditUsers;

  // Локальный стейт для режима редактирования
  const [isEditing, setIsEditing] = useState(false);

  const canEditRoles =
    !isEditing &&
    currentUser.currentRole.permissions.some(
      (perm) => perm.permission === "edit_roles" && perm.allowed
    );
  // Локальный стейт для полей (имя, фамилия, email)
  const [localFirstName, setLocalFirstName] = useState(userData.first_name);
  const [localLastName, setLocalLastName] = useState(userData.last_name);
  const [localEmail, setLocalEmail] = useState(userData.email);
  const [localUsername, setLocalUsername] = useState(userData.username);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      // Формируем обновлённого пользователя
      const updatedUser = {
        ...userData,
        first_name: localFirstName,
        last_name: localLastName,
        email: localEmail,
        username: localUsername,
      };

      // Обновляем пользователя
      await updateUser(updatedUser.id, updatedUser);

      // Сохраняем локально
      onSaveUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      let errorMessage = "Что-то пошло не так";

      if (typeof error === "object" && error !== null) {
        errorMessage = Object.entries(error)
          .map(([field, messages]) =>
            Array.isArray(messages)
              ? `${field}: ${messages.join(", ")}`
              : `${field}: ${messages}`
          )
          .join("\n");
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      alert(errorMessage);
    }
  };

  const handleDeleteClick = async () => {
    try {
      await deleteUser(userData.id); // Удаляем пользователя по ID

      if (onDeleteUser) {
        onDeleteUser(userData.id);
      }

    } catch (error) {
      alert("Ошибка при удалении пользователя: " + error.message || error);
    }
  };

  return (
    <StyledTableRow>
      <StyledTableCell>{userData.id}</StyledTableCell>
      <StyledTableCell>
        {isEditing ? (
          <TextField
            size="small"
            label="Логин пользователя"
            fullWidth
            value={localUsername}
            onChange={(e) => setLocalUsername(e.target.value)}
          />
        ) : (
          localUsername
        )}
      </StyledTableCell>

      <StyledTableCell>
        {isEditing ? (
          <TextField
            size="small"
            label="Имя"
            fullWidth
            value={localFirstName}
            onChange={(e) => setLocalFirstName(e.target.value)}
          />
        ) : (
          userData.first_name
        )}
      </StyledTableCell>

      <StyledTableCell>
        {isEditing ? (
          <TextField
            size="small"
            label="Фамилия"
            fullWidth
            value={localLastName}
            onChange={(e) => setLocalLastName(e.target.value)}
          />
        ) : (
          userData.last_name
        )}
      </StyledTableCell>

      <StyledTableCell>
        {isEditing ? (
          <TextField
            size="small"
            label="Email"
            fullWidth
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
          />
        ) : (
          userData.email
        )}
      </StyledTableCell>

      {/* Роль (меняется только если есть право edit_roles; ) */}
      <StyledTableCell>
        {isEditing ? (
          editableRoles.length === 0 ? (
            <Typography>{userData.role?.rolename}</Typography>
          ) : (
            <TextField
              select
              size="small"
              label="Роль"
              value={userData.role?.rolename || ""}
              onChange={(e) => {
                const selectedRole = editableRoles.find(
                  (role) => role.rolename === e.target.value
                );
                const updatedUser = {
                  ...userData,
                  role: selectedRole,
                };
                onSaveUser(updatedUser);
              }}
            >
              {editableRoles.map((role) => (
                <MenuItem key={role.id} value={role.rolename}>
                  {role.rolename}
                </MenuItem>
              ))}
            </TextField>
          )
        ) : canEditRoles ? (
          <Tooltip
            title="Пожалуйста, обратите внимание: переключая права на одной роли, они изменятся у всех пользователей с этой ролью"
            arrow
            placement="bottom"
          >
            <Typography>{userData.role?.rolename}</Typography>
          </Tooltip>
        ) : (
          <Typography>{userData.role?.rolename}</Typography>
        )}
      </StyledTableCell>


      <StyledTableCell>
        {userData.role?.permissions?.map((perm) => {
          return (
            <Box
              key={perm.permission}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Switch
                checked={perm.allowed}
                onChange={() =>
                  onTogglePermission(userData.id, perm.permission)
                }
                size="small"
                color="success"
                sx={{ mr: 1 }}
                disabled={
                  !canEditRoles || isCurrentUser // Не даём менять права себе
                }
              />
              <ListItemText
                primary={
                  <Typography variant="body2">{perm.description}</Typography>
                }
                secondary={
                  <Typography variant="caption">{perm.permission}</Typography>
                }
              />
            </Box>
          );
        })}
      </StyledTableCell>

      <StyledTableCell align="center">
        {isEditing ? (
          <IconButton onClick={handleSaveClick} color="info">
            <SaveIcon />
          </IconButton>
        ) : (
          <Stack direction="column" spacing={1} alignItems="center">
            {canEditThisRow && (
              <IconButton onClick={handleEditClick} color="info" size="small">
                <EditIcon />
              </IconButton>
            )}
            {canDeleteUsers && (
              <IconButton
                onClick={handleDeleteClick}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Stack>
        )}
      </StyledTableCell>
    </StyledTableRow>
  );
}
