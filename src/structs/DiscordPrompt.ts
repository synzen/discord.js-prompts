import { Prompt, PromptCollector, Rejection } from "prompt-anything";
import { EventEmitter } from 'events'
import { DiscordChannel } from "./DiscordChannel";
import { MessageFormat } from "./MessageFormat";

export type BaseData = {
  authorID?: string;
}

export class DiscordPrompt<T extends BaseData> extends Prompt<T> {
  static inactivityFormat: MessageFormat = {
    text: 'Menu has been closed due to inactivity.'
  }
  static getRejectFormat (error: Rejection): MessageFormat {
    return {
      text: error.message
    }
  }

  createCollector(channel: DiscordChannel, data: T): PromptCollector<T> {
    const discordChannel = channel
    const emitter: PromptCollector<T> = new EventEmitter()
    const collector = discordChannel.channel.createMessageCollector(m => m.author.id === data.authorID);
    collector.on('collect', async message => {
      emitter.emit('message', message)
    });
    emitter.once('stop', () => {
      collector.stop()
    })
    emitter.on('reject', (message, error) => {
      this.sendMessage(DiscordPrompt.getRejectFormat(error), channel)
        .catch(err => emitter.emit('error', err))
    })
    emitter.once('inactivity', () => {
      this.sendMessage(DiscordPrompt.inactivityFormat, channel)
        .catch(err => emitter.emit('error', err))
    })
    return emitter
  }  
}
