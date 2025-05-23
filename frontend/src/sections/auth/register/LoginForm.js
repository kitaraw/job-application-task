import * as Yup from "yup";
import React, { useState, useCallback } from "react";

// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

// hooks
import useAuth from "../../../hooks/useAuth";
// components
import { FormProvider, RHFTextField } from "../../../components/hook-form";
import { Stack, InputAdornment, Box } from "@mui/material";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import { Icon } from "@iconify/react";
import { LoadingButton } from "@mui/lab";

function Iconify({ icon, sx, style, ...other }) {
  return (
    <Box component={Icon} icon={icon} sx={{ ...sx, ...style }} {...other} />
  );
}

export default function LoginForm({ onLoginSuccess }) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required("Укажите username"),
    password: Yup.string().required("Укажите пароль"),
  });

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const {
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await login(data.username, data.password);

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error(error);

      methods.resetField("password");

      const errorMessage =
        error?.detail || error?.message || "Что-то пошло не так";
      setError("afterSubmit", { message: errorMessage });
    }
  };

  const toggleShowPassword = useCallback(() => {
    setShowPassword((show) => !show);
  }, []);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <RHFTextField name="username" label="Логин" autoComplete="username" />
        <RHFTextField
          name="password"
          label="Пароль"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={toggleShowPassword} edge="end">
                  <Iconify
                    icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      {!!errors.afterSubmit && (
        <Alert severity="error">{errors.afterSubmit.message}</Alert>
      )}
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="primary"
        loading={isSubmitting}
        sx={{ mt: 2 }}
      >
        Вход
      </LoadingButton>
    </FormProvider>
  );
}
