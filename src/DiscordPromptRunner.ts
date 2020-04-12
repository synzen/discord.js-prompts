import { PromptRunner, PromptNode } from 'prompt-anything'
import { DiscordChannel } from './DiscordChannel'
import { TextChannel } from './types/TextChannel'
import { User } from './types/User'

/**
 * Runs a series of prompt nodes
 */
export class DiscordPromptRunner<T> extends PromptRunner<T> {
  constructor(author: User, data: T) {
    super({
      ...data,
      authorID: author.id
    })
  }

  /**
   * Convert a TextChannel to a DiscordChannel for
   * compatibility with prompt-anything
   * 
   * @param channel
   */
  static convertTextChannel (channel: TextChannel): DiscordChannel {
    return new DiscordChannel(channel)
  }

  run (node: PromptNode<T>, channel: DiscordChannel): Promise<T>;
  run (node: PromptNode<T>, channel: TextChannel): Promise<T>;

  /**
   * Start running prompts with the root PromptNode
   * 
   * @param node Node that contains the starting prompt
   * @param channel Discord channel to send the prompts to
   */
  run (node: PromptNode<T>, channel: TextChannel|DiscordChannel): Promise<T> {
    if (channel instanceof DiscordChannel) {
      return super.run(node, channel)
    } else {
      return super.run(node, DiscordPromptRunner.convertTextChannel(channel))
    }
  }
}
