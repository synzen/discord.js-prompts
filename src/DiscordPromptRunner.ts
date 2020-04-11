import { PromptRunner, Prompt } from 'prompt-anything'
import { User, TextChannel } from 'discord.js'
import { DiscordChannel } from './DiscordChannel'

export class DiscordPromptRunner<T> extends PromptRunner<T> {
  constructor(author: User, data: T) {
    super({
      ...data,
      authorID: author.id
    })
  }

  run (phase: Prompt<T>, channel: TextChannel): Promise<T> {
    const compatibleChannel = new DiscordChannel(channel)
    return super.run(phase, compatibleChannel)
  }
}
