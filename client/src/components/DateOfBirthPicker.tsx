"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function isValidDate(date: Date | undefined) {
  if (!date) return false;
  return !isNaN(date.getTime());
}

export default function DateOfBirthPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [inputVal, setInputVal] = React.useState(
    date ? format(date, "dd MMMM yyyy", { locale: id }) : ""
  );

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="dob" className="px-1">
        Tanggal Lahir
      </Label>
      <div className="relative flex gap-2">
        <Input
          id="dob"
          value={inputVal}
          placeholder="01 Januari 2000"
          className="bg-background pr-10"
          onChange={(e) => {
            setInputVal(e.target.value);
            const parsed = new Date(e.target.value);
            if (isValidDate(parsed)) {
              setDate(parsed);
              setMonth(parsed);
              onChange(parsed.toISOString().split("T")[0]);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2">
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Pilih tanggal</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}>
            <Calendar
              mode="single"
              captionLayout="dropdown"
              fromYear={1980}
              toYear={2025}
              selected={date}
              month={month}
              onMonthChange={setMonth}
              onSelect={(d) => {
                if (!d) return;
                setDate(d);
                setInputVal(format(d, "dd MMMM yyyy", { locale: id }));
                onChange(d.toISOString().split("T")[0]); // ISO format
                setOpen(false);
              }}
              locale={id}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
