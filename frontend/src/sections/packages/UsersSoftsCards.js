import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

} from "@mui/material";
import Masonry from "@mui/lab/Masonry";

import { getExcludedUsers, grantAccessToSoft } from "src/fetches/main";
import UsersTransferList from "./UsersTransferList";

export default function UsersSoftsCards({ softs, setSofts }) {
  const [open, setOpen] = useState(false);
  const [selectedSoft, setSelectedSoft] = useState(null);
  const [excludedUsers, setExcludedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModified, setIsModified] = useState(false);


  const handleOpenDialog = async (soft) => {
    setSelectedSoft(soft);
    setOpen(true);
    setLoading(true);

    const logins = soft.users_with_access.map((user) => user.username);
    try {
      const result = logins.length
        ? await getExcludedUsers(soft.id, logins)
        : await getExcludedUsers(soft.id);
      setExcludedUsers(result);
    } catch (error) {
      console.error("Ошибка при получении исключенных пользователей:", error);
    } finally {
      setLoading(false);
    }
  };

  // Закрытие диалога
  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedSoft(null);
    setExcludedUsers([]);
    setLoading(false);
    setIsModified(false);
  };

  // Колбэк для дочернего компонента
  // Будет вызван, когда изменится левый список (кто получил доступ)
  const handleUpdateLeftUsers = (newLeftUsers) => {
    // Обновляем `selectedSoft` так, чтобы в нём были новые пользователи
    setSelectedSoft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        users_with_access: newLeftUsers, // обновили
      };
    });
  };

  // Сохранение изменений
  const handleSave = async () => {
    try {
      console.log("Текущее состояние selectedSoft:", selectedSoft);

      await grantAccessToSoft(selectedSoft.id, selectedSoft);

      // Обновляем массив softs
      const updatedSofts = softs.map((soft) =>
        soft.id === selectedSoft.id ? selectedSoft : soft
      );


      setSofts(updatedSofts);

      setIsModified(false);
      handleCloseDialog(); 
    } catch (error) {
      let errorMessage = "Что-то пошло не так";

      if (typeof error === "object" && error !== null) {
        errorMessage = Object.entries(error.response?.data || error)
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
      console.error("Ошибка при сохранении изменений:", error);
    }
  };

  //   console.log("softs", softs);

  return (
    <>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        textAlign="center"
        sx={{ pb: 1 }}
      >
        Так как роль не админ, вы можете просматривать только список разрешенных
        вам пакетов
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{ pb: 4 }}
      >
        Всего пакетов доступных к просмотру: {softs.length}
      </Typography>

      <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
        {softs.map((soft) => (
          <Card key={soft.id}>
            <CardHeader
              title={`Пакет id - ${soft.id}`}
              titleTypographyProps={{ variant: "h6" }}
              subheader={soft.softname}
              subheaderTypographyProps={{ variant: "caption" }}
            />
            <CardContent sx={{ p: 0 }}>
              <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                Доступы
              </Typography>
              <List>
                {soft.users_with_access.length > 0 ? (
                  soft.users_with_access.map((user) => (
                    <ListItem key={user.id}>
                      <Avatar sx={{ marginRight: 2, width: 34, height: 34 }}>
                        {user.username[0]?.toUpperCase() || "?"}
                      </Avatar>
                      <ListItemText
                        primary={user.username}
                        secondary={`Роль - ${user.role}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ p: 3 }}
                  >
                    У этого пакета ещё нет пользователей которым выдан доступ.
                  </Typography>
                )}
              </List>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleOpenDialog(soft)}
              >
                Управление доступом
              </Button>
            </CardActions>
          </Card>
        ))}
      </Masonry>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Пакет — {selectedSoft?.softname} (ID: {selectedSoft?.id})
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Загрузка данных...
            </Typography>
          ) : (
            selectedSoft && (
              <UsersTransferList
                leftData={selectedSoft.users_with_access}
                rightData={excludedUsers}
                setIsModified={setIsModified}
                onUpdateLeftUsers={handleUpdateLeftUsers}
              />
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Закрыть</Button>
          {isModified && (
            <Button onClick={handleSave} variant="contained" color="primary">
              Сохранить
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
