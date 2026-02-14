import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditableSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function EditableSelect({
  value,
  options,
  onChange,
  disabled,
}: EditableSelectProps) {
  const [selected, setSelected] = useState(value);

  const handleChange = (val: string) => {
    setSelected(val);
    onChange(val);
  };

  return (
    <Select value={selected} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Pilih status" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
