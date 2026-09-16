const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://quickbite-backend-sknz.onrender.com/api';

export interface OrderSocketEvent {
  type: 'ORDER_PLACED' | 'ORDER_STATUS_CHANGED' | 'DELIVERY_CLAIMED' | 'ORDER_CANCELLED';
  orderId: string;
  orderNumber?: string;
  status: string;
  message: string;
  userId?: string;
  roleTarget?: string[];
  timestamp?: string;
}

export interface ChatSocketMessage {
  type: 'CHAT_MESSAGE';
  orderId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  recipientRole?: string;
  message: string;
  createdAt: string;
}

type EventCallback = (event: OrderSocketEvent) => void;
type ChatCallback = (message: ChatSocketMessage) => void;
type ToastCallback = (options: { type: 'order' | 'info' | 'success' | 'warning' | 'error'; title: string; message: string }) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private role: string | null = null;
  private listeners: Set<EventCallback> = new Set();
  private chatListeners: Set<ChatCallback> = new Set();
  private toastHandler: ToastCallback | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 3000;
  private isExplicitlyClosed = false;

  public setToastHandler(handler: ToastCallback | null) {
    this.toastHandler = handler;
  }

  public connect(userId: string, role: string) {
    this.userId = userId;
    this.role = role;
    this.isExplicitlyClosed = false;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      this.sendRegister();
      return;
    }

    this.initSocket();
  }

  private getSocketUrl(): string {
    let url = API_BASE.replace(/\/api\/?$/, '');
    if (url.startsWith('https://')) {
      url = url.replace('https://', 'wss://');
    } else if (url.startsWith('http://')) {
      url = url.replace('http://', 'ws://');
    } else {
      url = `ws://${url}`;
    }
    return url;
  }

  private initSocket() {
    if (this.isExplicitlyClosed) return;

    try {
      const wsUrl = this.getSocketUrl();
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectDelay = 3000;
        this.sendRegister();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'CONNECTED' || data.type === 'REGISTERED' || data.type === 'PONG') return;

          if (data.type === 'CHAT_MESSAGE') {
            const chatMsg = data as ChatSocketMessage;
            this.chatListeners.forEach((cb) => { try { cb(chatMsg); } catch { /* noop */ } });

            if (this.toastHandler && chatMsg.message) {
              const roleTitle = chatMsg.senderRole === 'delivery_man' ? 'Delivery Hero'
                : chatMsg.senderRole === 'shopkeeper' ? 'Kitchen' : 'Customer';
              this.toastHandler({
                type: 'info',
                title: `${chatMsg.senderName || roleTitle} (Order #${chatMsg.orderId.slice(-6).toUpperCase()})`,
                message: chatMsg.message,
              });
            }
            return;
          }

          const validOrderTypes = ['ORDER_PLACED', 'ORDER_STATUS_CHANGED', 'DELIVERY_CLAIMED', 'ORDER_CANCELLED'];
          if (!validOrderTypes.includes(data.type)) return;

          const orderEvent = data as OrderSocketEvent;

          if (this.toastHandler && orderEvent.message) {
            let toastType: 'order' | 'info' | 'success' | 'warning' | 'error' = 'order';
            let title = 'Order Update';

            if (orderEvent.type === 'ORDER_PLACED') { toastType = 'order'; title = `New Order #${orderEvent.orderNumber || ''}`; }
            else if (orderEvent.status === 'Delivered') { toastType = 'success'; title = `Order #${orderEvent.orderNumber || ''} Delivered!`; }
            else if (orderEvent.type === 'ORDER_CANCELLED') { toastType = 'warning'; title = `Order Cancelled #${orderEvent.orderNumber || ''}`; }
            else if (orderEvent.type === 'DELIVERY_CLAIMED') { toastType = 'info'; title = 'Delivery Hero Assigned'; }

            this.toastHandler({ type: toastType, title, message: orderEvent.message });
          }

          this.listeners.forEach((cb) => { try { cb(orderEvent); } catch { /* noop */ } });
        } catch { /* noop */ }
      };

      this.ws.onerror = () => { /* silent */ };

      this.ws.onclose = () => {
        this.ws = null;
        if (!this.isExplicitlyClosed) this.scheduleReconnect();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private sendRegister() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.userId) {
      this.ws.send(JSON.stringify({ type: 'REGISTER', userId: this.userId, role: this.role || 'customer' }));
    }
  }

  private scheduleReconnect() {
    if (this.isExplicitlyClosed) return;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
      this.initSocket();
    }, this.reconnectDelay);
  }

  public subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public subscribeChat(callback: ChatCallback): () => void {
    this.chatListeners.add(callback);
    return () => this.chatListeners.delete(callback);
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      try { this.ws.close(); } catch { /* noop */ }
      this.ws = null;
    }
    this.userId = null;
    this.role = null;
  }
}

export const wsService = new WebSocketService();
