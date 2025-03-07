import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import theme from "@/app/components/theme";
export default function SelectFrame() {
    return (
        <>
            <div className="flex gap-3">
                <FormControl fullWidth margin="normal">
                    <InputLabel htmlFor="organization"
                        size="small"
                        sx={{
                            '&.Mui-focused': {
                                color: theme.palette.primary.main,
                            },
                        }}
                    >
                        Thành phố/Tỉnh thành</InputLabel>
                    <Select
                        id="departments"
                        label="Đơn vị"
                        size="small"
                        sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                            },
                        }}
                    >
                        {/* {departments.map((dept: Department) => (
                                            <MenuItem key={dept.id} value={dept.name} id={`menu-item-${dept.id}`}>
                                                {dept.name}
                                            </MenuItem>
                                        ))} */}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel htmlFor="organization"
                        size="small"
                        sx={{
                            '&.Mui-focused': {
                                color: theme.palette.primary.main,
                            },
                        }}
                    >
                        Đơn vị bậc 1</InputLabel>
                    <Select
                        id="departments"
                        label="Đơn vị"
                        size="small"
                        sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                            },
                        }}
                    >
                        {/* {departments.map((dept: Department) => (
                                            <MenuItem key={dept.id} value={dept.name} id={`menu-item-${dept.id}`}>
                                                {dept.name}
                                            </MenuItem>
                                        ))} */}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel htmlFor="organization"
                        size="small"
                        sx={{
                            '&.Mui-focused': {
                                color: theme.palette.primary.main,
                            },
                        }}
                    >
                        Đơn vị bậc 2</InputLabel>
                    <Select
                        id="departments"
                        label="Đơn vị"
                        size="small"
                        sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                            },
                        }}
                    >
                        {/* {departments.map((dept: Department) => (
                                            <MenuItem key={dept.id} value={dept.name} id={`menu-item-${dept.id}`}>
                                                {dept.name}
                                            </MenuItem>
                                        ))} */}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel htmlFor="organization"
                        size="small"
                        sx={{
                            '&.Mui-focused': {
                                color: theme.palette.primary.main,
                            },
                        }}
                    >
                        Đơn vị bậc 3</InputLabel>
                    <Select
                        id="departments"
                        label="Đơn vị"
                        size="small"
                        sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                            },
                        }}
                    >
                        {/* {departments.map((dept: Department) => (
                                            <MenuItem key={dept.id} value={dept.name} id={`menu-item-${dept.id}`}>
                                                {dept.name}
                                            </MenuItem>
                                        ))} */}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel htmlFor="organization"
                        size="small"
                        sx={{
                            '&.Mui-focused': {
                                color: theme.palette.primary.main,
                            },
                        }}
                    >
                        Đơn vị bậc 4</InputLabel>
                    <Select
                        id="departments"
                        label="Đơn vị"
                        size="small"
                        sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                            },
                        }}
                    >
                        {/* {departments.map((dept: Department) => (
                                            <MenuItem key={dept.id} value={dept.name} id={`menu-item-${dept.id}`}>
                                                {dept.name}
                                            </MenuItem>
                                        ))} */}
                    </Select>
                </FormControl>
            </div>
        </>
    )
}