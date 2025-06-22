// app/admin/venues/new/page.tsx
"use client";

import { VenueForm } from "@/components/admin/venues/VenueForm";
import { createVenue } from "@/lib/api";

const NewVenuePage = () => {
  return <VenueForm isEditMode={false} onSubmit={createVenue} />;
};

export default NewVenuePage;
