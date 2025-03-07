// ReportSection.tsx
"use client";
import React from "react";
import { Grid, Typography } from "@mui/material";
import FixedTextField from "./FTextField";
import { fieldConfigurations } from "./variable";

interface ReportSectionProps {
  title: string;
  fields: string[];
  state: any;
  handleChange: (
    field: string
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  disable?: boolean;
}

const ReportSection: React.FC<ReportSectionProps> = ({
  title,
  fields,
  state,
  handleChange,
  disable=false,
}) => {
  return (
    <>
      <Typography
        variant="body1"
        fontWeight={700}
        gutterBottom
        sx={{ mt: 4, mb: 2 }}
      >
        {title}
      </Typography>
      <Grid container spacing={3}>
        {fields.map((fieldKey) => {
          const config =
            fieldConfigurations[fieldKey as keyof typeof fieldConfigurations];

          if (!config) {
            console.error(`Field configuration for "${fieldKey}" not found.`);
            return null;
          }

          // Define default values based on type
          const fieldValue =
            config.type === "money"
              ? state[fieldKey]?.toString().replace(".", ",") || "0.0"
              : config.type === "slash"
              ? state[fieldKey] || "0/0"
              : state[fieldKey]?.toString() || "0";

          return (
            <Grid
              key={fieldKey}
              item
              xs={4}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FixedTextField
                label={config.label}
                value={fieldValue}
                onChange={handleChange(fieldKey)}
                type={config.type as "number" | "money" | "slash"}
                variant="outlined"
                fullWidth
                size="small"
                disabled={disable}
              />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default ReportSection;
