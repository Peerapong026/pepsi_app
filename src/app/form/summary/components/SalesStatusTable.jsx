"use client";

export default function SalesStatusTable({ salesData = [], meta = {} }) {
  const groupedData = {};

  salesData.forEach((sale) => {
    const storeId = sale.sal_storeId;
    if (!groupedData[storeId]) {
      groupedData[storeId] = [];
    }

    sale.sal_items.forEach((item) => {
      groupedData[storeId].push({
        skuId: item.sal_skuId,
        status: item.sal_status,
      });
    });
  });

  const getStoreName = (id) => {
    const store = meta.stores?.find((s) => s.st_id_Code === id);
    return store ? store.st_store_Name : id;
  };

  const getProductName = (id) => {
    const product = meta.products?.find((p) => p.sku_id === id);
    return product ? product.sku_name : id;
  };

  const storeIds = Object.keys(groupedData);

  if (storeIds.length === 0) {
    return <div className="text-center text-gray-500 py-6">ไม่มีข้อมูลยอดขาย</div>;
  }

  return (
    <div className="space-y-6">
      {storeIds.map((storeId) => (
        <div key={storeId} className="border rounded-lg bg-white shadow-sm">
          <div className="px-4 py-3 bg-gray-100 border-b rounded-t-lg">
            <h2 className="text-md font-semibold text-gray-800">
              🏪 {getStoreName(storeId)}
            </h2>
            <p className="text-sm text-gray-500">{storeId}</p>
          </div>

          <div className="divide-y">
            {groupedData[storeId].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 text-sm"
              >
                <span>{getProductName(item.skuId)}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.status === "มีขาย"
                      ? "bg-green-100 text-green-700"
                      : item.status === "หมด"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
