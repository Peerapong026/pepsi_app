"use client";

import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

const COLORS = ["#00C49F", "#FF8042", "#999999", "#8884d8", "#ffc658", "#ff6699"]; // เพิ่มสีรองรับกรณีเหตุผลหลากหลาย

// 🔧 Normalize กลุ่มผลลัพธ์
function normalizeResult(result = "") {
  const cleaned = result.trim();
  if (["ชิมแล้วซื้อ", "ซื้อ", "ซื้อทันที"].includes(cleaned)) return "ชิมแล้วซื้อ";
  if (["ชิมแล้วไม่ซื้อ", "ไม่ซื้อ", "ไม่สนใจ"].includes(cleaned)) return "ชิมแล้วไม่ซื้อ";
  return "อื่นๆ";
}

// 🔢 Group data ตามผลลัพธ์
function groupPerformance(performance = []) {
  const result = {
    "ชิมแล้วซื้อ": 0,
    "ชิมแล้วไม่ซื้อ": 0,
    "อื่นๆ": 0,
  };
  performance.forEach((p) => {
    const qty = p.per_quantity || 0;
    const key = normalizeResult(p.per_result);
    result[key] += qty;
  });
  return Object.entries(result)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
}

// 🧠 Group เหตุผลแบบ dynamic
function groupReasons(performance = [], type = "ชิมแล้วไม่ซื้อ") {
  const reasons = {};
  performance.forEach((p) => {
    if (normalizeResult(p.per_result) === type) {
      const reason = p.per_reason?.trim() || "ไม่ระบุเหตุผล";
      reasons[reason] = (reasons[reason] || 0) + (p.per_quantity || 0);
    }
  });
  return Object.entries(reasons).map(([name, value]) => ({ name, value }));
}

// 🏷️ Custom Label
function renderCustomLabel(props) {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
    value,
  } = props;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#333"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name}: ${value} คน (${(percent * 100).toFixed(1)}%)`}
    </text>
  );
}

export default function PerformancePieChart({ performanceData = [] }) {
  const chartData = useMemo(() => groupPerformance(performanceData), [performanceData]);
  const buyReasonChartData = useMemo(
    () => groupReasons(performanceData, "ชิมแล้วซื้อ"),
    [performanceData]
  );
  const notBuyReasonChartData = useMemo(
    () => groupReasons(performanceData, "ชิมแล้วไม่ซื้อ"),
    [performanceData]
  );

  // 📊 Template สำหรับ PieChart
  const renderPieChart = (data, chartKey) => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={2}
          labelLine={true}
          label={({ value, percent }) =>
            ` ${Number(value).toLocaleString()} คน (${(percent * 100).toFixed(1)}%)`
          }
          labelPosition="outside"
        >
          {data.map((_, index) => (
            <Cell key={`${chartKey}-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${Number(value).toLocaleString()} คน`} />
        <Legend iconType="circle" layout="horizontal" align="center" wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <>
      {/* กราฟหลัก: ผลลัพธ์จากการชิม */}
      <Card className="rounded-xl shadow-md border border-gray-100 bg-white mb-6">
        <CardHeader>
          <CardTitle>ผลลัพธ์จากการชิมสินค้า</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-gray-500">ไม่มีข้อมูลผลลัพธ์การชิม</p>
          ) : (
            renderPieChart(chartData, "main")
          )}
        </CardContent>
      </Card>

      {/* เหตุผลที่ซื้อ/ไม่ซื้อ */}
      {(buyReasonChartData.length > 0 || notBuyReasonChartData.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {buyReasonChartData.length > 0 && (
            <Card className="rounded-xl shadow-md border border-gray-100 bg-white">
              <CardHeader>
                <CardTitle>เหตุผลที่ชิมแล้วซื้อ</CardTitle>
              </CardHeader>
              <CardContent>
                {renderPieChart(buyReasonChartData, "buy")}
              </CardContent>
            </Card>
          )}

          {notBuyReasonChartData.length > 0 && (
            <Card className="rounded-xl shadow-md border border-gray-100 bg-white">
              <CardHeader>
                <CardTitle>เหตุผลที่ชิมแล้วไม่ซื้อ</CardTitle>
              </CardHeader>
              <CardContent>
                {renderPieChart(notBuyReasonChartData, "notbuy")}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}