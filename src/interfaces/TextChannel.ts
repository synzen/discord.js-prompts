import { Message } from "./Message";
import { MessageOptions } from "./MessageOptions";
import { Collector } from "./Collector";

export interface TextChannel {
  id: string;
  send: (text: string, options?: MessageOptions) => Promise<Message>;
  createMessageCollector: (filter: (m: Message) => boolean) => Collector;
}
