import { PromptRunner, PromptNode } from 'prompt-anything'
import { DiscordChannel } from './DiscordChannel'
import { TextChannel } from './types/TextChannel'
import { User } from './types/User'

export class DiscordPromptRunner<T> extends PromptRunner<T> {
  constructor(author: User, data: T) {
    super({
      ...data,
      authorID: author.id
    })
  }

  static convertTextChannel (channel: TextChannel): DiscordChannel {
    return new DiscordChannel(channel)
  }

  runDiscord (phase: PromptNode<T>, channel: TextChannel): Promise<T> {
    const compatibleChannel = DiscordPromptRunner.convertTextChannel(channel)
    return this.run(phase, compatibleChannel)
  }
}
