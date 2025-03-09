import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type UseControllableStateParams<T> = {
  prop?: T;
  defaultProp?: T;
  onChange?: (state: T) => void;
};

type UseControllableStateParams1<T> = {
  prop?: T;
  defaultProp: T;
  onChange?: (state: T) => void;
};

type UseControllableStateParams2<T> = {
  prop: T;
  defaultProp?: T;
  onChange?: (state: T) => void;
};

type UseControllableStateParams3<T> = {
  prop: T;
  defaultProp: T;
  onChange?: (state: T) => void;
};

type UseControllableState = {
  // Order from most specific to least specific
  <T>(params: UseControllableStateParams1<T>): [T, Dispatch<SetStateAction<T>>];
  <T>(params: UseControllableStateParams2<T>): [T, Dispatch<SetStateAction<T>>];
  <T>(params: UseControllableStateParams3<T>): [T, Dispatch<SetStateAction<T>>];
  <T>(
    params: UseControllableStateParams<T>,
  ): [T | undefined, Dispatch<SetStateAction<T | undefined>>];
};

type SetStateFn<T> = (prevState?: T) => T;

export const useControllableState: UseControllableState = <T>({
  prop,
  defaultProp,
  onChange = () => {},
}: UseControllableStateParams<T>) => {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({
    defaultProp,
    onChange,
  });
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledProp;
  const handleChange = useCallbackRef(onChange);

  const setValue: Dispatch<SetStateAction<T | undefined>> = useCallback(
    (nextValue) => {
      const setter = nextValue as SetStateFn<T>;
      const value = typeof nextValue === "function" ? setter(prop) : nextValue;

      if (value === undefined) setUncontrolledProp(value);

      if (!isControlled) {
        setUncontrolledProp(value);
        return;
      }

      if (value !== prop) handleChange(value as T);
    },
    [isControlled, prop, setUncontrolledProp, handleChange],
  );

  return [value, setValue] as const;
};

const useUncontrolledState = <T>({
  defaultProp,
  onChange,
}: Omit<UseControllableStateParams<T>, "prop">) => {
  const uncontrolledState = useState<T | undefined>(defaultProp);
  const [value] = uncontrolledState;
  const prevValueRef = useRef(value);
  const handleChange = useCallbackRef(onChange);

  // biome-ignore lint/correctness/useExhaustiveDependencies: useEffect doesn't trigger on refs
  useEffect(() => {
    if (prevValueRef.current === value) return;

    handleChange(value as T);
    prevValueRef.current = value;
  }, [value, prevValueRef, handleChange]);

  return uncontrolledState;
};

/**
 * A custom hook that converts a callback to a ref to avoid triggering re-renders when passed as a
 * prop or avoid re-executing effects when passed as a dependency
 */
export const useCallbackRef = <T extends (...args: never[]) => unknown>(
  callback: T | undefined,
): T => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  // https://github.com/facebook/react/issues/19240
  return useMemo(() => ((...args) => callbackRef.current?.(...args)) as T, []);
};
