// stores/cartStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  Ticket,
  Seat,
  EventTicketingDetails,
  CartEventInfo,
  CartItem,
} from "@/types";

/**
 * Định nghĩa state và các actions của cartStore.
 */
interface CartState {
  eventInfo: CartEventInfo | null;
  items: Record<string, CartItem>;

  // --- ACTIONS ---
  // Action này giờ sẽ nhận một kiểu dữ liệu rộng hơn
  startNewCart: (eventData: EventTicketingDetails) => void;
  updateGaQuantity: (ticket: Ticket, quantity: number) => void;
  addSeat: (seat: Seat, ticket: Ticket) => void;
  removeSeat: (seatId: string) => void;
  clearCartItems: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        eventInfo: null,
        items: {},

        /**
         * Action: Bắt đầu một giỏ hàng mới cho một sự kiện.
         * Tự "dịch" từ EventTicketingDetails sang cấu trúc nội bộ CartEventInfo.
         * @param eventData - Dữ liệu đầy đủ của EventTicketingDetails từ API.
         */
        startNewCart: (eventData) => {
          // ========================================================
          // === ĐÂY LÀ PHẦN "PHÉP MÀU" - LOGIC CHUYỂN ĐỔI DỮ LIỆU ===
          // ========================================================
          const newEventInfo: CartEventInfo = {
            id: eventData.eventId, // <-- Lấy từ eventId
            title: eventData.eventTitle, // <-- Lấy từ eventTitle
            slug: eventData.slug,
            ticketSelectionMode: eventData.ticketSelectionMode,
            // Giả sử DTO của bạn cũng có trường này, nếu không thì mặc định là false
            // allowMixingTicketTypes: eventData.allowMixingTicketTypes ?? false,
          };
          // ========================================================

          const currentEventInfo = get().eventInfo;

          if (!currentEventInfo || currentEventInfo.id !== newEventInfo.id) {
            set(
              { eventInfo: newEventInfo, items: {} },
              false,
              "cart/startNewCart"
            );
          }
        },

        // Các actions còn lại (updateGaQuantity, addSeat, ...) không cần thay đổi
        // vì chúng hoạt động dựa trên `eventInfo` đã được chuẩn hóa trong state.
        updateGaQuantity: (ticket, quantity) =>
          set((state) => {
            const { items, eventInfo } = state;
            if (!eventInfo) return state;

            const canMix = eventInfo.allowMixingTicketTypes ?? false;
            const hasSeatedItems = Object.values(items).some(
              (item) => item.type === "SEATED"
            );
            if (hasSeatedItems && !canMix) {
              return state;
            }

            const newItems = { ...items };
            if (quantity <= 0) {
              delete newItems[ticket.id];
            } else {
              newItems[ticket.id] = { type: "GA", ticket, quantity };
            }
            return { items: newItems };
          }),

        addSeat: (seat, ticket) =>
          set((state) => {
            const { items, eventInfo } = state;
            if (!eventInfo) return state;

            const newItems = { ...items };
            newItems[seat.seatId] = { type: "SEATED", seat, ticket };
            return { items: newItems };
          }),

        removeSeat: (seatId) =>
          set(
            (state) => {
              const newItems = { ...state.items };
              delete newItems[seatId];
              return { items: newItems };
            },
            false,
            "cart/removeSeat"
          ),

        clearCartItems: () => set({ items: {} }, false, "cart/clearItems"),

        clearCart: () =>
          set({ items: {}, eventInfo: null }, false, "cart/clearCart"),
      }),
      {
        name: "ticket-cart-storage",
      }
    )
  )
);

// Các selectors (useTotalCartQuantity, useTotalCartPrice) giữ nguyên, không cần thay đổi.
export const useTotalCartQuantity = () =>
  useCartStore((state) => {
    return Object.values(state.items).reduce((total, item) => {
      return total + (item.type === "GA" ? item.quantity : 1);
    }, 0);
  });

export const useTotalCartPrice = () =>
  useCartStore((state) => {
    return Object.values(state.items).reduce((total, item) => {
      const price = item.ticket.price;
      const quantity = item.type === "GA" ? item.quantity : 1;
      return total + price * quantity;
    }, 0);
  });
