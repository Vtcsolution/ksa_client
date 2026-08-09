"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "gold" | "ghost" | "danger" | "blue" | "green";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  sm?: boolean;
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "ghost", sm, className, children, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={clsx("btn", variant, sm && "sm", className)} {...rest}>
      {children}
    </button>
  );
});

export default Button;
