// components/shared/CategoryHighlightCard.tsx
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface CategoryHighlightCardProps {
  category: {
    id: string;
    name: string;
    imageUrl: string;
    icon?: React.ReactElement<{ className?: string }>;
  };
  className?: string;
}

const CategoryHighlightCard: React.FC<CategoryHighlightCardProps> = ({
  category,
  className,
}) => {
  return (
    <Link
      href={`/events?category=${category.id}`}
      className={cn("group block", className)}
    >
      <Card className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:scale-105">
        <AspectRatio ratio={3 / 2}>
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </AspectRatio>
        <CardContent className="absolute bottom-0 left-0 w-full p-4 md:p-6">
          <div className="flex items-center gap-3">
            {category.icon && (
              <div className="rounded-full bg-primary/20 p-2 text-primary backdrop-blur-sm">
                {React.cloneElement(category.icon, {
                  className: "h-6 w-6 md:h-8 md:w-8",
                })}
              </div>
            )}
            <h3 className="text-lg font-semibold text-white md:text-xl">
              {category.name}
            </h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryHighlightCard;
