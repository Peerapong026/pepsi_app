"use client";

import * as React from "react";

export const RadioGroup = ({ children, ...props }) => {
  return (
    <div role="radiogroup" {...props}>
      {children}
    </div>
  );
};

export const RadioGroupItem = React.forwardRef(({ value, checked, onChange, name }, ref) => (
  <label className="inline-flex items-center space-x-2 cursor-pointer">
    <input
        type="radio"
        value={value}
        name={name}
        checked={checked}
        onChange={() => onChange?.(value)}
        ref={ref}
        className="form-radio text-blue-600"
      />
    <span>{value}</span>
  </label>
));
RadioGroupItem.displayName = "RadioGroupItem";
