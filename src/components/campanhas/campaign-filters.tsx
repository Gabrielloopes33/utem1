"use client"

import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OBJECTIVE_LABELS, STATUS_LABELS } from "@/types/campaign"

interface CampaignFiltersProps {
  onFilterChange: (filters: {
    status?: string
    objective?: string
    search?: string
  }) => void
}

export function CampaignFilters({ onFilterChange }: CampaignFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar campanhas..."
          className="pl-9"
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>
      
      <div className="flex gap-2">
        <Select
          onValueChange={(value) => onFilterChange({ status: value })}
        >
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => onFilterChange({ objective: value })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Objetivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(OBJECTIVE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
