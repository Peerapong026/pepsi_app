"use client";

import { useEffect, useState } from "react";
import FilterPanel from "../../summary/components/FilterPanel";
import TopStatsCard from "../../summary/components/TopStatsCard";
import SalesBarChart from "../../summary/components/SalesBarChart";
import PerformancePieChart from "../../summary/components/PerformancePieChart";
import FOCPremiumSummaryTable from "../../summary/components/FOCPremiumSummaryTable";
import {Building2,TrendingUp,Package,Gift,ShoppingCart} from "lucide-react";
import BackButton from "../../../components/ui/backbutton";

export default function DashboardPage() {
  const [rawData, setRawData] = useState({ foc: [], premium: [], performance: [], sales: [] });
  const [meta, setMeta] = useState({ stores: [], products: [], premiums: [] });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedStoreId, setSelectedStoreId] = useState("all");
  const [selectedTypes, setSelectedTypes] = useState({
    foc: true,
    premium: true,
    performance: true,
    sales: true
  });

  const normalizeResult = (result = "") => {
    const cleaned = result.trim();
    if (["ชิมแล้วซื้อ", "ซื้อ", "ซื้อทันที"].includes(cleaned)) return "ชิมแล้วซื้อ";
    if (["ชิมแล้วไม่ซื้อ", "ไม่ซื้อ", "ไม่สนใจ"].includes(cleaned)) return "ชิมแล้วไม่ซื้อ";
    return "อื่นๆ";
  };

  useEffect(() => {
    const fetchData = async () => {
      const res1 = await fetch("/api/export/export-data");
      const res2 = await fetch("/api/export/get-meta-data");
      const json1 = await res1.json();
      const json2 = await res2.json();
      setRawData(json1);
      setMeta(json2);
    };
    fetchData();
  }, []);

  const filterByDate = (items, dateKey) => {
    return items.filter((item) => {
      const d = new Date(item[dateKey]);
      return (!dateRange.start || d >= new Date(dateRange.start)) &&
             (!dateRange.end || d <= new Date(dateRange.end));
    });
  };

  const filterByStore = (items, storeKey) => {
    if (selectedStoreId === "all") return items;
    return items.filter(item => item[storeKey] === selectedStoreId);
  };

  const filteredData = {
    foc: selectedTypes.foc
      ? filterByStore(filterByDate(rawData.foc, "foc_date"), "foc_storeId")
      : [],
    premium: selectedTypes.premium
      ? filterByStore(filterByDate(rawData.premium, "gift_date"), "gift_storeId")
      : [],
    performance: selectedTypes.performance
      ? filterByStore(filterByDate(rawData.performance, "per_date"), "per_storeId")
      : [],
    sales: selectedTypes.sales
      ? filterByStore(filterByDate(rawData.sales, "sal_date"), "sal_storeId")
      : [],
  };

  const allStoreIds = [
    ...filteredData.sales.map((s) => s.sal_storeId),
    ...filteredData.foc.map((s) => s.foc_storeId),
    ...filteredData.premium.map((s) => s.gift_storeId),
    ...filteredData.performance.map((s) => s.per_storeId),
  ];

  const uniqueStoreIds = new Set(allStoreIds);

  const stats = {
    totalStores:
      selectedStoreId === "all"
        ? uniqueStoreIds.size
      : uniqueStoreIds.has(selectedStoreId)
        ? 1
        : 0,

    totalSales: filteredData.sales.flatMap((s) => s.sal_items).reduce((sum, i) => sum + (i.sal_totalPrice || 0), 0),
    totalFocUsed: filteredData.foc.reduce((sum, i) => sum + (i.foc_used || 0), 0),
    totalPremiumUsed: filteredData.premium.reduce((sum, i) => sum + (i.gift_used || 0), 0),
     buyRate: (() => {
      const buy = filteredData.performance
        .filter((p) => normalizeResult(p.per_result) === "ชิมแล้วซื้อ")
        .reduce((sum, p) => sum + (p.per_quantity || 0), 0);

      const notBuy = filteredData.performance
        .filter((p) => normalizeResult(p.per_result) === "ชิมแล้วไม่ซื้อ")
        .reduce((sum, p) => sum + (p.per_quantity || 0), 0);

      const total = buy + notBuy;
      return total > 0 ? ((buy / total) * 100).toFixed(1) : null;
    })()
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* ✅ Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📊 หน้าสรุปงาน</h1>
            <p className="text-sm text-gray-500">ภาพรวมการทำงานทั้งหมด</p>
          </div>
             <BackButton to="/form" />  
          {/* <button className="bg-red-500 hover:bg-red-600 text-white text-sm px-5 py-2 rounded-md shadow-md">
            ดาวน์โหลดรายงาน
          </button> */}
        </div>
                      

        {/* ✅ Filter */}
        <FilterPanel
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          storeList={meta.stores} // << ดึงจาก meta
          selectedStoreId={selectedStoreId}
          setSelectedStoreId={setSelectedStoreId}
        />

        {/* ✅ Stats Card */}
        <TopStatsCard
          stats={{
            ...stats,
            icons: {
              totalStores: <Building2 className="text-gray-400 w-5 h-5" />,
              totalSales: <TrendingUp className="text-green-500 w-5 h-5" />,
              totalFocUsed: <Package className="text-blue-500 w-5 h-5" />,
              totalPremiumUsed: <Gift className="text-orange-500 w-5 h-5" />,
              buyRate: <ShoppingCart className="text-purple-500 w-5 h-5" />
            }
          }}
        />

        {/* ✅ Charts */}
        {selectedTypes.sales && (
          <div className="rounded-xl shadow-sm border bg-white p-6 mb-6">
            <SalesBarChart salesData={filteredData.sales} />
          </div>
        )}

        {selectedTypes.performance && (
          <div className="rounded-xl shadow-sm border bg-white p-6 mb-6">
            <PerformancePieChart performanceData={filteredData.performance} />
          </div>
        )}

        {(selectedTypes.foc || selectedTypes.premium) && (
          <div className="rounded-xl shadow-sm border bg-white p-6">
            <FOCPremiumSummaryTable
              focData={filteredData.foc}
              premiumData={filteredData.premium}
              meta={meta}
            />
          </div>
        )}
      </div>
    </div>
  );
}