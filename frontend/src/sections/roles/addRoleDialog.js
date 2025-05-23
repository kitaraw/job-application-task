import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Switch,
  Typography,
  Alert,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import React, { useState, useEffect, useCallback } from "react";
import { getPermissions, addPermissions } from "src/fetches/main";
import { FormProvider, RHFTextField } from "src/components/hook-form";

// ----------------------------------------------------------------------
const RoleSchema = Yup.object().shape({
  rolename: Yup.string().required("Название роли обязательно"),
});

const AddRoleDialog = ({ open, onClose, onSave }) => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await getPermissions();

        const formattedPermissions = response.permissions.map((perm) => ({
          permission: perm.permission,
          description: perm.description,
          allowed: false, // Изначально все разрешения выключены
        }));
        setPermissions(formattedPermissions);
      } catch (error) {
        console.error("Ошибка при загрузке разрешений:", error);
      }
    };

    fetchPermissions();
  }, []);

  const methods = useForm({
    resolver: yupResolver(RoleSchema),
    defaultValues: {
      rolename: "",
    },
  });

  const {
    control,
    setError,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  // Обработчик переключателей
  const handlePermissionChange = (permission) => {
    setPermissions((prevPermissions) =>
      prevPermissions.map((perm) =>
        perm.permission === permission
          ? { ...perm, allowed: !perm.allowed }
          : perm
      )
    );
  };

  const onSubmit = useCallback(
    async (data) => {
      try {
        const formattedData = {
          rolename: data.rolename,
          permissions: permissions.map(({ permission, allowed }) => ({
            permission,
            allowed,
          })),
        };

        console.log("Отправляем данные:", formattedData);

        const response = await addPermissions(formattedData);

        handleSave(response);
      } catch (error) {
        console.error("Ошибка при отправке данных:", error);

        if (error && typeof error === "object") {
          if (error.rolename) {
            // Обрабатываем ошибки для `rolename`
            setError("rolename", {
              type: "server",
              message: error.rolename.join(" "),
            });
          }

          if (!error.rolename) {
            setError("afterSubmit", {
              type: "server",
              message:
                "Произошла ошибка при добавлении роли. Попробуйте снова.",
            });
          }
        } else {
          setError("afterSubmit", {
            type: "server",
            message: "Произошла неизвестная ошибка. Попробуйте снова.",
          });
        }
      }
    },
    // eslint-disable-next-line
    [setError, permissions]
  );

  const handleSave = (data) => {
    onSave(data);
    setValue("rolename", "");

    setPermissions((prevPermissions) =>
      prevPermissions.map((perm) => ({ ...perm, allowed: false }))
    );
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Добавить новую роль</DialogTitle>
        <DialogContent>
          <RHFTextField
            fullWidth
            name="rolename"
            margin="dense"
            control={control}
            label="Название роли"
            sx={{ my: 2 }}
          />
          <List>
            {permissions.map((perm) => (
              <ListItem
                key={perm.permission}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2">{perm.description}</Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {perm.permission}
                    </Typography>
                  }
                />
                <Switch
                  checked={perm.allowed}
                  onChange={() => handlePermissionChange(perm.permission)}
                />
              </ListItem>
            ))}
          </List>
          {!!errors.afterSubmit && (
            <Alert severity="error">{errors.afterSubmit.message}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Отмена
          </Button>
          <LoadingButton
            type="submit"
            color="primary"
            variant="contained"
            loading={isSubmitting}
          >
            Сохранить
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default AddRoleDialog;
