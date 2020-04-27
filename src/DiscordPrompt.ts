import { Prompt, PromptCollector, Rejection } from "prompt-anything";
import { EventEmitter } from 'events'
import { DiscordChannel } from "./DiscordChannel";
import { MessageVisual } from "./visuals/MessageVisual";
import { MenuVisual } from './visuals/MenuVisual';
import { MenuEmbed } from './MenuEmbed';
import { Message } from 'discord.js'

export type BaseData = {
  __authorID: string;
}

export class DiscordPrompt<DataType> extends Prompt<DataType, Message> {
  duration = 90000
  // Visuals
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getInactivityVisual<DataType> (channel?: DiscordChannel, data?: DataType): Promise<MessageVisual> {
    return new MessageVisual('Menu closed due to inactivity.')
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getExitVisual<DataType> (message?: Message, channel?: DiscordChannel, data?: DataType): Promise<MessageVisual> {
    return new MessageVisual('Menu closed.')
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getRejectVisual<DataType> (error: Rejection, message?: Message, channel?: DiscordChannel, data?: DataType): Promise<MessageVisual> {
    return new MessageVisual(error.message)
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createMenuRejection<DataType> (message?: Message, data?: DataType, menu?: MenuEmbed): Rejection {
    return new Rejection('That is an invalid option. Try again.')
  }

  // Override events
  async onReject(error: Rejection, message: Message,  channel: DiscordChannel, data: DataType): Promise<void> {
    const visual = await (this.constructor as typeof DiscordPrompt).getRejectVisual(error, message, channel, data)
    await this.sendVisual(visual, channel)
  }
  async onInactivity(channel: DiscordChannel, data: DataType): Promise<void> {
    const visual = await (this.constructor as typeof DiscordPrompt).getInactivityVisual(channel, data)
    await this.sendVisual(visual, channel)
  }
  async onExit(message: Message, channel: DiscordChannel, data: DataType): Promise<void> {
    const visual = await (this.constructor as typeof DiscordPrompt).getExitVisual(message, channel, data)
    await this.sendVisual(visual, channel)
  }

  createEmitter (): EventEmitter {
    return new EventEmitter()
  }

  createCollector(channel: DiscordChannel, data: DataType&BaseData): PromptCollector<DataType, Message> {
    const discordChannel = channel
    const emitter: PromptCollector<DataType, Message> = this.createEmitter()
    const collector = discordChannel.channel.createMessageCollector(m => m.author.id === data.__authorID);
    collector.on('collect', async (message: Message) => {
      /**
       * This will store only user input (because of the above filter)
       * Bot messages are stored within DiscordChannel send method
       */
      channel.storeMessage(message)
      this.handleMessage(message, data, emitter)
    });
    emitter.once('stop', () => {
      collector.stop()
    })
    return emitter
  }

  async handleMessage (message: Message, data: DataType, emitter: PromptCollector<DataType, Message>): Promise<void> {
    try {
      // Exit
      if (message.content === 'exit') {
        emitter.emit('exit', message)
        return
      }
      // Check if MenuVisual for special handling
      const visual = await this.getVisual(data)
      if (visual instanceof MenuVisual) {
        this.handleMenuMessage(message, data, visual.menu, emitter)
      } else {
        emitter.emit('message', message)
      }
    } catch (err) {
      emitter.emit('error', err)
    }
  }
  
  handleMenuMessage (message: Message, data: DataType, menu: MenuEmbed, emitter: PromptCollector<DataType, Message>): void {
    if (!menu.isValidSelection(message.content)) {
      const rejection = (this.constructor as typeof DiscordPrompt).createMenuRejection(message, data, menu)
      emitter.emit('reject', message, rejection)
    } else {
      emitter.emit('message', message)
    }
  }
}
