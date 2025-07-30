"use client";

import { TicketPurchaseDetail } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Tag, ArrowRight } from "lucide-react";

interface TicketPurchaseCardProps {
  purchase: TicketPurchaseDetail;
}

const TicketPurchaseCard = ({ purchase }: TicketPurchaseCardProps) => {
  const formattedDate = new Date(purchase.purchaseDate).toLocaleDateString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: purchase.currency || "VND",
  }).format(purchase.totalPrice);

  return (
    <Card className="w-full overflow-hidden transition-shadow hover:shadow-lg dark:hover:shadow-primary/20">
      <div className="flex flex-col sm:flex-row">
        {/* Event Image */}
        <div className="relative w-full h-48 sm:w-48 sm:h-auto">
          <Image
            src={purchase.eventImageUrl || "/placeholder-event.png"}
            alt={`Hình ảnh sự kiện ${purchase.eventTitle}`}
            fill
            sizes="(max-width: 640px) 100vw, 12rem"
            className="object-cover"
          />
        </div>

        {/* Purchase Details */}
        <CardContent className="flex flex-col flex-grow p-4 sm:p-6 justify-between">
          <div>
            <h3 className="text-xl font-bold text-primary hover:underline">
              <Link href={`/events/${purchase.eventId}`}>
                {purchase.eventTitle}
              </Link>
            </h3>

            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Ngày mua: <strong>{formattedDate}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>
                  Tổng tiền: <strong>{formattedPrice}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4 flex justify-end">
            <Button asChild>
              <Link href={`/my-tickets/${purchase.id}`}>
                Xem chi tiết vé
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default TicketPurchaseCard;
