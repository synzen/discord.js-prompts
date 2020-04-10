import { TextChannel, MessageOptions } from "discord.js";
import { ChannelInterface, MessageInterface } from "prompt-anything";
import { DiscordMessageFormat } from "./DiscordMessageFormat";
import { MenuFormat } from "./formats/MenuFormat";
import { MessageFormat } from "./formats/MessageFormat";

export class DiscordChannel implements ChannelInterface {
  channel: TextChannel;
  
  constructor (channel: TextChannel) {
    this.channel = channel
  }

  async sendMenuFormat (format: MenuFormat) {
    let options: MessageOptions = {}
    if (format.options) {
      options = {
        ...format.options
      }
    }
    options.embed = format.menu.embed
    const sent = await this.channel.send('', options)
    await format.menu.setUpPagination(sent)
    return sent
  }

  async sendMessageFormat (format: MessageFormat) {
    return this.channel.send(format.text, format.options)
  }

  async send (format: DiscordMessageFormat): Promise<MessageInterface> {
    if (format instanceof MenuFormat) {
      return this.sendMenuFormat(format)
    } else {
      return this.sendMessageFormat(format)
    }
  }
  
}
