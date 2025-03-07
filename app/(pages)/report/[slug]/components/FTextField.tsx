import React, { useEffect, useState, useRef } from "react";
import { TextField, TextFieldProps, InputAdornment } from "@mui/material";

interface FixedTextFieldProps extends Omit<TextFieldProps, "type"> {
  label: string;
  type: "number" | "slash" | "money";
  value?: string;
}

const FixedTextField: React.FC<FixedTextFieldProps> = ({
  label,
  type,
  onChange,
  value = "",
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || getDefaultValue(type));
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Hàm lấy giá trị mặc định dựa trên loại trường
  const getDefaultValue = (type: string) => {
    switch (type) {
      case "slash":
        return "0/0";
      case "money":
        return "0.0";
      default:
        return "0";
    }
  };

  // Cập nhật giá trị nội bộ khi prop value thay đổi
  useEffect(() => {
    setInternalValue(value || getDefaultValue(type));
  }, [type, value]);

  // Đặt con trỏ vào đầu số 0 khi focus vào ô slash
  const handleFocus = () => {
    if (type === "slash" && internalValue === "0/0" && inputRef.current) {
      // Đặt vị trí con trỏ vào trước số 0 đầu tiên
      inputRef.current.setSelectionRange(0, 1);
    }
  };

  const handleInternalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = event.target.value;

    if (type === "slash") {
      inputValue = inputValue.replace(/\s/g, "");
      const [beforeSlash, afterSlash] = inputValue.split("/");

      // Xóa số 0 đầu tiên khi người dùng bắt đầu nhập
      inputValue = `${beforeSlash === "0" ? "" : beforeSlash || "0"}/${afterSlash || "0"}`;

      if (/\D/.test(beforeSlash || "") || /\D/.test(afterSlash || "")) {
        setError(true);
        setHelperText("Dữ liệu nhập vào phải là số nguyên");
      } else {
        setError(false);
        setHelperText("");
      }
    } else if (type === "number") {
      if (/\D/.test(inputValue)) {
        setError(true);
        setHelperText("Dữ liệu nhập vào phải là số nguyên");
      } else {
        setError(false);
        setHelperText("");
      }
    } else if (type === "money") {
      inputValue = inputValue.replace(",", ".");
      if (!/^\d*\.?\d*$/.test(inputValue)) {
        setError(true);
        setHelperText("Dữ liệu nhập vào phải là số thập phân");
      } else {
        setError(false);
        setHelperText("");
      }
    }

    setInternalValue(inputValue);
    onChange?.({ ...event, target: { ...event.target, value: inputValue } });
  };

  return (
    <TextField
      label={label}
      value={internalValue}
      error={error}
      helperText={error ? helperText : ""}
      onChange={handleInternalChange}
      onFocus={handleFocus}
      inputRef={inputRef}
      InputProps={{
        endAdornment: type === "money" ? (
          <InputAdornment position="end">Triệu đồng</InputAdornment>
        ) : undefined,
      }}
      sx={{
        marginBottom: error ? "-8px" : "16px",
      }}
      {...props}
    />
  );
};

export default FixedTextField;
