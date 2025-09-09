import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import React from "react";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

const GuruHeader: React.FC<Props> = ({
  search,
  onSearchChange,
  onAddClick,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <Input
        placeholder="Cari data guru..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full sm:w-64"
      />

      <Button
        variant="default"
        size="sm"
        className="w-full sm:w-auto"
        onClick={onAddClick}>
        <UserPlus className="mr-2 w-4 h-4" /> Tambah Guru
      </Button>
    </div>
  );
};

export default GuruHeader;
