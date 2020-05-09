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

  static DEFAULT_OPTIONS: MessageOptions = {
    allowedMentions: {
      parse: []
    }
  }

  /**
   * Store all messages sent within this channel
   * @param message Message to store
   */
  storeMessage (message: Message): void {
    this.messages.push(message)
  }

  async sendMenuVisual (visual: MenuVisual): Promise<Message> {
    let options: MessageOptions = {
      ...DiscordChannel.DEFAULT_OPTIONS
    }
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
    const options = {
      ...DiscordChannel.DEFAULT_OPTIONS,
      ...visual.options
    }
    console.log(visual.options)
    return this.channel.send(visual.text, options)
  }

  async send (visual: DiscordVisual): Promise<Message> {
    if (visual instanceof MenuVisual) {
      const sent = await this.sendMenuVisual(visual)
      this.storeMessage(sent)
      return sent
    } else if (visual instanceof MessageVisual) {
      const sent = await this.sendMessageVisual(visual)
      this.storeMessage(sent)
      return sent
    } else {
      throw new TypeError('Invalid visual format, must be MenuVisual or MessageVisual')
    }
  }
  
}
