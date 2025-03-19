import React, { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Switch, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";

const initialEmployees = [
  { id: 1, name: "טל לוי", email: "TailL@yahoo.com", phone: "0542638900", role: "מנהל", active: true },
  { id: 2, name: "מרינה לנסקי", email: "marinazale1997@gmail.com", phone: "0546458380", role: "רופא", active: true },
  { id: 3, name: "מיכל אבידור", email: "MichalA.1998@gmail.com", phone: "0546458380", role: "מטפלת", active: false },
  { id: 4, name: "חלא מנצור", email: "HalaMansor@hotmail.com", phone: "0546458380", role: "מנהלת", active: true },
  { id: 5, name: "אליאב סמיר", email: "ewatson@yahoo.com", phone: "0546458380", role: "סייע", active: true },
  { id: 6, name: "אודיה כהן", email: "OdeyaCohen@gmail.com", phone: "0546458380", role: "מטפלת", active: false },
];

const EmployeeTable = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleToggleActive = (id) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, active: !emp.active } : emp))
    );
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEmployee(null);
  };

  const handleSave = () => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === selectedEmployee.id ? selectedEmployee : emp))
    );
    handleClose();
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם</TableCell>
              <TableCell>דוא"ל</TableCell>
              <TableCell>טלפון</TableCell>
              <TableCell>תפקיד</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>עריכה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>
                  <Switch
                    checked={employee.active}
                    onChange={() => handleToggleActive(employee.id)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleEdit(employee)}>
                    ערוך
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* דיאלוג עריכת עובד */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>עריכת עובד</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="שם"
            value={selectedEmployee?.name || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="דואל"
            value={selectedEmployee?.email || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="טלפון"
            value={selectedEmployee?.phone || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="תפקיד"
            value={selectedEmployee?.role || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, role: e.target.value })}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">ביטול</Button>
          <Button onClick={handleSave} color="primary">שמור</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmployeeTable;