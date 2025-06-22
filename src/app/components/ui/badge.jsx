export function Badge({ children, className = "" }) {
  return (
    <span className={`inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full ${className}`}>
      {children}
    </span>
  );
}
