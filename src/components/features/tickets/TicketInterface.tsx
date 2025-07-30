//components/features/tickets/TicketingInterface.tsx
"use client";
import {
  EventTicketingDetails,
  GeneralAdmissionData,
  ReservedSeatingData,
  TicketSelectionModeEnum,
  ZonedAdmissionData,
} from "@/types";
import GeneralAdmissionSelector from "./GeneralAdmissionSelector";
import ReservedSeatingSelector from "./ReservedSeatingSelector";
import ZonedAdmissionSelector from "./ZonedAdmissionSelector";
import React from "react";

interface TicketingInterfaceProps {
  data: EventTicketingDetails;
}

const TicketingInterface: React.FC<TicketingInterfaceProps> = ({ data }) => {
  const { ticketSelectionMode, ticketingData } = data;
  switch (ticketSelectionMode) {
    case TicketSelectionModeEnum.GENERAL_ADMISSION:
      return (
        <GeneralAdmissionSelector
          data={ticketingData as GeneralAdmissionData}
        />
      );
    case TicketSelectionModeEnum.ZONED_ADMISSION:
      return (
        <ZonedAdmissionSelector data={ticketingData as ZonedAdmissionData} />
      );
    case TicketSelectionModeEnum.RESERVED_SEATING:
      return (
        <ReservedSeatingSelector data={ticketingData as ReservedSeatingData} />
      );
    default:
      return (
        <div className="text-red-500">Chế độ bán vé không được hỗ trợ.</div>
      );
  }
};
export default TicketingInterface;
