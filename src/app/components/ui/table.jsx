import * as React from "react";

export const Table = ({ className, ...props }) => (
  <div className="w-full overflow-auto">
    <table className={`w-full text-sm text-left border-collapse ${className || ""}`} {...props} />
  </div>
);

export const TableHeader = ({ className, ...props }) => (
  <thead className={`bg-gray-100 text-gray-700 uppercase ${className || ""}`} {...props} />
);

export const TableBody = ({ className, ...props }) => (
  <tbody className={`${className || ""}`} {...props} />
);

export const TableRow = ({ className, ...props }) => (
  <tr className={`border-b hover:bg-gray-50 ${className || ""}`} {...props} />
);

export const TableHead = ({ className, ...props }) => (
  <th scope="col" className={`px-4 py-2 font-medium ${className || ""}`} {...props} />
);

export const TableCell = ({ className, ...props }) => (
  <td className={`px-4 py-2 ${className || ""}`} {...props} />
);
