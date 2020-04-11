import { User } from "./User";
import { MessageEmbed } from "./MessageEmbed";
import { MessageReaction } from "./MessageReaction";
import { Collector } from "./Collector";
import { MessageInterface } from "prompt-anything";

export interface Message extends MessageInterface {
  content: string;
  author: User;
  edit: (text?: string, embed?: MessageEmbed) => Promise<Message>;
  react: (reaction: string) => Promise<MessageReaction>;
  createReactionCollector: (filter: (reaction: MessageReaction) => boolean, options?: any) => Collector;
}
