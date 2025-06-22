
export function Card({ children, className }) {
  return <div className={`bg-white rounded-xl shadow-md ${className}`}>{children}</div>;
}
export function CardHeader({ children }) {
  return <div className="px-6 pt-6">{children}</div>;
}
export function CardTitle({ children }) {
  return <h2 className="text-lg font-bold">{children}</h2>;
}
export function CardDescription({ children }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}
export function CardContent({ children, className }) {
  return <div className={`p-6 pt-2 ${className}`}>{children}</div>;
}
