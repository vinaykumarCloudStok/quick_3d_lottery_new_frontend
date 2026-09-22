// hooks/useCounterInput.ts
import { useState } from "react";

// interface UseCounterInputProps {
//   min?: number;
//   max?: number;
//   defaultValue?: number;
// }

export function useCounterInput({
  min = 0,
  max = 999,
}: {
  min?: number;
  max?: number;
}) {
  const [value, setValue] = useState<number>(0);

  const increase = () => setValue((v) => Math.min(max, v + 1));
  const decrease = () => setValue((v) => Math.max(min, v - 1));
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setValue(Math.max(min, Math.min(max, val)));
    } else {
      setValue(0);
    }
  };

  return { value, increase, decrease, onChange, setValue };
}
