import { Message } from 'discord.js'
import { Prompt, PromptCollector, Rejection } from "prompt-anything";
import { EventEmitter } from 'events'
import { DiscordChannel } from "./DiscordChannel";
import { MessageFormat } from "./formats/MessageFormat";

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
      if (message.content === 'exit') {
        emitter.emit('exit', message)
      } else {
        emitter.emit('message', message)
      }
    });
    emitter.once('stop', () => {
      collector.stop()
    })
    return emitter
  }  
}
