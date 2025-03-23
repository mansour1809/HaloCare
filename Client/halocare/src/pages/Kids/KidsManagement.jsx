import  { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const initialKids = [
  { id: 1, name: "דניאל לוי", parentPhone: "0524787890", age: 3 },
  { id: 2, name: "יואב עברי", parentPhone: "0524787890", age: 2.9 },
  { id: 3, name: "אילון מנור", parentPhone: "0524787890", age: 2.5 },
  { id: 4, name: "יהל אביקר", parentPhone: "0546458380", age: 1.8 },
];

const KidsManagement = () => {
  const [kids, setKids] = useState(initialKids);
  const [open, setOpen] = useState(false);
  const [selectedKid, setSelectedKid] = useState(null);



  const handleEdit = (kid) => {
    setSelectedKid(kid);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedKid(null);
  };

  const handleSave = () => {
    setKids(kids.map(k => k.id === selectedKid.id ? selectedKid : k));
    handleClose();
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>שם</TableCell>
            <TableCell>טלפון הורה</TableCell>
            <TableCell>גיל</TableCell>
            <TableCell>עריכה</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {kids.map((kid) => (
            <TableRow key={kid.id}>
              <TableCell>{kid.name}</TableCell>
              <TableCell>{kid.parentPhone}</TableCell>
              <TableCell>{kid.age}</TableCell>
              <TableCell>
                <Button variant="outlined" color="primary" onClick={() => handleEdit(kid)}>
                  ערוך
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* דיאלוג עריכה */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>עריכת ילד</DialogTitle>
        <DialogContent>
          <TextField
            label="שם"
            fullWidth
            value={selectedKid?.name || ""}
            onChange={(e) => setSelectedKid({ ...selectedKid, name: e.target.value })}
          />
          <TextField
            label="טלפון הורה"
            fullWidth
            value={selectedKid?.parentPhone || ""}
            onChange={(e) => setSelectedKid({ ...selectedKid, parentPhone: e.target.value })}
          />
          <TextField
            label="גיל"
            fullWidth
            type="number"
            value={selectedKid?.age || ""}
            onChange={(e) => setSelectedKid({ ...selectedKid, age: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ביטול</Button>
          <Button onClick={handleSave} color="primary">שמירה</Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default KidsManagement;