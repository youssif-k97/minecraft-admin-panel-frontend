import { Box } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const TabPanel: React.FC<TabPanelProps> = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
      style={{
        height: "80vh",
        position: "relative",
        width: "100%",
      }}
    >
      {value === index && (
        <Box
          sx={{
            p: 3,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            overflowX: "hidden",
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
};
