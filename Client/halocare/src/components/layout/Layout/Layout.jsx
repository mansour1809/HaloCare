import { Box } from "@mui/material";
import Navbar from "./Navbar"; // Import the navbar component
import Sidebar from "./Sidebar"; // Import the sidebar component

// eslint-disable-next-line react/prop-types
const Layout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Navbar at the top */}
      <Navbar />

      {/* Sidebar + Main Content */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box sx={{ flex: 1, p: 3, bgcolor: "#f9f9f9" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
