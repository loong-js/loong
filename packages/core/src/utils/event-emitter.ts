type Event = (...args: any[]) => void;

export class EventEmitter {
  private events: Event[] = [];

  add(event: Event) {
    this.events.push(event);
  }

  emit(...args: any[]) {
    return this.events.map((event) => event(...args));
  }

  clear() {
    this.events = [];
  }
}
