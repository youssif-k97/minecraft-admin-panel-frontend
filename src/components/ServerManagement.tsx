import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Tabs,
  Tab,
  InputLabel,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Metric types
interface CPUMetric {
  0: number; // timestamp in seconds
  1: string; // CPU value as string
}

interface DiskMetric {
  0: number; // timestamp in seconds
  1: string; // Disk value as string
}

interface NetworkMetric {
  0: number; // timestamp in seconds
  1: string; // Network value as string
}

// Formatted metric types
interface FormattedCPUMetric {
  time: string;
  usage: number;
  timestamp: number;
}

interface FormattedDiskMetric {
  time: string;
  value: number;
  timestamp: number;
}

interface FormattedNetworkMetric {
  time: string;
  value: number;
  timestamp: number;
}

interface TimeRange {
  label: string;
  minutes: number;
  step: number;
  windowSize: number;
}

// Metric type options
type MetricTab = "cpu" | "disk" | "network";
type DiskMetricType =
  | "iops.read"
  | "iops.write"
  | "bandwidth.read"
  | "bandwidth.write";
type NetworkMetricType =
  | "pps.in"
  | "pps.out"
  | "bandwidth.in"
  | "bandwidth.out";

const TIME_RANGES: { [key: string]: TimeRange } = {
  "5m": { label: "Past 5 minutes", minutes: 5, step: 5, windowSize: 60 },
  "30m": { label: "Past 30 minutes", minutes: 30, step: 10, windowSize: 180 },
  "1h": { label: "Past 1 hour", minutes: 60, step: 20, windowSize: 180 },
  "4h": { label: "Past 4 hours", minutes: 240, step: 60, windowSize: 240 },
  "1d": { label: "Past 1 day", minutes: 1440, step: 300, windowSize: 288 },
  "10d": { label: "Past 10 days", minutes: 14400, step: 3600, windowSize: 240 },
  "30d": {
    label: "Past 30 days",
    minutes: 43200,
    step: 10800,
    windowSize: 240,
  },
};

const DISK_METRIC_TYPES: {
  [key in DiskMetricType]: { label: string; unit: string };
} = {
  "iops.read": { label: "Read IOPS", unit: "iop/s" },
  "iops.write": { label: "Write IOPS", unit: "iop/s" },
  "bandwidth.read": { label: "Read Bandwidth", unit: "bytes/s" },
  "bandwidth.write": { label: "Write Bandwidth", unit: "bytes/s" },
};

const NETWORK_METRIC_TYPES: {
  [key in NetworkMetricType]: { label: string; unit: string };
} = {
  "pps.in": { label: "Packets In", unit: "packets/s" },
  "pps.out": { label: "Packets Out", unit: "packets/s" },
  "bandwidth.in": { label: "Bandwidth In", unit: "bytes/s" },
  "bandwidth.out": { label: "Bandwidth Out", unit: "bytes/s" },
};

export const ServerManagement = () => {
  // State for metrics data
  const [cpuMetrics, setCpuMetrics] = useState<FormattedCPUMetric[]>([]);
  const [diskMetrics, setDiskMetrics] = useState<FormattedDiskMetric[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<
    FormattedNetworkMetric[]
  >([]);

  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selectedRange, setSelectedRange] = useState<string>("30m");
  const [activeTab, setActiveTab] = useState<MetricTab>("cpu");
  const [diskMetricType, setDiskMetricType] =
    useState<DiskMetricType>("iops.read");
  const [networkMetricType, setNetworkMetricType] =
    useState<NetworkMetricType>("bandwidth.in");

  const SERVER_ID = import.meta.env.VITE_SERVER_ID;
  const HETZNER_API_KEY = import.meta.env.VITE_HETZNER_PROJECT_API_KEY;

  // Handle UI changes
  const handleRangeChange = (event: SelectChangeEvent) => {
    setSelectedRange(event.target.value);
    setCpuMetrics([]);
    setDiskMetrics([]);
    setNetworkMetrics([]);
  };

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: MetricTab
  ) => {
    setActiveTab(newValue);
  };

  const handleDiskMetricTypeChange = (event: SelectChangeEvent) => {
    setDiskMetricType(event.target.value as DiskMetricType);
    setDiskMetrics([]);
  };

  const handleNetworkMetricTypeChange = (event: SelectChangeEvent) => {
    setNetworkMetricType(event.target.value as NetworkMetricType);
    setNetworkMetrics([]);
  };

  const formatTimeLabel = (timestamp: number, range: TimeRange): string => {
    const date = new Date(timestamp);
    if (range.minutes > 1440) {
      // More than 1 day
      return `${
        date.getMonth() + 1
      }/${date.getDate()} ${date.getHours()}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
    } else if (range.minutes > 60) {
      // More than 1 hour
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    return `${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}:${String(date.getSeconds()).padStart(2, "0")}`;
  };

  // Format value based on unit
  const formatValue = (value: string, unit: string): number => {
    const numValue = parseFloat(value);

    // Convert bytes to more readable units if needed
    if (unit === "bytes/s" && numValue > 1024 * 1024) {
      return parseFloat((numValue / (1024 * 1024)).toFixed(2)); // Convert to MB/s
    }

    return parseFloat(numValue.toFixed(2));
  };

  // Get unit label based on metric type and value range
  const getUnitLabel = (metricType: string, unit: string): string => {
    if (unit === "bytes/s") {
      // For bandwidth metrics, show MB/s instead of bytes/s for readability
      return "MB/s";
    }
    return unit;
  };

  const fetchMetrics = async () => {
    try {
      // Only set loading on initial fetch for each tab
      if (
        (activeTab === "cpu" && cpuMetrics.length === 0) ||
        (activeTab === "disk" && diskMetrics.length === 0) ||
        (activeTab === "network" && networkMetrics.length === 0)
      ) {
        setLoading(true);
      }

      const range = TIME_RANGES[selectedRange];
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMinutes(startDate.getMinutes() - range.minutes);

      const startIso = startDate.toISOString();
      const endIso = endDate.toISOString();

      // Determine which metric type to fetch based on active tab
      let metricType: string;
      let specificMetric: string = "";

      switch (activeTab) {
        case "cpu":
          metricType = "cpu";
          break;
        case "disk":
          metricType = "disk";
          specificMetric = `disk.0.${diskMetricType}`;
          break;
        case "network":
          metricType = "network";
          specificMetric = `network.0.${networkMetricType}`;
          break;
        default:
          metricType = "cpu";
      }

      const response = await axios.get(
        `https://api.hetzner.cloud/v1/servers/${SERVER_ID}/metrics`,
        {
          headers: {
            Authorization: `Bearer ${HETZNER_API_KEY}`,
          },
          params: {
            type: metricType,
            start: startIso,
            end: endIso,
            step: range.step,
          },
        }
      );

      // Process the response based on active tab
      if (response.data?.metrics?.time_series) {
        const range = TIME_RANGES[selectedRange];

        switch (activeTab) {
          case "cpu":
            if (
              response.data.metrics.time_series.cpu?.values &&
              Array.isArray(response.data.metrics.time_series.cpu.values)
            ) {
              const cpuData = response.data.metrics.time_series.cpu.values;

              // Format the latest data point
              const latestMetric = cpuData[cpuData.length - 1];
              const formattedPoint = {
                time: formatTimeLabel(latestMetric[0] * 1000, range),
                timestamp: latestMetric[0] * 1000,
                usage: parseFloat(parseFloat(latestMetric[1]).toFixed(2)),
              };

              // Update metrics with sliding window
              setCpuMetrics((prevMetrics) => {
                // If we're just starting, fill the window with the initial data
                if (prevMetrics.length === 0) {
                  const initialData = cpuData
                    .slice(-range.windowSize)
                    .map((metric: CPUMetric) => ({
                      time: formatTimeLabel(metric[0] * 1000, range),
                      timestamp: metric[0] * 1000,
                      usage: parseFloat(parseFloat(metric[1]).toFixed(2)),
                    }));
                  return initialData;
                }

                // Add new point and remove oldest if we exceed window size
                const newMetrics = [...prevMetrics, formattedPoint];
                if (newMetrics.length > range.windowSize) {
                  return newMetrics.slice(-range.windowSize);
                }
                return newMetrics;
              });
            }
            break;

          case "disk":
            const diskKey = `disk.0.${diskMetricType}`;
            if (
              response.data.metrics.time_series[diskKey]?.values &&
              Array.isArray(response.data.metrics.time_series[diskKey].values)
            ) {
              const diskData =
                response.data.metrics.time_series[diskKey].values;
              const unit = DISK_METRIC_TYPES[diskMetricType].unit;

              // Format the latest data point
              const latestMetric = diskData[diskData.length - 1];
              const formattedPoint = {
                time: formatTimeLabel(latestMetric[0] * 1000, range),
                timestamp: latestMetric[0] * 1000,
                value: formatValue(latestMetric[1], unit),
              };

              // Update metrics with sliding window
              setDiskMetrics((prevMetrics) => {
                // If we're just starting, fill the window with the initial data
                if (prevMetrics.length === 0) {
                  const initialData = diskData
                    .slice(-range.windowSize)
                    .map((metric: DiskMetric) => ({
                      time: formatTimeLabel(metric[0] * 1000, range),
                      timestamp: metric[0] * 1000,
                      value: formatValue(metric[1], unit),
                    }));
                  return initialData;
                }

                // Add new point and remove oldest if we exceed window size
                const newMetrics = [...prevMetrics, formattedPoint];
                if (newMetrics.length > range.windowSize) {
                  return newMetrics.slice(-range.windowSize);
                }
                return newMetrics;
              });
            }
            break;

          case "network":
            const networkKey = `network.0.${networkMetricType}`;
            if (
              response.data.metrics.time_series[networkKey]?.values &&
              Array.isArray(
                response.data.metrics.time_series[networkKey].values
              )
            ) {
              const networkData =
                response.data.metrics.time_series[networkKey].values;
              const unit = NETWORK_METRIC_TYPES[networkMetricType].unit;

              // Format the latest data point
              const latestMetric = networkData[networkData.length - 1];
              const formattedPoint = {
                time: formatTimeLabel(latestMetric[0] * 1000, range),
                timestamp: latestMetric[0] * 1000,
                value: formatValue(latestMetric[1], unit),
              };

              // Update metrics with sliding window
              setNetworkMetrics((prevMetrics) => {
                // If we're just starting, fill the window with the initial data
                if (prevMetrics.length === 0) {
                  const initialData = networkData
                    .slice(-range.windowSize)
                    .map((metric: NetworkMetric) => ({
                      time: formatTimeLabel(metric[0] * 1000, range),
                      timestamp: metric[0] * 1000,
                      value: formatValue(metric[1], unit),
                    }));
                  return initialData;
                }

                // Add new point and remove oldest if we exceed window size
                const newMetrics = [...prevMetrics, formattedPoint];
                if (newMetrics.length > range.windowSize) {
                  return newMetrics.slice(-range.windowSize);
                }
                return newMetrics;
              });
            }
            break;
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(`Error fetching ${activeTab} metrics:`, err);
      setError(
        `Failed to fetch ${activeTab} metrics. Please check your API key and server ID.`
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const range = TIME_RANGES[selectedRange];
    const intervalId = setInterval(fetchMetrics, range.step * 1000);
    return () => clearInterval(intervalId);
  }, [selectedRange, activeTab, diskMetricType, networkMetricType]);

  // Get current metrics data based on active tab
  const getCurrentMetrics = () => {
    switch (activeTab) {
      case "cpu":
        return cpuMetrics;
      case "disk":
        return diskMetrics;
      case "network":
        return networkMetrics;
      default:
        return [];
    }
  };

  // Get current metric type label
  const getCurrentMetricLabel = () => {
    switch (activeTab) {
      case "cpu":
        return "CPU Usage (%)";
      case "disk":
        return DISK_METRIC_TYPES[diskMetricType].label;
      case "network":
        return NETWORK_METRIC_TYPES[networkMetricType].label;
      default:
        return "";
    }
  };

  // Get current unit label
  const getCurrentUnitLabel = () => {
    switch (activeTab) {
      case "cpu":
        return "%";
      case "disk":
        return getUnitLabel(
          diskMetricType,
          DISK_METRIC_TYPES[diskMetricType].unit
        );
      case "network":
        return getUnitLabel(
          networkMetricType,
          NETWORK_METRIC_TYPES[networkMetricType].unit
        );
      default:
        return "";
    }
  };

  // Get current data key for the chart
  const getCurrentDataKey = () => {
    return activeTab === "cpu" ? "usage" : "value";
  };

  return (
    <Box sx={{ p: 3, width: "100%" }}>
      <Typography variant="h4" gutterBottom sx={{ textShadow: "2px 2px #000" }}>
        Server Management
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": { color: "rgba(255, 255, 255, 0.7)" },
                "& .Mui-selected": { color: "white" },
                "& .MuiTabs-indicator": { backgroundColor: "white" },
              }}
            >
              <Tab label="CPU" value="cpu" />
              <Tab label="Disk" value="disk" />
              <Tab label="Network" value="network" />
            </Tabs>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5">{getCurrentMetricLabel()}</Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              {activeTab === "disk" && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={diskMetricType}
                    onChange={handleDiskMetricTypeChange}
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      color: "white",
                      "& .MuiSelect-icon": { color: "white" },
                    }}
                  >
                    {Object.entries(DISK_METRIC_TYPES).map(
                      ([key, { label }]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              )}

              {activeTab === "network" && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={networkMetricType}
                    onChange={handleNetworkMetricTypeChange}
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      color: "white",
                      "& .MuiSelect-icon": { color: "white" },
                    }}
                  >
                    {Object.entries(NETWORK_METRIC_TYPES).map(
                      ([key, { label }]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              )}

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={selectedRange}
                  onChange={handleRangeChange}
                  sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    color: "white",
                    "& .MuiSelect-icon": { color: "white" },
                  }}
                >
                  {Object.entries(TIME_RANGES).map(([key, range]) => (
                    <MenuItem key={key} value={key}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {loading && getCurrentMetrics().length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Box sx={{ height: 400, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getCurrentMetrics()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "white" }}
                    tickLine={{ stroke: "white" }}
                  />
                  <YAxis
                    tick={{ fill: "white" }}
                    tickLine={{ stroke: "white" }}
                    label={{
                      value: getCurrentUnitLabel(),
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "white" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid #444",
                      color: "white",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={getCurrentDataKey()}
                    name={getCurrentMetricLabel()}
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
