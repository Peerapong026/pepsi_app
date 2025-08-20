"use client";

import * as React from "react";

// ---------- RadioGroup (JS) ----------
export function RadioGroup({
  value,
  onValueChange,
  name,
  className,
  children,
  disabled,
  ...rest
}) {
  // อย่าส่ง onValueChange ลง DOM
  const id = React.useId();
  const groupName = name ?? id;

  return (
    <div
      role="radiogroup"
      aria-disabled={disabled || undefined}
      className={className}
      {...rest}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          name: groupName,
          checked: child.props.value === value,
          onChange: () => !disabled && onValueChange?.(child.props.value),
          disabled: disabled || child.props.disabled,
        });
      })}
    </div>
  );
}

// ---------- RadioGroupItem (JS) ----------
export const RadioGroupItem = React.forwardRef(function RadioGroupItem(
  { value, label, name, checked, onChange, disabled, className, ...rest },
  ref
) {
  const inputId = React.useId();
  return (
    <div className="inline-flex items-center space-x-2">
      <input
        id={inputId}
        ref={ref}
        type="radio"
        value={value}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`form-radio ${className ?? ""}`}
        {...rest}
      />
      <label
        htmlFor={inputId}
        className={disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      >
        {label ?? value}
      </label>
    </div>
  );
});
