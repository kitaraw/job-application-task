import React, { useState, useCallback, useEffect, useMemo } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Icon } from "@iconify/react";

import {
  Stack,
  InputAdornment,
  MenuItem,
  Alert,
  IconButton,
  Box,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import ClearIcon from "@mui/icons-material/Clear";

import {
  RHFTextField,
  RHFSelect,
  FormProvider,
} from "src/components/hook-form";
import { getRegistrationRoles } from "src/fetches/main";
import useAuth from "src/hooks/useAuth";

function Iconify({ icon, sx, style, ...other }) {
  return (
    <Box component={Icon} icon={icon} sx={{ ...sx, ...style }} {...other} />
  );
}

const RegisterForm = () => {
  const { register } = useAuth();
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");



  const RegisterSchema = Yup.object().shape({
    username: Yup.string().required("Необходимо ввести логин"),
    password: Yup.string().required("Необходимо ввести пароль"),
    role: Yup.string().required("Необходимо выбрать роль"),
  });

  const defaultValues = useMemo(
    () => ({
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "",
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    control,
    setError,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

    // Получение списка ролей и установка первой роли по умолчанию
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

  const onSubmit = useCallback(
    async (data) => {
      try {
        // Логика отправки данных
        console.log("Отправка данных:", data);
        await register(data);
      } catch (error) {
        if (error && typeof error === "object") {
          // Обходим все поля с ошибками
          Object.keys(error).forEach((field) => {
            const messages = error[field];
            if (Array.isArray(messages) && messages.length > 0) {
              // Устанавливаем первую ошибку для поля
              setError(field, {
                type: "server",
                message: messages.join(" "), 
              });
            }
          });

          // Общая ошибка, если ошибок по полям нет
          if (!Object.keys(error).length) {
            setError("afterSubmit", {
              message: "Произошла ошибка при регистрации. Попробуйте снова.",
            });
          }
        } else {
          // Общая ошибка на случай неизвестного формата
          setError("afterSubmit", {
            message: "Произошла неизвестная ошибка. Попробуйте снова.",
          });
        }
      }
    },
    [setError, register]
  );

  const clearField = useCallback(
    (fieldName) => {
      setValue(fieldName, defaultValues[fieldName]);
    },
    [setValue, defaultValues]
  );

  const handleFocus = (fieldName) => setFocusedField(fieldName);
  const handleBlur = () => setFocusedField("");

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <RHFTextField
            name="firstName"
            label="Имя"
            helperText="Не обязательно к заполнению"
            control={control}
            InputProps={{
              endAdornment: focusedField === "firstName" && (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      clearField("firstName");
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onFocus={() => handleFocus("firstName")}
            onBlur={handleBlur}
          />
          <RHFTextField
            name="lastName"
            label="Фамилия"
            control={control}
            helperText="Не обязательно к заполнению"
            InputProps={{
              endAdornment: focusedField === "lastName" && (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      clearField("lastName");
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onFocus={() => handleFocus("lastName")}
            onBlur={handleBlur}
          />
        </Stack>

        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}

        <RHFTextField
          name="username"
          label="Логин"
          control={control}
          autoComplete="username"
        />

        <RHFTextField
          name="password"
          label="Пароль"
          type={showPassword ? "text" : "password"}
          control={control}
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Iconify
                    icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFSelect name="role" label="Роль">
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.rolename}>
              {role.rolename}
            </MenuItem>
          ))}
        </RHFSelect>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          color="primary"
          loading={isSubmitting}
        >
          Зарегистрироваться
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
};

export default RegisterForm;
