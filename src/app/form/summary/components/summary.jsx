'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

const barData = [
  { store: 'ร้าน01', sales: 60000 },
  { store: 'ร้าน02', sales: 45000 },
  { store: 'ร้าน03', sales: 30000 },
];

const pieData = [
  { name: 'ซื้อแล้ว', value: 42, color: '#22c55e' },
  { name: 'ไม่ซื้อ', value: 27, color: '#ef4444' },
];

const lineData = [
  { month: 'ม.ค.', performance: 100000 },
  { month: 'ก.พ.', performance: 110000 },
  { month: 'มี.ค.', performance: 125000 },
];

const remainData = [
  { id: 'PMS001', remain: 25 },
  { id: 'PMS002', remain: 2 },
  { id: 'PMS003', remain: 45 },
];

export default function DashboardSummary() {
  const [month, setMonth] = useState('');
  const [region, setRegion] = useState('');
  const [store, setStore] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-2">สรุปข้อมูลทั้งหมด</h1>
      <p className="text-center text-gray-600 mb-6">ข้อมูลการใช้ FOC, Premium, Performance และยอดขาย</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger><SelectValue placeholder="เลือกเดือน" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="01">ม.ค.</SelectItem>
            <SelectItem value="02">ก.พ.</SelectItem>
            <SelectItem value="03">มี.ค.</SelectItem>
          </SelectContent>
        </Select>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger><SelectValue placeholder="เลือกภาค" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="north">เหนือ</SelectItem>
            <SelectItem value="central">กลาง</SelectItem>
            <SelectItem value="south">ใต้</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="ค้นหารหัสร้านค้า เช่น ST001" value={store} onChange={e => setStore(e.target.value)} />
        <Button className="bg-blue-600 text-white">ค้นหา</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">ยอดขายรวม</p><p className="text-2xl font-bold text-green-600">฿125,000</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Performance Rate</p><p className="text-2xl font-bold text-blue-600">85%</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Conversion Rate</p><p className="text-2xl font-bold text-orange-500">68.5%</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">ร้านค้าที่ใช้งาน</p><p className="text-2xl font-bold text-purple-600">3 ร้าน</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>ยอดขายตามร้านค้า</CardTitle><CardDescription>เปรียบเทียบยอดขาย</CardDescription></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={200}><BarChart data={barData}><XAxis dataKey="store" /><YAxis /><Tooltip /><Bar dataKey="sales" fill="#3b82f6" /></BarChart></ResponsiveContainer></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>สัดส่วน Performance</CardTitle><CardDescription>ซื้อ/ไม่ซื้อ</CardDescription></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieData} dataKey="value" outerRadius={70} label>{pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>เทรนด์รายเดือน</CardTitle><CardDescription>ยอด Performance</CardDescription></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={200}><LineChart data={lineData}><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="performance" stroke="#2563eb" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>สถานะสินค้าคงเหลือ</CardTitle><CardDescription>สินค้าพร้อมใช้งาน</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {remainData.map(item => (
              <div key={item.id} className="flex justify-between items-center border p-2 rounded">
                <span>{item.id}</span>
                <Badge variant={item.remain < 5 ? 'destructive' : 'default'}>{`คงเหลือ: ${item.remain} ชิ้น`}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
