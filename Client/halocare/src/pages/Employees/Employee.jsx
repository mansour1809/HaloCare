import React, { useState } from "react";
import { Container, TextField, Button, MenuItem, Typography, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

const NewEmployeeForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: null,
    phone: "",
    address: "",
    role: "",
    startDate: null,
    employmentScope: "",
    email: ""
  });

  const employmentScopes = ["Full-time", "Part-time", "Hourly"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        קליטת עובד חדש
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField label="שם פרטי" name="firstName" fullWidth onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="שם משפחה" name="lastName" fullWidth onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <DatePicker label="תאריך לידה" value={formData.birthDate} onChange={(date) => handleDateChange("birthDate", date)} renderInput={(params) => <TextField {...params} fullWidth />} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="טלפון נייד" name="phone" fullWidth onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="כתובת" name="address" fullWidth onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="תפקיד" name="role" fullWidth onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <DatePicker label="תאריך תחילת עבודה" value={formData.startDate} onChange={(date) => handleDateChange("startDate", date)} renderInput={(params) => <TextField {...params} fullWidth />} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="היקף משרה" name="employmentScope" select fullWidth onChange={handleChange}>
              {employmentScopes.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField label="דואל ארגוני" name="email" fullWidth onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              שמירה
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default NewEmployeeForm;