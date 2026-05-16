"use client"

import { useState, useEffect } from "react"
import {
  Sun,
  Thermometer,
  Droplets,
  Zap,
  Gauge,
  Wind,
  Bot,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Play,
  Pause,
  Eye,
  Radar,
  Server,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Wrench,
  Users,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Types
interface SensorData {
  temperature: number
  humidity: number
  voltage: number
  current: number
  power_output: number
  efficiency: number
  dust_level: number
  robot_front_cm: number
  robot_back_cm: number
  robot_cleaning: boolean
  ir_left: boolean
  ir_right: boolean
  servo_active: boolean
}

interface TimeSeriesPoint {
  time: string
  value: number
}

interface ActivityLog {
  id: number
  timestamp: string
  action: string
  status: "info" | "success" | "warning" | "error"
}

// Generate mock time series data
const generateTimeSeriesData = (baseValue: number, variance: number, points: number): TimeSeriesPoint[] => {
  const now = new Date()
  return Array.from({ length: points }, (_, i) => {
    const time = new Date(now.getTime() - (points - 1 - i) * 60000)
    return {
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      value: Math.max(0, baseValue + (Math.random() - 0.5) * variance),
    }
  })
}

// Status Indicator Component
function StatusIndicator({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 rounded-full ${active ? "bg-primary animate-pulse-glow" : "bg-muted-foreground/30"}`} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

// Metric Card Component
function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  status = "normal",
}: {
  title: string
  value: number | string
  unit: string
  icon: React.ElementType
  trend?: "up" | "down"
  status?: "normal" | "warning" | "critical"
}) {
  const statusColors = {
    normal: "border-border",
    warning: "border-accent",
    critical: "border-destructive",
  }

  return (
    <Card className={`relative overflow-hidden border ${statusColors[status]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{typeof value === "number" ? value.toFixed(1) : value}</span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${status === "critical" ? "bg-destructive/10" : status === "warning" ? "bg-accent/10" : "bg-primary/10"}`}>
            <Icon className={`h-5 w-5 ${status === "critical" ? "text-destructive" : status === "warning" ? "text-accent" : "text-primary"}`} />
          </div>
        </div>
        {trend && (
          <div className={`mt-2 flex items-center gap-1 text-xs ${trend === "up" ? "text-primary" : "text-destructive"}`}>
            {trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{trend === "up" ? "+2.5%" : "-1.2%"}</span>
          </div>
        )}
      </CardContent>
      {status !== "normal" && (
        <div className={`absolute top-0 right-0 h-1 w-full ${status === "critical" ? "bg-destructive" : "bg-accent"}`} />
      )}
    </Card>
  )
}

// Robot Status Card
function RobotStatusCard({ data }: { data: SensorData }) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-5 w-5 text-primary" />
          Robot Monitoring
          <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${data.robot_cleaning ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
            {data.robot_cleaning ? "Cleaning" : "Standby"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Front Sensor</p>
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-info" />
              <span className="text-lg font-semibold">{data.robot_front_cm} cm</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Back Sensor</p>
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-info" />
              <span className="text-lg font-semibold">{data.robot_back_cm} cm</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatusIndicator active={data.ir_left} label="IR Left" />
          <StatusIndicator active={data.ir_right} label="IR Right" />
          <StatusIndicator active={data.servo_active} label="Servo Active" />
          <StatusIndicator active={data.robot_cleaning} label="Cleaning Mode" />
        </div>
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cleaning Validation</span>
            <span className={`flex items-center gap-1 ${data.robot_cleaning ? "text-primary" : "text-muted-foreground"}`}>
              {data.robot_cleaning ? <CheckCircle2 className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {data.robot_cleaning ? "Active" : "Idle"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Chart Card Component
function ChartCard({
  title,
  data,
  color,
  unit,
}: {
  title: string
  data: TimeSeriesPoint[]
  color: string
  unit: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value.toFixed(1)} ${unit}`, title]}
            />
            <Area type="monotone" dataKey="value" stroke={color} fill={`url(#gradient-${title})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Alert Card Component
function AlertCard({ alerts }: { alerts: { type: string; message: string; severity: "warning" | "error" | "info" }[] }) {
  const severityStyles = {
    warning: "bg-accent/10 border-accent/30 text-accent",
    error: "bg-destructive/10 border-destructive/30 text-destructive",
    info: "bg-info/10 border-info/30 text-info",
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-accent" />
          Cleaning Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length > 0 ? (
          alerts.map((alert, i) => (
            <div key={i} className={`p-3 rounded-lg border text-sm ${severityStyles[alert.severity]}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{alert.message}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm text-primary">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>All systems operating normally</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// MQTT Status Card
function MQTTStatusCard({ connected, lastUpdate }: { connected: boolean; lastUpdate: Date }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Server className="h-5 w-5 text-info" />
          AWS IoT Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connection</span>
          <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${connected ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {connected ? "Connected" : "Disconnected"}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">MQTT Activity</span>
          <div className="flex items-center gap-2 text-xs text-primary">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>Publishing</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Last Update</span>
          <span className="text-xs font-mono text-muted-foreground">
            {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// Activity Timeline Component
function ActivityTimeline({ logs }: { logs: ActivityLog[] }) {
  const statusStyles = {
    info: "bg-info/20 text-info",
    success: "bg-primary/20 text-primary",
    warning: "bg-accent/20 text-accent",
    error: "bg-destructive/20 text-destructive",
  }

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-primary" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 animate-slide-up">
              <div className={`mt-0.5 p-1.5 rounded-full ${statusStyles[log.status]}`}>
                {log.status === "success" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : log.status === "warning" ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : log.status === "error" ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <Activity className="h-3 w-3" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{log.action}</p>
                <p className="text-xs text-muted-foreground">{log.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// KPI Summary Card
function KPISummary({
  totalCycles,
  avgEfficiency,
  panelState,
  robotActive,
}: {
  totalCycles: number
  avgEfficiency: number
  panelState: string
  robotActive: boolean
}) {
  return (
    <Card className="col-span-full">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Cleaning Cycles</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalCycles}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Efficiency</p>
            <p className="text-2xl font-bold text-primary mt-1">{avgEfficiency.toFixed(1)}%</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Panel State</p>
            <p className="text-2xl font-bold text-foreground mt-1">{panelState}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Robot Status</p>
            <p className={`text-2xl font-bold mt-1 ${robotActive ? "text-primary" : "text-muted-foreground"}`}>
              {robotActive ? "Active" : "Standby"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Progress Bar Component
function ProgressBar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// CloudWatch Servo Status Widget
function ServoStatusWidget({ active, position }: { active: boolean; position: number }) {
  return (
    <Card className="relative overflow-hidden border-primary/30">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wrench className="h-5 w-5 text-primary" />
          Servo Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <span className="text-sm text-muted-foreground">Status</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${active ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
            <div className={`h-2 w-2 rounded-full ${active ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
            {active ? "Active" : "Idle"}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Position</span>
            <span className="font-mono font-medium text-foreground">{position.toFixed(1)}°</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(position / 180) * 100}%` }}
            />
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Servo Response Time: 45ms
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// CloudWatch Cleaning Validation Widget
function CleaningValidationWidget({ validating, confidence }: { validating: boolean; confidence: number }) {
  return (
    <Card className="relative overflow-hidden border-primary/30">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-5 w-5 text-primary" />
          Cleaning Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <span className="text-sm text-muted-foreground">Mode</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${validating ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
            <div className={`h-2 w-2 rounded-full ${validating ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
            {validating ? "Validating" : "Standby"}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Confidence Level</span>
            <span className="font-mono font-medium text-foreground">{confidence.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ 
                width: `${confidence}%`,
                backgroundColor: confidence >= 85 ? '#72b849' : confidence >= 60 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            {confidence >= 85 ? "Clean Detection Active" : "Low Confidence"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// CloudWatch Active Robots Widget
function ActiveRobotsWidget({ activeCount, totalCount, status }: { activeCount: number; totalCount: number; status: string }) {
  return (
    <Card className="relative overflow-hidden border-primary/30">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-5 w-5 text-primary" />
          Robots Active
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Active</p>
            <p className="text-3xl font-bold text-primary mt-1">{activeCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
            <p className="text-3xl font-bold text-foreground mt-1">{totalCount}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Fleet Utilization</span>
            <span className="font-mono font-medium text-foreground">{((activeCount / totalCount) * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(activeCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3 animate-pulse text-primary" />
            Status: {status}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// CloudWatch Cleaning Alerts Widget (Enhanced)
function CleaningAlertsWidget({ alerts, totalAlerts }: { alerts: { type: string; message: string; severity: "warning" | "error" | "info" }[]; totalAlerts: number }) {
  const severityStyles = {
    warning: "bg-accent/10 border-accent/30 text-accent",
    error: "bg-destructive/10 border-destructive/30 text-destructive",
    info: "bg-info/10 border-info/30 text-info",
  }

  const severityIcons = {
    warning: AlertTriangle,
    error: AlertCircle,
    info: Activity,
  }

  return (
    <Card className="col-span-full relative overflow-hidden border-accent/30">
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Cleaning Alerts
          </CardTitle>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-accent/20 text-accent">
            {totalAlerts} Total
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              const IconComponent = severityIcons[alert.severity]
              return (
                <div key={i} className={`p-3 rounded-lg border text-sm flex items-start gap-3 ${severityStyles[alert.severity]}`}>
                  <IconComponent className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs opacity-75 mt-0.5">{alert.type.toUpperCase()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <span>All systems operating normally</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Main Dashboard Component
export default function SolarDashboard() {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 30,
    humidity: 55,
    voltage: 16.5,
    current: 8,
    power_output: 132,
    efficiency: 66,
    dust_level: 100,
    robot_front_cm: 80,
    robot_back_cm: 32,
    robot_cleaning: true,
    ir_left: true,
    ir_right: false,
    servo_active: true,
  })

  const [dustHistory, setDustHistory] = useState<TimeSeriesPoint[]>(() => generateTimeSeriesData(70, 40, 12))
  const [powerHistory, setPowerHistory] = useState<TimeSeriesPoint[]>(() => generateTimeSeriesData(130, 30, 12))
  const [efficiencyHistory, setEfficiencyHistory] = useState<TimeSeriesPoint[]>(() => generateTimeSeriesData(65, 15, 12))
  const [voltageHistory, setVoltageHistory] = useState<TimeSeriesPoint[]>(() => generateTimeSeriesData(16, 2, 12))

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: 1, timestamp: "10:45:23", action: "Cleaning Sequence Complete", status: "success" },
    { id: 2, timestamp: "10:44:15", action: "Returning to Base", status: "info" },
    { id: 3, timestamp: "10:42:08", action: "Servo Sweeping", status: "info" },
    { id: 4, timestamp: "10:40:32", action: "Moving Forward", status: "info" },
    { id: 5, timestamp: "10:39:45", action: "START_CLEANING", status: "success" },
    { id: 6, timestamp: "10:38:20", action: "Dust Threshold Exceeded", status: "warning" },
  ])

  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isConnected] = useState(true)
  const [servoPosition, setServoPosition] = useState(90)
  const [cleaningConfidence, setCleaningConfidence] = useState(85)
  const [activeRobots, setActiveRobots] = useState(1)
  const [totalRobots] = useState(4)
  const [totalAlerts, setTotalAlerts] = useState(0)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData((prev) => ({
        ...prev,
        temperature: 28 + Math.random() * 8,
        humidity: 50 + Math.random() * 15,
        voltage: 15 + Math.random() * 3,
        current: 7 + Math.random() * 3,
        power_output: 120 + Math.random() * 30,
        efficiency: 60 + Math.random() * 15,
        dust_level: Math.max(0, prev.dust_level + (Math.random() - 0.6) * 10),
        robot_front_cm: 60 + Math.random() * 40,
        robot_back_cm: 20 + Math.random() * 30,
        ir_left: Math.random() > 0.3,
        ir_right: Math.random() > 0.3,
        servo_active: prev.robot_cleaning,
      }))

      setServoPosition((prev) => {
        const newPosition = prev + (Math.random() - 0.5) * 20
        return Math.max(0, Math.min(180, newPosition))
      })

      setCleaningConfidence((prev) => {
        const newConfidence = prev + (Math.random() - 0.5) * 15
        return Math.max(0, Math.min(100, newConfidence))
      })

      setDustHistory((prev) => {
        const newData = [...prev.slice(1)]
        const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        newData.push({ time, value: Math.max(0, 70 + (Math.random() - 0.5) * 40) })
        return newData
      })

      setPowerHistory((prev) => {
        const newData = [...prev.slice(1)]
        const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        newData.push({ time, value: 120 + Math.random() * 30 })
        return newData
      })

      setEfficiencyHistory((prev) => {
        const newData = [...prev.slice(1)]
        const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        newData.push({ time, value: 60 + Math.random() * 15 })
        return newData
      })

      setVoltageHistory((prev) => {
        const newData = [...prev.slice(1)]
        const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        newData.push({ time, value: 15 + Math.random() * 3 })
        return newData
      })

      setLastUpdate(new Date())
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Generate alerts based on sensor data
  const alerts = []
  if (sensorData.dust_level > 80) {
    alerts.push({ type: "dust", message: `High dust level detected: ${sensorData.dust_level.toFixed(0)}%`, severity: "warning" as const })
  }
  if (sensorData.robot_cleaning) {
    alerts.push({ type: "robot", message: "Cleaning robot is currently active", severity: "info" as const })
  }
  if (sensorData.temperature > 35) {
    alerts.push({ type: "temp", message: `High temperature warning: ${sensorData.temperature.toFixed(1)}°C`, severity: "warning" as const })
  }
  if (cleaningConfidence < 60) {
    alerts.push({ type: "validation", message: `Low cleaning validation confidence: ${cleaningConfidence.toFixed(0)}%`, severity: "error" as const })
  }

  useEffect(() => {
    setTotalAlerts(alerts.length)
  }, [alerts.length])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sun className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SolarGuard AI</h1>
                <p className="text-xs text-muted-foreground">Smart Solar Panel Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-xs">
                <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-primary animate-pulse" : "bg-destructive"}`} />
                <span className="text-muted-foreground">{isConnected ? "Live" : "Offline"}</span>
              </div>
              <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* KPI Summary */}
        <KPISummary
          totalCycles={24}
          avgEfficiency={sensorData.efficiency}
          panelState={sensorData.dust_level > 80 ? "Dusty" : "Clean"}
          robotActive={sensorData.robot_cleaning}
        />

        {/* Solar Panel Monitoring */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Solar Panel Monitoring
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <MetricCard
              title="Temperature"
              value={sensorData.temperature}
              unit="°C"
              icon={Thermometer}
              trend="up"
              status={sensorData.temperature > 35 ? "warning" : "normal"}
            />
            <MetricCard
              title="Humidity"
              value={sensorData.humidity}
              unit="%"
              icon={Droplets}
              trend="down"
            />
            <MetricCard
              title="Voltage"
              value={sensorData.voltage}
              unit="V"
              icon={Zap}
              trend="up"
            />
            <MetricCard
              title="Current"
              value={sensorData.current}
              unit="A"
              icon={Activity}
            />
            <MetricCard
              title="Power Output"
              value={sensorData.power_output}
              unit="W"
              icon={Gauge}
              trend="up"
            />
            <MetricCard
              title="Efficiency"
              value={sensorData.efficiency}
              unit="%"
              icon={Eye}
              trend="up"
              status={sensorData.efficiency < 50 ? "warning" : "normal"}
            />
            <MetricCard
              title="Dust Level"
              value={sensorData.dust_level}
              unit="%"
              icon={Wind}
              status={sensorData.dust_level > 80 ? "critical" : sensorData.dust_level > 50 ? "warning" : "normal"}
            />
          </div>
        </section>

        {/* Progress Bars */}
        <Card>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-3 gap-6">
              <ProgressBar
                value={sensorData.efficiency}
                max={100}
                label="Panel Efficiency"
                color="var(--primary)"
              />
              <ProgressBar
                value={sensorData.dust_level}
                max={100}
                label="Dust Accumulation"
                color={sensorData.dust_level > 80 ? "var(--destructive)" : "var(--accent)"}
              />
              <ProgressBar
                value={(sensorData.power_output / 200) * 100}
                max={100}
                label="Power Output Capacity"
                color="var(--info)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Robot Monitoring & Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RobotStatusCard data={sensorData} />
          <ActivityTimeline logs={activityLogs} />
        </section>

        {/* CloudWatch Widgets Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            CloudWatch Monitoring
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ServoStatusWidget active={sensorData.servo_active} position={servoPosition} />
            <CleaningValidationWidget validating={sensorData.robot_cleaning} confidence={cleaningConfidence} />
            <ActiveRobotsWidget activeCount={activeRobots} totalCount={totalRobots} status={sensorData.robot_cleaning ? "Cleaning" : "Standby"} />
            <MQTTStatusCard connected={isConnected} lastUpdate={lastUpdate} />
          </div>
        </section>

        {/* Cleaning Alerts Widget */}
        <section>
          <CleaningAlertsWidget alerts={alerts} totalAlerts={totalAlerts} />
        </section>

        {/* Real-Time Charts */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Real-Time Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <ChartCard
              title="Dust Level"
              data={dustHistory}
              color="var(--accent)"
              unit="%"
            />
            <ChartCard
              title="Power Output"
              data={powerHistory}
              color="var(--primary)"
              unit="W"
            />
            <ChartCard
              title="Efficiency"
              data={efficiencyHistory}
              color="var(--info)"
              unit="%"
            />
            <ChartCard
              title="Voltage"
              data={voltageHistory}
              color="var(--chart-5)"
              unit="V"
            />
          </div>
        </section>

        {/* Alerts & Connection Status */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AlertCard alerts={alerts} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>AI-Based Smart Solar Panel Cleaning and Monitoring System</p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Connected to AWS IoT Core via MQTT
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
