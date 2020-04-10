import { Message } from 'discord.js'
import { Prompt, PromptCollector, Rejection } from "prompt-anything";
import { EventEmitter } from 'events'
import { DiscordChannel } from "./DiscordChannel";
import { MessageVisual } from "./visuals/MessageVisual";
import { MenuVisual } from './visuals/MenuVisual';
import { MenuEmbed } from './MenuEmbed';

export type BaseData = {
  authorID?: string;
}

export class DiscordPrompt<T extends BaseData> extends Prompt<T> {
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
  async onReject(message: Message, error: Rejection, channel: DiscordChannel, data: T): Promise<void> {
    await this.sendMessage(DiscordPrompt.getRejectVisual(error), channel)
  }
  async onInactivity(channel: DiscordChannel, data: T): Promise<void> {
    await this.sendMessage(DiscordPrompt.inactivityVisual, channel)
  }
  async onExit(message: Message, channel: DiscordChannel, data: T): Promise<void> {
    await this.sendMessage(DiscordPrompt.exitVisual, channel)
  }

  createCollector(channel: DiscordChannel, data: T): PromptCollector<T> {
    const discordChannel = channel
    const emitter: PromptCollector<T> = new EventEmitter()
    const collector = discordChannel.channel.createMessageCollector(m => m.author.id === data.authorID);
    collector.on('collect', async (message: Message) => {
      this.handleMessage(message, data, emitter)
    });
    emitter.once('stop', () => {
      collector.stop()
    })
    return emitter
  }

  handleMessage (message: Message, data: T, emitter: PromptCollector<T>) {
    // Exit
    if (message.content === 'exit') {
      return emitter.emit('exit', message)
    }
    // Check if MenuVisual for special handling
    const visual = this.getVisual(data)
    if (visual instanceof MenuVisual) {
      this.handleMenuMessage(message, visual.menu, emitter)
    } else {
      emitter.emit('message', message)
    }
  }
  
  handleMenuMessage (message: Message, menu: MenuEmbed, emitter: PromptCollector<T>) {
    if (menu.isInvalidOption(Number(message.content))) {
      emitter.emit('reject', message, new Rejection('That is an invalid option. Try again.'))
    } else {
      emitter.emit('message', message)
    }
  }
}
