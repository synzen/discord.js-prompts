import { Prompt, PromptCollector, Rejection } from "prompt-anything";
import { EventEmitter } from 'events'
import { DiscordChannel } from "./DiscordChannel";
import { MessageVisual } from "./visuals/MessageVisual";
import { MenuVisual } from './visuals/MenuVisual';
import { MenuEmbed } from './MenuEmbed';
import { Message } from "./interfaces/Message";

export type BaseData = {
  authorID: string;
}

export class DiscordPrompt<DataType> extends Prompt<DataType, Message> {
  duration = 90000
  static inactivityVisual: MessageVisual = {
    text: 'Menu has been closed due to inactivity.'
  }
  static exitVisual: MessageVisual = {
    text: 'Menu closed.'
  }
  static getRejectVisual (error: Rejection): MessageVisual {
    return {
      text: error.message
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

  createCollector(channel: DiscordChannel, data: DataType&BaseData): PromptCollector<DataType, Message> {
    const discordChannel = channel
    const emitter: PromptCollector<DataType, Message> = this.createEmitter()
    const collector = discordChannel.channel.createMessageCollector(m => m.author.id === data.authorID);
    collector.on('collect', async (message: Message) => {
      this.handleMessage(message, data, emitter)
    });
    emitter.once('stop', () => {
      collector.stop()
    })
    return emitter
  }

  handleMessage (message: Message, data: DataType, emitter: PromptCollector<DataType, Message>): void {
    // Exit
    if (message.content === 'exit') {
      emitter.emit('exit', message)
      return
    }
    // Check if MenuVisual for special handling
    const visual = this.getVisual(data)
    if (visual instanceof MenuVisual) {
      this.handleMenuMessage(message, visual.menu, emitter)
    } else {
      emitter.emit('message', message)
    }
  }
  
  handleMenuMessage (message: Message, menu: MenuEmbed, emitter: PromptCollector<DataType, Message>): void {
    if (menu.isInvalidOption(Number(message.content))) {
      emitter.emit('reject', message, new Rejection('That is an invalid option. Try again.'))
    } else {
      emitter.emit('message', message)
    }
  }
}
