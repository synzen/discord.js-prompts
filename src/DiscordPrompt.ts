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
  static inactivityVisual: MessageVisual = new MessageVisual('Menu closed due to inactivity.')
  static exitVisual: MessageVisual = new MessageVisual('Menu closed.')
  static getRejectVisual (error: Rejection): MessageVisual {
    return new MessageVisual(error.message)
  }
  static storeMessage<DataType extends BaseData> (message: Message, data: DataType, channel: DiscordChannel): void {
    const { author, client } = message
    const { __authorID } = data
    if (author.id === __authorID || (client.user && client.user.id === author.id)) {
      channel.storeMessage(message)
    }
  }
  async onReject(message: Message, error: Rejection, channel: DiscordChannel): Promise<void> {
    await this.sendVisual(DiscordPrompt.getRejectVisual(error), channel)
  }
  async onInactivity(channel: DiscordChannel): Promise<void> {
    await this.sendVisual(DiscordPrompt.inactivityVisual, channel)
  }
  async onExit(message: Message, channel: DiscordChannel): Promise<void> {
    await this.sendVisual(DiscordPrompt.exitVisual, channel)
  }

  createEmitter (): EventEmitter {
    return new EventEmitter()
  }

  createCollector(channel: DiscordChannel, data: DataType&BaseData): PromptCollector<DataType> {
    const discordChannel = channel
    const emitter: PromptCollector<DataType> = this.createEmitter()
    const collector = discordChannel.channel.createMessageCollector(m => m.author.id === data.__authorID);
    collector.on('collect', async (message: Message) => {
      DiscordPrompt.storeMessage(message, data, channel)
      this.handleMessage(message, data, emitter)
    });
    emitter.once('stop', () => {
      collector.stop()
    })
    return emitter
  }

  async handleMessage (message: Message, data: DataType, emitter: PromptCollector<DataType>): Promise<void> {
    try {
      // Exit
      if (message.content === 'exit') {
        emitter.emit('exit', message)
        return
      }
      // Check if MenuVisual for special handling
      const visual = await this.getVisual(data)
      if (visual instanceof MenuVisual) {
        this.handleMenuMessage(message, visual.menu, emitter)
      } else {
        emitter.emit('message', message)
      }
    } catch (err) {
      emitter.emit('error', err)
    }
  }
  
  handleMenuMessage (message: Message, menu: MenuEmbed, emitter: PromptCollector<DataType>): void {
    if (!menu.isValidSelection(message.content)) {
      emitter.emit('reject', message, new Rejection('That is an invalid option. Try again.'))
    } else {
      emitter.emit('message', message)
    }
  }
}
