"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NotePrivacyToggleProps = {
  isPrivate: boolean;
  onChange: (isPrivate: boolean) => void;
};

export function NotePrivacyToggle({
  isPrivate,
  onChange,
}: NotePrivacyToggleProps) {
  return (
    <Select
      value={isPrivate ? "private" : "public"}
      onValueChange={(value) => onChange(value === "private")}
    >
      <SelectTrigger aria-label="Note visibility" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="public">Public</SelectItem>
        <SelectItem value="private">Private</SelectItem>
      </SelectContent>
    </Select>
  );
}
