// stores/cartStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Event, Ticket, Seat } from "@/types";

// Định nghĩa các loại item trong giỏ hàng
type CartItem =
  | { type: "GA"; ticket: Ticket; quantity: number }
  | { type: "SEATED"; seat: Seat; ticket: Ticket };

interface CartState {
  event: Event | null;
  // Dùng Map để truy cập nhanh và tránh trùng lặp. Key là ticketId cho GA, seatId cho SEATED.
  items: Map<string, CartItem>;
  setEvent: (event: Event) => void;
  updateGaQuantity: (ticket: Ticket, quantity: number) => void;
  addSeat: (seat: Seat, ticket: Ticket) => void;
  removeSeat: (seatId: string) => void;
  clearCart: () => void;
  getTotalQuantity: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        event: null,
        items: new Map(),

        setEvent: (event) => set({ event }),

        updateGaQuantity: (ticket, quantity) => {
          const newItems = new Map(get().items);
          if (quantity <= 0) {
            newItems.delete(ticket.id);
          } else {
            newItems.set(ticket.id, { type: "GA", ticket, quantity });
          }
          set({ items: newItems });
        },

        addSeat: (seat, ticket) => {
          const newItems = new Map(get().items);
          newItems.set(seat.id, { type: "SEATED", seat, ticket });
          set({ items: newItems });
        },

        removeSeat: (seatId) => {
          const newItems = new Map(get().items);
          newItems.delete(seatId);
          set({ items: newItems });
        },

        clearCart: () => set({ items: new Map() }),

        getTotalQuantity: () => {
          let total = 0;
          for (const item of get().items.values()) {
            if (item.type === "GA") {
              total += item.quantity;
            } else {
              total += 1; // Mỗi item SEATED là 1 vé
            }
          }
          return total;
        },

        getTotalPrice: () => {
          let total = 0;
          for (const item of get().items.values()) {
            if (item.type === "GA") {
              total += item.ticket.price * item.quantity;
            } else {
              total += item.ticket.price;
            }
          }
          return total;
        },
      }),
      {
        name: "ticket-cart-storage",
        // Custom serializer để Map có thể hoạt động với persist middleware
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const { state } = JSON.parse(str);
            return {
              state: {
                ...state,
                items: new Map(JSON.parse(state.items)),
              },
            };
          },
          setItem: (name, newValue) => {
            const str = JSON.stringify({
              state: {
                ...newValue.state,
                items: JSON.stringify(
                  Array.from(newValue.state.items.entries())
                ),
              },
            });
            localStorage.setItem(name, str);
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    )
  )
);
