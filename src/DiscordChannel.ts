import { TextChannel, MessageOptions } from "discord.js";
import { ChannelInterface, MessageInterface } from "prompt-anything";
import { DiscordVisual } from "./visuals/DiscordVisual";
import { MenuVisual } from "./visuals/MenuVisual";
import { MessageVisual } from "./visuals/MessageVisual";

export class DiscordChannel implements ChannelInterface {
  channel: TextChannel;
  
  constructor (channel: TextChannel) {
    this.channel = channel
  }

  async sendMenuVisual (visual: MenuVisual) {
    let options: MessageOptions = {}
    if (visual.options) {
      options = {
        ...visual.options
      }
    }
    options.embed = visual.menu.embed
    const sent = await this.channel.send('', options)
    await visual.menu.setUpPagination(sent)
    return sent
  }

  async sendMessageVisual (visual: MessageVisual) {
    return this.channel.send(visual.text, visual.options)
  }

  async send (visual: DiscordVisual): Promise<MessageInterface> {
    if (visual instanceof MenuVisual) {
      return this.sendMenuVisual(visual)
    } else {
      return this.sendMessageVisual(visual)
    }
  }
  
}