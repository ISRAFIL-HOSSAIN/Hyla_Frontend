import React from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

const TransportTable = ({ transports }) => {
  return (
    <TableContainer>
      <Table sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow>
            <TableCell>IMO</TableCell>
            <TableCell>Transport Name</TableCell>
            <TableCell>Transport Type</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>SubCategory</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transports && transports.length > 0 ? (
            transports.map((transport) => (
              <TableRow hover key={transport._id}>
                <TableCell>{transport.imoNumber || "N/A"}</TableCell>
                <TableCell>{transport.transportName || "N/A"}</TableCell>
                <TableCell>{transport.transportType || "N/A"}</TableCell>
                <TableCell>{transport.transportCategory || "N/A"}</TableCell>
                <TableCell>{transport.transportSubCategory || "N/A"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No transports available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransportTable;
