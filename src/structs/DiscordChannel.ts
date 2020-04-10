import { TextChannel, MessageOptions } from "discord.js";
import { ChannelInterface, MessageInterface } from "prompt-anything";
import { DiscordMessageFormat } from "./DiscordMessageFormat";
import { MenuEmbedFormat } from "./formats/MenuFormat";
import { MessageFormat } from "./formats/MessageFormat";

export class DiscordChannel implements ChannelInterface {
  channel: TextChannel;
  
  constructor (channel: TextChannel) {
    this.channel = channel
  }

  sendMenuFormat (format: MenuEmbedFormat) {
    let options: MessageOptions
    if (format.options) {
      options = {
        ...format.options
      }
    }
    return this.channel.send(format.text, format.menu?.getEmbedOfPage(0))
  }

  sendMessageFormat (format: MessageFormat) {
    return this.channel.send(format.text, format.options)
  }

  send (format: DiscordMessageFormat): Promise<MessageInterface> {
    if (format instanceof MenuEmbedFormat) {
      return this.sendMenuFormat(format)
    } else {
      return this.sendMessageFormat(format)
    }
  }
  
}
