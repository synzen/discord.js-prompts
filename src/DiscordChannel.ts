import { ChannelInterface } from "prompt-anything";
import { DiscordVisual } from "./visuals/DiscordVisual";
import { MenuVisual } from "./visuals/MenuVisual";
import { MessageVisual } from "./visuals/MessageVisual";
import { Message, MessageOptions, TextChannel } from 'discord.js'

export class DiscordChannel implements ChannelInterface<Message> {
  id: string;
  channel: TextChannel;
  messages: Message[] = []
  
  constructor (channel: TextChannel) {
    this.id = channel.id
    this.channel = channel
  }

  /**
   * Store all messages sent within this channel
   * @param message Message to store
   */
  storeMessage (message: Message): void {
    this.messages.push(message)
  }

  async sendMenuVisual (visual: MenuVisual): Promise<Message> {
    let options: MessageOptions = {}
    if (visual.options) {
      options = {
        ...visual.options
      }
    }
    options.embed = visual.menu.getEmbedOfPage(0)
    const sent = await this.channel.send('', options)
    if (visual.menu.canPaginate()) {
      await visual.menu.setUpPagination(sent)
    }
    return sent
  }

  async sendMessageVisual (visual: MessageVisual): Promise<Message> {
    return this.channel.send(visual.text, visual.options)
  }

  async send (visual: DiscordVisual): Promise<Message> {
    if (visual instanceof MenuVisual) {
      return this.sendMenuVisual(visual)
    } else if (visual instanceof MessageVisual) {
      return this.sendMessageVisual(visual)
    } else {
      throw new TypeError('Invalid visual format, must be MenuVisual or MessageVisual')
    }
  }
  
}
