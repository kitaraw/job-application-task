import React, { useState, useEffect } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Checkbox,
  ListItemIcon,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

/**
 * Компонент TransferList
 * - leftData: пользователи, у которых сейчас есть доступ
 * - rightData: пользователи, которых в доступе нет (полученные из getExcludedUsers)
 * - setIsModified: колбэк из родителя, чтобы управлять кнопкой "Сохранить"
 * - onUpdateLeftUsers: колбэк, который отдаёт родителю обновлённый список левого блока
 */
export default function UsersTransferList({
  leftData,
  rightData,
  setIsModified,
  onUpdateLeftUsers,
}) {
  // Левый список: уже выданные доступы
  const [left, setLeft] = useState(leftData);

  // Правый список: все остальные пользователи
  const [right, setRight] = useState(rightData);

  // Список всех отмеченных чекбоксами пользователей
  const [checked, setChecked] = useState([]);

  // Поля поиска (левый/правый список)
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  // Для удобства собираем отмеченных пользователей,
  // которые относятся к левому или правому списку
  const leftChecked = checked.filter((user) =>
    left.some((u) => u.id === user.id)
  );
  const rightChecked = checked.filter((user) =>
    right.some((u) => u.id === user.id)
  );

  // Фильтрация списков по username
  const filteredLeft = left.filter((user) =>
    user.username.toLowerCase().includes(leftSearch.toLowerCase())
  );
  const filteredRight = right.filter((user) =>
    user.username.toLowerCase().includes(rightSearch.toLowerCase())
  );

  // Переключение чекбокса: добавляем или убираем пользователя из checked
  const handleToggleUser = (user) => () => {
    const currentIndex = checked.findIndex((u) => u.id === user.id);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(user);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  // Перенос списка справа налево
  const handleRightToLeft = () => {
    setLeft([...left, ...rightChecked]);
    setRight(right.filter((u) => !rightChecked.includes(u)));
    setChecked(checked.filter((u) => !rightChecked.includes(u)));
  };

  // Перенос списка слева направо
  const handleLeftToRight = () => {
    setRight([...right, ...leftChecked]);
    setLeft(left.filter((u) => !leftChecked.includes(u)));
    setChecked(checked.filter((u) => !leftChecked.includes(u)));
  };

  // Следим за изменениями списков и определяем, изменились ли они по сравнению с исходными
  useEffect(() => {
    const isModified =
      JSON.stringify(left) !== JSON.stringify(leftData) ||
      JSON.stringify(right) !== JSON.stringify(rightData);

    setIsModified(isModified);
    onUpdateLeftUsers?.(left);
  }, [left, right, leftData, rightData, setIsModified, onUpdateLeftUsers]);

  // Сброс поля поиска
  const handleClearSearch = (setSearch) => () => {
    setSearch("");
  };

  // Общий метод рендера списков
  const renderList = (title, items, searchValue, onSearchChange) => (
    <Paper sx={{ width: "40%", height: 500, overflow: "auto", p: 1 }}>
      <Typography variant="subtitle2" textAlign="center">
        {title}
      </Typography>
      <TextField
        fullWidth
        size="small"
        variant="outlined"
        placeholder="Поиск username"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ my: 1 }}
        InputProps={{
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton onClick={handleClearSearch(onSearchChange)} size="small">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <List dense component="div" role="list">
        {items.map((user) => {
          const labelId = `transfer-list-item-${user.id}-label`;

          return (
            <ListItem key={user.id} role="listitem" onClick={handleToggleUser(user)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.some((u) => u.id === user.id)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={user.username}
                secondary={user.role ? `Роль: ${user.role}` : "Роль не указана"}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {renderList("Выданные доступы", filteredLeft, leftSearch, setLeftSearch)}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleRightToLeft}
          disabled={rightChecked.length === 0}
        >
          &lt;
        </Button>
        <Button
          variant="outlined"
          onClick={handleLeftToRight}
          disabled={leftChecked.length === 0}
        >
          &gt;
        </Button>
      </Box>

      {renderList("Все пользователи", filteredRight, rightSearch, setRightSearch)}
    </Box>
  );
}
