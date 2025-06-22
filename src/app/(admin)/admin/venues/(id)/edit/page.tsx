// app/admin/venues/[venueId]/edit/page.tsx
"use client";

import { VenueForm } from "@/components/admin/venues/VenueForm";
import { getVenueById, updateVenue } from "@/lib/api";
import { Venue } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditVenuePageProps {
  params: {
    venueId: string;
  };
}

const EditVenuePage = ({ params }: EditVenuePageProps) => {
  const { venueId } = params;
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const data = await getVenueById(venueId);
        setVenue(data);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Lỗi: ${error.message}`);
        }
        toast.error("Không thể tải thông tin địa điểm.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenue();
  }, [venueId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!venue) {
    return <div className="text-center">Không tìm thấy địa điểm.</div>;
  }

  const handleUpdate = (
    data: Omit<Venue, "id" | "createdAt" | "updatedAt">
  ) => {
    return updateVenue(venue.id, data);
  };

  return (
    <VenueForm isEditMode={true} initialData={venue} onSubmit={handleUpdate} />
  );
};

export default EditVenuePage;
