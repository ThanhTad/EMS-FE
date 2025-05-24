interface MapEmbedProps {
  location: string;
}

export default function MapEmbed({ location }: MapEmbedProps) {
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(
    location
  )}`;

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800">
      <iframe
        src={mapSrc}
        allowFullScreen
        loading="lazy"
        className="w-full h-full border-0 bg-white dark:bg-gray-800"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}
