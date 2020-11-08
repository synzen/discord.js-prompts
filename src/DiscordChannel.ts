import { ChannelInterface } from "prompt-anything";
import { DiscordVisual } from "./visuals/DiscordVisual";
import { MenuVisual } from "./visuals/MenuVisual";
import { MessageVisual } from "./visuals/MessageVisual";
import { Message, MessageOptions, TextChannel } from 'discord.js'
import { MenuEmbed } from "./MenuEmbed";

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
  storeMessages (message: Message|Message[]): void {
    if (Array.isArray(message)) {
      message.forEach(m => this.messages.push(m))
    } else {
      this.messages.push(message)
    }
  }

  /**
   * Set up a menu embed on a message response
   * @param menuEmbed What menu to set up
   * @param messageResponse The message to set the menu up on
   */
  private async trySetupPagination (menuEmbed: MenuEmbed, messageResponse: Message|Message[]) {
    if (Array.isArray(messageResponse) && messageResponse.length > 1) {
      throw new Error('Pagination with multiple messages sent with one call. Disabling message splitting may resolve this.')
    }
    const toPaginate = Array.isArray(messageResponse) ? messageResponse[0] : messageResponse
    await menuEmbed.setUpPagination(toPaginate)
  }

  async sendMenuVisual (visual: MenuVisual): Promise<Message|Message[]> {
    let options: MessageOptions = {}
    if (visual.options) {
      options = {
        ...visual.options
      }
    }
    options.embed = visual.menu.getEmbedOfPage(0)
    const sent = await this.channel.send('', options)
    if (visual.menu.canPaginate()) {
      await this.trySetupPagination(visual.menu, sent)
    }
    return sent
  }

  async sendMessageVisual (visual: MessageVisual): Promise<Message|Message[]> {
    const options = {
      ...visual.options
    }
    return this.channel.send(visual.text, options)
  }

  async send (visual: DiscordVisual): Promise<Message|Message[]> {
    if (visual instanceof MenuVisual) {
      const sent = await this.sendMenuVisual(visual)
      this.storeMessages(sent)
      return sent
    } else if (visual instanceof MessageVisual) {
      const sent = await this.sendMessageVisual(visual)
      this.storeMessages(sent)
      return sent
    } else {
      throw new TypeError('Invalid visual format, must be MenuVisual or MessageVisual')
    }
  }
  
}
