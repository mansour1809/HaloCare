import React, { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from "@mui/material";
import dayjs from "dayjs";

const initialData = [
  { id: 1, name: "שי", attendance: {} },
  { id: 2, name: "מעיין", attendance: {} },
  { id: 3, name: "יותם", attendance: {} },
  { id: 4, name: "יובל", attendance: {} },
  { id: 5, name: "יאיר", attendance: {} },
  { id: 6, name: "ליאור", attendance: {} },
];

const daysRange = 7;
const today = dayjs().format("YYYY-MM-DD");
const pastDays = Array.from({ length: daysRange }, (_, i) => dayjs().subtract(i, "day").format("YYYY-MM-DD")).reverse();

const AttendanceTable = () => {
  const [data, setData] = useState(initialData);

  const handleAttendanceChange = (childId, date) => {
    setData((prevData) =>
      prevData.map((child) =>
        child.id === childId
          ? {
              ...child,
              attendance: {
                ...child.attendance,
                [date]: !child.attendance[date],
              },
            }
          : child
      )
    );
  };

  return (
    <TableContainer component={Paper} style={{direction : "rtl"  }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>שם ילד</TableCell>
            {pastDays.map((date) => (
              <TableCell key={date} align="center">{dayjs(date).format("DD/MM")}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((child) => (
            <TableRow key={child.id}>
              <TableCell>{child.name}</TableCell>
              {pastDays.map((date) => (
                <TableCell key={date} align="center">
                  <Checkbox
                    checked={!!child.attendance[date]}
                    onChange={() => handleAttendanceChange(child.id, date)}
                    disabled={date !== today}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AttendanceTable;
