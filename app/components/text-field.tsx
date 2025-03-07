import React from "react";
import {
  TextField as MuiTextField,
  InputAdornment,
  TextFieldProps as MuiTextFieldProps,
} from "@mui/material";
import { SxProps } from "@mui/system";
import theme from "./theme";

interface TextFieldProps extends Omit<MuiTextFieldProps, "InputProps"> {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  maxLength?: number;
  endAdornment?: React.ReactNode;
  error?: boolean;
  helperText?: string;
  sx?: SxProps;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  maxLength,
  endAdornment,
  error = false,
  helperText,
  sx,
  ...muiProps
}) => (
  <MuiTextField
    fullWidth
    margin="normal"
    size="small"
    label={label}
    variant="outlined"
    value={value}
    onChange={onChange}
    type={type}
    inputProps={{ maxLength }}
    InputLabelProps={{
      sx: { fontSize: "14px" }, // Đặt font-size cho label
    }}
    InputProps={{
      endAdornment: endAdornment && (
        <InputAdornment position="end">{endAdornment}</InputAdornment>
      ),
    }}
    error={error}
    helperText={helperText}
    sx={{
      "& .MuiOutlinedInput-input": {
        fontSize: "14px",
      },
      "& .MuiOutlinedInput-root:hover fieldset": {
        borderColor: theme.palette.primary.main,
      },
      "& .MuiOutlinedInput-root.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
      },
      "& label.Mui-focused": {
        color: theme.palette.primary.main,
      },
      ...sx,
    }}
    {...muiProps}
  />
);

export default TextField;
