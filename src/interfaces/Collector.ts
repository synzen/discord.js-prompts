import { EventEmitter } from "events";

export interface Collector extends EventEmitter {
  stop: () => void;
}
