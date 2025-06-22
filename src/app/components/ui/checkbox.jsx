"use client";

import * as React from "react";

export const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    className={`form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out ${className || ""}`}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";
