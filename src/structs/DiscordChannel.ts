import { TextChannel } from "discord.js";
import { ChannelInterface, MessageInterface } from "prompt-anything";
import { MessageFormat } from "./MessageFormat";

export class DiscordChannel implements ChannelInterface {
  channel: TextChannel;
  
  constructor (channel: TextChannel) {
    this.channel = channel
  }

  send (format: MessageFormat): Promise<MessageInterface> {
    return this.channel.send(format.text, format.embed)
  }
  
}
