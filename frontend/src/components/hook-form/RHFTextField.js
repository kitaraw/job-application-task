import PropTypes from 'prop-types'
// form

// @mui

// ----------------------------------------------------------------------
import { useFormContext, Controller } from 'react-hook-form'
import { TextField } from '@mui/material'

RHFTextField.propTypes = {
  name: PropTypes.string,
  multiline: PropTypes.bool,

    disabled: PropTypes.bool,
    maxLength: PropTypes.number,
}

export default function RHFTextField({ name, disabled = false, multiline = false, maxLength, helperText: customHelperText, ...other }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}

      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          multiline={multiline}
          error={!!error}
          helperText={error ? error.message : customHelperText}
          value={field.value || ''}

          inputProps={{ maxLength }}

  
            disabled={disabled}
          {...other}
        />
      )}
    />
  )
}
