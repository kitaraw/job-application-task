import React, { useMemo, useEffect, useState,useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  MenuItem,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import {
  RHFTextField,
  FormProvider,
  RHFSelect,
} from "src/components/hook-form";
import { getRegistrationRoles, createUser } from "src/fetches/main";
import { LoadingButton } from "@mui/lab";

export default function AddUserDialog({ open, onClose, onCreate }) {
  const [roles, setRoles] = useState([]);



  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Необходимо указать логин"),
    first_name: Yup.string().required("Необходимо указать имя"),
    email: Yup.string().email("Некорректный email"),
    role: Yup.string().required("Необходимо выбрать роль"),
  });

  // Значения по умолчанию
  const defaultValues = useMemo(
    () => ({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      role: "",
    }),
    []
  );

  // Настройка useForm
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const {
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const getRolesInfo = useCallback(async () => {
    try {
      const response = await getRegistrationRoles();
      setRoles(response);
      methods.setValue(
        "role",
        response[0]?.rolename || "Роли не добавлены администратором"
      );
    } catch (error) {
      console.error("Ошибка получения ролей", error);
    }
  }, [methods]);

  useEffect(() => {
    getRolesInfo();
  }, [getRolesInfo]);
  
  // Обработка отправки формы
  const onSubmit = async (data) => {
    try {
      const response = await createUser(data);
      await onCreate(response); // Передача данных для создания пользователя
      methods.reset({
        ...defaultValues,
        role: roles[0]?.rolename || "", // Устанавливаем роль на первую или пустую строку
      });
      onClose();
    } catch (error) {
      if (error && typeof error === "object") {
        // Обходим все поля с ошибками
        Object.keys(error).forEach((field) => {
          const messages = error[field];
          if (Array.isArray(messages) && messages.length > 0) {
            setError(field, {
              type: "server",
              message: messages.join(" "),
            });
          }
        });

        if (!Object.keys(error).length) {
          setError("afterSubmit", {
            message:
              "Произошла ошибка при добавлении пользователя. Попробуйте снова.",
          });
        }
      } else {
        setError("afterSubmit", {
          message: "Произошла неизвестная ошибка. Попробуйте снова.",
        });
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Добавить нового пользователя</DialogTitle>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2}>
            <RHFTextField
              name="username"
              label="Логин"
              fullWidth
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            <RHFTextField
              name="first_name"
              label="Имя"
              fullWidth
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
            />
            <RHFTextField
              name="last_name"
              label="Фамилия"
              fullWidth
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
            <RHFTextField
              name="email"
              label="Email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <RHFSelect name="role" label="Роль">
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.rolename}>
                  {role.rolename}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" disabled={isSubmitting}>
            Отмена
          </Button>
          <LoadingButton
            type="submit"
            color="primary"
            variant="contained"
            disabled={isSubmitting}
          >
            Создать
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
