//components/admin/events/approval/ApprovalEventTable.tsx
"use client";

import { Paginated, Event as EventType } from "@/types";
import { DataTable } from "@/components/shared/DataTable";
import { approvalTableColumns } from "./ApprovalTableColumns";

interface Props {
  eventsData: Paginated<EventType>;
}

export default function ApprovalEventTable({ eventsData }: Props) {
  return (
    <DataTable
      columns={approvalTableColumns}
      data={eventsData.content ?? []}
      pageCount={eventsData.totalPages ?? 0}
      totalRecords={eventsData.totalElements ?? 0}
    />
  );
}
