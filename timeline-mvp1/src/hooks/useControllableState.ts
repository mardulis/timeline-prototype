import * as React from "react";

function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (v: T) => void;
}) {
  const [internal, setInternal] = React.useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const state = isControlled ? (value as T) : internal;

  const setState = React.useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  // If parent switches from uncontrolled to controlled or updates default,
  // we don't overwrite internal state here (that would nuke user edits).
  // React will re-render with `value` when controlled anyway.

  return [state, setState] as const;
}

export default useControllableState;
