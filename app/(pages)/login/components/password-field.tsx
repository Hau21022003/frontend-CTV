// import React, { useState } from 'react';
// import TextField from '@/app/components/text-field';
// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import InputAdornment from '@mui/material/InputAdornment';

// interface PasswordFieldProps {
//     label: string;
//     value: string;
//     onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
//     maxLength?: number;
//     error?: boolean;
//     helperText?: string;
//     sx?: any; 
//     fullWidth?: boolean;
// }

// const PasswordField: React.FC<PasswordFieldProps> = ({
//     label,
//     value,
//     onChange,
//     maxLength,
//     error,
//     helperText,
//     sx,
// }) => {
//     const [showPassword, setShowPassword] = useState(false);

//     const handleTogglePasswordVisibility = () => {
//         setShowPassword(prev => !prev);
//     };

//     return (
//         <TextField
//             label={label}
//             type={showPassword ? 'text' : 'password'}
//             value={value}
//             onChange={onChange}
//             maxLength={maxLength}
//             error={error}
//             helperText={helperText}
//             required
//             InputProps={{
//                 endAdornment: (
//                     <InputAdornment position="end">
//                         <span
//                             onClick={handleTogglePasswordVisibility}
//                             style={{ cursor: 'pointer' }}
//                             aria-label={showPassword ? 'Hide password' : 'Show password'}
//                         >
//                             {showPassword ? (
//                                 <VisibilityOff sx={{ fontSize: '20px' }} />
//                             ) : (
//                                 <Visibility sx={{ fontSize: '20px' }} />
//                             )}
//                         </span>
//                     </InputAdornment>
//                 ),
//             }}
//             sx={sx}
//         />
//     );
// };

// export default PasswordField;
import React, { useState } from 'react';
import TextField from '@/app/components/text-field';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import { Box, Typography } from '@mui/material';

interface PasswordFieldProps {
    label: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    maxLength?: number;
    error?: boolean;
    helperText?: string;
    sx?: any; 
    fullWidth?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
    label,
    value,
    onChange,
    maxLength,
    error,
    helperText,
    sx,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    // Kiểm tra điều kiện mật khẩu
    const hasLowerCase = /[a-z]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%&*]/.test(value);
    const isLengthValid = value.length >= 8;
    const passedConditions = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length >= 3;

    return (
        <Box sx={{ position: 'relative', width: '100%' }}>
            <TextField
                label={label}
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                error={error}
                helperText={helperText}
                required
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <span
                                onClick={handleTogglePasswordVisibility}
                                style={{ cursor: 'pointer' }}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <VisibilityOff sx={{ fontSize: '20px' }} />
                                ) : (
                                    <Visibility sx={{ fontSize: '20px' }} />
                                )}
                            </span>
                        </InputAdornment>
                    ),
                }}
                sx={sx}
            />

            {isFocused && value.length > 0 && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        mt: 1,
                        p: 2,
                        bgcolor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        zIndex: 10,
                    }}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Mật khẩu của bạn phải bao gồm:
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: isLengthValid ? '#4880FF' : '#888' }}
                    >
                        ✓ Ít nhất 8 ký tự
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: passedConditions ? '#4880FF' : '#888' }}
                    >
                        ✓ Ít nhất 3 trong số những điều sau đây
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ ml: 2, color: hasLowerCase ? '#4880FF' : '#888' }}
                    >
                        ✓ Chữ viết thường (a-z)
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ ml: 2, color: hasUpperCase ? '#4880FF' : '#888' }}
                    >
                        ✓ Chữ viết hoa (A-Z)
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ ml: 2, color: hasNumber ? '#4880FF' : '#888' }}
                    >
                        ✓ Số (0-9)
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ ml: 2, color: hasSpecialChar ? '#4880FF' : '#888' }}
                    >
                        ✓ Ký tự đặc biệt (!@#$%&*)
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default PasswordField;
