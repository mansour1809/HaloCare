import { useState } from "react";
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
  Typography,
  Grid,
  Card,
  CardContent
} from "@mui/material";

const initialKids = [
  { id: 1, name: "דניאל לוי", parentPhone: "0524787890", age: 3, className: "כיתה 1" },
  { id: 2, name: "יואב עברי", parentPhone: "0524787890", age: 2.9, className: "כיתה 1" },
  { id: 3, name: "אילון מנור", parentPhone: "0524787890", age: 2.5, className: "כיתה 2" },
  { id: 4, name: "יהל אביקר", parentPhone: "0546458380", age: 1.8, className: "כיתה 2" },
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

  // חלוקה לכיתות
  const classA = kids.filter(kid => kid.className === "כיתה 1");
  const classB = kids.filter(kid => kid.className === "כיתה 2");

  return (
    <Grid container spacing={3} justifyContent="center" style={{ padding: 20, direction : "rtl"  }}>
      {/* כיתה א */}
      <Grid item xs={12} md={6}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" align="center" gutterBottom>
              כיתה 1
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
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
                  {classA.map((kid) => (
                    <TableRow key={kid.id}>
                      <TableCell>{kid.name}</TableCell>
                      <TableCell>{kid.parentPhone}</TableCell>
                      <TableCell>{kid.age}</TableCell>
                      <TableCell>
                        <Button variant="contained" color="primary" onClick={() => handleEdit(kid)}>
                          ערוך
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* כיתה ב */}
      <Grid item xs={12} md={6}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" align="center" gutterBottom>
              כיתה 2
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
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
                  {classB.map((kid) => (
                    <TableRow key={kid.id}>
                      <TableCell>{kid.name}</TableCell>
                      <TableCell>{kid.parentPhone}</TableCell>
                      <TableCell>{kid.age}</TableCell>
                      <TableCell>
                        <Button variant="contained" color="primary" onClick={() => handleEdit(kid)}>
                          ערוך
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

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
    </Grid>
  );
};

export default KidsManagement;
