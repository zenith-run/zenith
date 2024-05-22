import { EventEmitter as UntypedEventEmitter } from "stream";

/**
 * A strongly-typed event emitter.
 */
export interface EventEmitter<EventSet> {
  addListener(event: EventSet, listener: (...args: any[]) => void): this;
  on(event: EventSet, listener: (args: any) => void): this;
  once(event: EventSet, listener: (args: any) => void): this;
  removeListener(event: EventSet, listener: (...args: any[]) => void): this;
  off(event: EventSet, listener: (args: any) => void): this;
  removeAllListeners(event?: EventSet): this;
  setMaxListeners(n: number): this;
  getMaxListeners(): number;
  listeners(event: EventSet): Function[];
  rawListeners(event: EventSet): Function[];
  emit(event: EventSet, ...args: any[]): boolean;
  listenerCount(event: EventSet, listener?: Function): number;
  prependListener(event: EventSet, listener: (...args: any[]) => void): this;
  prependOnceListener(
    event: EventSet,
    listener: (...args: any[]) => void
  ): this;
  eventNames(): (string | symbol)[];
}

class EventEmitterImpl<EventSet> implements EventEmitter<EventSet> {
  private emitter: UntypedEventEmitter;

  constructor() {
    this.emitter = new UntypedEventEmitter();
  }

  addListener(event: EventSet, listener: (...args: any[]) => void): this {
    this.emitter.addListener(event as string | symbol, listener);
    return this;
  }

  on(event: EventSet, listener: (...args: any[]) => void): this {
    this.emitter.on(event as string | symbol, listener);
    return this;
  }

  once(event: EventSet, listener: (...args: any[]) => void): this {
    this.emitter.once(event as string | symbol, listener);
    return this;
  }

  removeListener(event: EventSet, listener: (...args: any[]) => void): this {
    this.emitter.removeListener(event as string | symbol, listener);
    return this;
  }

  off(event: EventSet, listener: (...args: any[]) => void): this {
    this.emitter.off(event as string | symbol, listener);
    return this;
  }

  removeAllListeners(event?: EventSet): this {
    if (event === undefined) {
      this.emitter.removeAllListeners();
    } else {
      this.emitter.removeAllListeners(event as string | symbol);
    }
    return this;
  }

  setMaxListeners(n: number): this {
    this.emitter.setMaxListeners(n);
    return this;
  }

  getMaxListeners(): number {
    return this.emitter.getMaxListeners();
  }

  listeners(event: EventSet): Function[] {
    return this.emitter.listeners(event as string | symbol);
  }

  rawListeners(event: EventSet): Function[] {
    return this.emitter.rawListeners(event as string | symbol);
  }

  emit(event: EventSet, ...args: any[]): boolean {
    return this.emitter.emit(event as string | symbol, ...args);
  }

  listenerCount(event: EventSet, listener?: Function): number {
    return this.emitter.listenerCount(event as string | symbol, listener);
  }

  prependListener(event: EventSet, listener: (...args: any[]) => void): this {
    this.emitter.prependListener(event as string | symbol, listener);
    return this;
  }

  prependOnceListener(
    event: EventSet,
    listener: (...args: any[]) => void
  ): this {
    this.emitter.prependOnceListener(event as string | symbol, listener);
    return this;
  }

  eventNames(): (string | symbol)[] {
    return this.emitter.eventNames();
  }
}

export function createEventEmitter<EventSet>(): EventEmitter<EventSet> {
  return new EventEmitterImpl<EventSet>();
}
