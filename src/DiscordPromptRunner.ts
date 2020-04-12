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

  run (phase: PromptNode<T>, channel: DiscordChannel): Promise<T>;
  run (phase: PromptNode<T>, channel: TextChannel): Promise<T>;
  run (phase: PromptNode<T>, channel: TextChannel|DiscordChannel): Promise<T> {
    if (channel instanceof DiscordChannel) {
      return super.run(phase, channel)
    } else {
      return super.run(phase, DiscordPromptRunner.convertTextChannel(channel))
    }
  }
}
