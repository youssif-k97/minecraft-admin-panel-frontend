import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
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

interface CPUMetric {
  0: number; // timestamp in seconds
  1: string; // CPU value as string
}

interface FormattedCPUMetric {
  time: string;
  usage: number;
}

export const ServerManagement = () => {
  const [cpuMetrics, setCpuMetrics] = useState<FormattedCPUMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const SERVER_ID = import.meta.env.VITE_SERVER_ID;
  const HETZNER_API_KEY = import.meta.env.VITE_HETZNER_PROJECT_API_KEY;

  const fetchCPUMetrics = async () => {
    try {
      setLoading(true);

      // Calculate date range for the last 20 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 20);

      // Format dates in ISO 8601 format
      const startIso = startDate.toISOString();
      const endIso = endDate.toISOString();

      const response = await axios.get(
        `https://api.hetzner.cloud/v1/servers/${SERVER_ID}/metrics`,
        {
          headers: {
            Authorization: `Bearer ${HETZNER_API_KEY}`,
          },
          params: {
            type: "cpu",
            start: startIso,
            end: endIso,
          },
        }
      );

      if (
        response.data &&
        response.data.metrics &&
        response.data.metrics.time_series &&
        response.data.metrics.time_series.cpu
      ) {
        const cpuData = response.data.metrics.time_series.cpu.values;

        // Check if cpuData is an array before mapping
        if (Array.isArray(cpuData)) {
          // Format the data for the chart
          const formattedData = cpuData.map((metric: CPUMetric) => {
            // Convert timestamp from seconds to milliseconds for Date constructor
            const date = new Date(metric[0] * 1000);

            // Use the CPU value directly as it's already a percentage
            const cpuPercentage = parseFloat(metric[1]);

            return {
              time: `${
                date.getMonth() + 1
              }/${date.getDate()} ${date.getHours()}:${String(
                date.getMinutes()
              ).padStart(2, "0")}`,
              timestamp: metric[0] * 1000, // Store raw timestamp for sorting
              usage: parseFloat(cpuPercentage.toFixed(2)),
            };
          });

          // Sort by timestamp and reduce data points to make the graph more readable
          // Increase the number of data points to ~300 for higher resolution
          const sortedData = formattedData.sort(
            (a, b) => a.timestamp - b.timestamp
          );
          const dataLength = sortedData.length;
          // Reduce sampling rate to include more points (300 instead of 100)
          const samplingRate = Math.max(1, Math.floor(dataLength / 100));

          const sampledData = sortedData.filter(
            (_, index) => index % samplingRate === 0
          );
          setCpuMetrics(sampledData);
        } else {
          // If cpuData is not an array, log the structure and set an error
          console.error("CPU data is not an array:", cpuData);
          setError("CPU data format is unexpected. Check console for details.");
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching CPU metrics:", err);
      setError(
        "Failed to fetch CPU metrics. Please check your API key and server ID."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCPUMetrics();

    // Set up interval to fetch data every minute
    const intervalId = setInterval(fetchCPUMetrics, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Box sx={{ p: 3, width: "100%" }}>
      <Typography variant="h4" gutterBottom sx={{ textShadow: "2px 2px #000" }}>
        Server Management
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            CPU Usage
          </Typography>

          {loading && cpuMetrics.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Box sx={{ height: 400, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={cpuMetrics}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#fff" }}
                    interval={Math.floor(cpuMetrics.length / 10)}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    tick={{ fill: "#fff" }}
                    label={{
                      value: "CPU Usage (%)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#fff" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid #593B2C",
                      fontFamily: "Minecraft, sans-serif",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="usage"
                    name="CPU Usage (%)"
                    stroke="#3B8526"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
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
