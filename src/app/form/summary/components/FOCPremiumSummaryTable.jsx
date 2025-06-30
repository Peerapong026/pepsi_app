"use client";

import { useMemo, Fragment } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";

// รวมข้อมูล FOC หรือ Premium ตาม storeId + premiumId
function summarizeUsage(data = [], storeMeta = [], premiumMeta = []) {
  const summary = {};

  data.forEach((item) => {
    const storeId = item.foc_storeId || item.gift_storeId;
    const premiumId = item.foc_premiumId || item.gift_premiumId;
    const key = `${storeId}_${premiumId}`;

    if (!summary[key]) {
      summary[key] = {
        storeId,
        premiumId,
        received: 0,
        used: 0,
        remain: 0,
      };
    }

    const received = item.foc_received || item.gift_received || 0;
    const used = item.foc_used || item.gift_used || 0;

    summary[key].received += received;
    summary[key].used += used;
    summary[key].remain = summary[key].received - summary[key].used;
  });

  const summarized = Object.values(summary).map((row) => {
    const store = storeMeta.find((s) => s.st_id_Code === row.storeId) || {};
    const premium =
      premiumMeta.find(
        (p) => p.pm_id_premium === row.premiumId || p._id === row.premiumId
      ) || {};
    return {
      storeId: row.storeId,
      storeName: store.st_store_Name || row.storeId,
      premiumName: premium.pm_name_premium || premium.name || row.premiumId,
      received: row.received,
      used: row.used,
      remain: row.remain,
    };
  });

  // Group by store
  const grouped = summarized.reduce((acc, item) => {
    if (!acc[item.storeName]) acc[item.storeName] = [];
    acc[item.storeName].push(item);
    return acc;
  }, {});

  return Object.entries(grouped).map(([storeName, items]) => ({
    storeName,
    items,
  }));
}

export default function FOCPremiumSummaryTable({ focData = [], premiumData = [], meta }) {
  const focSummary = useMemo(() => summarizeUsage(focData, meta.stores, meta.premiums), [focData, meta]);
  const premiumSummary = useMemo(() => summarizeUsage(premiumData, meta.stores, meta.premiums), [premiumData, meta]);

  return (
    <Card className="rounded-xl shadow-md border border-gray-100 bg-white mb-6">
      <CardHeader>
        <CardTitle>สรุปการใช้ของชิม (FOC) และของแถม (Premium)</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {/* ✅ FOC Section */}
        <h3 className="text-md font-semibold mb-2">FOC</h3>
        <Table className="mb-6">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">ร้าน</TableHead>
              <TableHead className="w-[40%]">สินค้า</TableHead>
              <TableHead className="w-[13%] text-right">รับ</TableHead>
              <TableHead className="w-[13%] text-right">ใช้</TableHead>
              <TableHead className="w-[14%] text-right">คงเหลือ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {focSummary.map((group, idx) => (
              <Fragment key={idx}>
                <TableRow className="bg-gray-100">
                  <TableCell colSpan={5} className="font-semibold py-2 px-2">
                    🏪 {group.storeName}
                  </TableCell>
                </TableRow>
                {group.items.map((row, subIdx) => (
                  <TableRow key={subIdx}>
                    <TableCell></TableCell>
                    <TableCell>{row.premiumName}</TableCell>
                    <TableCell className="text-right">{row.received}</TableCell>
                    <TableCell className="text-right">{row.used}</TableCell>
                    <TableCell className="text-right">{row.remain}</TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>

        {/* ✅ Premium Section */}
        <h3 className="text-md font-semibold mb-2">Premium</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">ร้าน</TableHead>
              <TableHead className="w-[40%]">สินค้า</TableHead>
              <TableHead className="w-[13%] text-right">รับ</TableHead>
              <TableHead className="w-[13%] text-right">ใช้</TableHead>
              <TableHead className="w-[14%] text-right">คงเหลือ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {premiumSummary.map((group, idx) => (
              <Fragment key={idx}>
                <TableRow className="bg-gray-100">
                  <TableCell colSpan={5} className="font-semibold py-2 px-2">
                    🏪 {group.storeName}
                  </TableCell>
                </TableRow>
                {group.items.map((row, subIdx) => (
                  <TableRow key={subIdx}>
                    <TableCell></TableCell>
                    <TableCell>{row.premiumName}</TableCell>
                    <TableCell className="text-right">{row.received}</TableCell>
                    <TableCell className="text-right">{row.used}</TableCell>
                    <TableCell className="text-right">{row.remain}</TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}