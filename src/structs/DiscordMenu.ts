import { PromptRunner, Prompt } from 'prompt-anything'
import { User, TextChannel } from 'discord.js'
import { DiscordChannel } from './DiscordChannel'

export class DiscordMenu<T> extends PromptRunner<T> {
  constructor(author: User, data: T) {
    super({
      ...data,
      authorID: author.id
    })
  }

  run (phase: Prompt<T>, channel: TextChannel): Promise<void> {
    const compatibleChannel = new DiscordChannel(channel)
    return super.run(phase, compatibleChannel)
  }
}
