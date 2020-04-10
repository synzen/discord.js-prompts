import { Message } from 'discord.js'
import { Prompt, PromptCollector, Rejection } from "prompt-anything";
import { EventEmitter } from 'events'
import { DiscordChannel } from "./DiscordChannel";
import { MessageFormat } from "./formats/MessageFormat";
import { MenuEmbedFormat } from './formats/MenuFormat';
import { MenuEmbed } from './MenuEmbed';

export type BaseData = {
  authorID?: string;
}

export class DiscordPrompt<T extends BaseData> extends Prompt<T> {
  duration = 90000
  static inactivityFormat: MessageFormat = {
    text: 'Menu has been closed due to inactivity.'
  }
  static exitFormat: MessageFormat = {
    text: 'Menu closed.'
  }
  static getRejectFormat (error: Rejection): MessageFormat {
    return {
      text: error.message
    }
  }
  async onReject(message: Message, error: Rejection, channel: DiscordChannel, data: T): Promise<void> {
    await this.sendMessage(DiscordPrompt.getRejectFormat(error), channel)
  }
  async onInactivity(channel: DiscordChannel, data: T): Promise<void> {
    await this.sendMessage(DiscordPrompt.inactivityFormat, channel)
  }
  async onExit(message: Message, channel: DiscordChannel, data: T): Promise<void> {
    await this.sendMessage(DiscordPrompt.exitFormat, channel)
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
    // Check if MenuEmbedFormat for special handling
    const format = this.getFormat(data)
    if (format instanceof MenuEmbedFormat) {
      this.handleMenuMessage(message, format.menu, emitter)
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
