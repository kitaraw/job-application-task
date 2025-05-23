import PropTypes from 'prop-types'
// form

// @mui
import { useFormContext, Controller } from 'react-hook-form'
// ----------------------------------------------------------------------
import { TextField } from '@mui/material'
RHFSelect.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string,
}

export default function RHFSelect({ name, children, ...other }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          select
          fullWidth
          SelectProps={{ native: false }}
          error={!!error}
          helperText={error?.message}
          {...other}
        >
          {children}
        </TextField>
      )}
    />
  )
}
