import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { WorldList } from "./components/WorldList";
import { WorldManagement } from "./components/WorldManagement";
import { NavPanel } from "./components/NavPanel";
import "./styles/minecraft-theme.css";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3B8526", // Minecraft grass green
    },
    secondary: {
      main: "#977647", // Minecraft wood brown
    },
    error: {
      main: "#dc3545",
    },
    background: {
      default: "transparent",
      paper: "rgba(0, 0, 0, 0.8)",
    },
  },
  typography: {
    fontFamily: "Minecraft, sans-serif",
    h1: {
      textShadow: "2px 2px #000",
    },
    h2: {
      textShadow: "2px 2px #000",
    },
    h3: {
      textShadow: "2px 2px #000",
    },
    h4: {
      textShadow: "2px 2px #000",
    },
    h5: {
      textShadow: "2px 2px #000",
    },
    h6: {
      textShadow: "2px 2px #000",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          border: "3px solid #593B2C",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "Minecraft, sans-serif",
          textTransform: "none",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "Minecraft, sans-serif",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            position: "relative",
          }}
        >
          <NavPanel />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              marginLeft: "64px",
            }}
          >
            <Routes>
              <Route path="/" element={<WorldList />} />
              <Route path="/world/:worldId" element={<WorldManagement />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
