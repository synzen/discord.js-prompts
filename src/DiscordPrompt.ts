import { Prompt, PromptCollector, Rejection, VisualGenerator, VisualInterface, PromptFunction } from "prompt-anything";
import { EventEmitter } from 'events'
import { DiscordChannel } from "./DiscordChannel";
import { MessageVisual } from "./visuals/MessageVisual";
import { MenuVisual } from './visuals/MenuVisual';
import { MenuEmbed } from './MenuEmbed';
import { Message } from 'discord.js'
import { DiscordRejection } from "./types/DiscordRejection";

export type BaseData = {
  __authorID: string;
}

export class DiscordPrompt<DataType> extends Prompt<DataType, Message> {
  // Visuals
  constructor(visualGenerator: VisualGenerator<DataType> | VisualInterface, f?: PromptFunction<DataType, Message>, duration = 90000) {
    super(visualGenerator, f, duration);
  }

  /**
   * Generate a MessageVisual to send based on the rejection thrown
   * 
   * @param error The rejection thrown
   * @param message The message that triggered the rejection
   * @param channel The channel this rejection is to be sent to
   * @param data The data from the prompt
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getRejectVisual<DataType> (error: Rejection, message?: Message, channel?: DiscordChannel, data?: DataType): Promise<MessageVisual> {
    if (error instanceof DiscordRejection) {
      return new MessageVisual(error.text, error.options)
    } else {
      return new MessageVisual(error.message)
    }
  }
  
  /**
   * Auto-generate the rejection on an invalid menu selection
   * 
   * @param message The message that triggered this rejection
   * @param data The data from the prompt
   * @param menu The MenuEmbed that this prompt's visual component was created with
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createMenuRejection<DataType> (message?: Message, data?: DataType, menu?: MenuEmbed): Rejection {
    return new Rejection('That is not a valid selection. Try again.')
  }

  // Override event
  async onReject(error: Rejection, message: Message,  channel: DiscordChannel, data: DataType): Promise<void> {
    const visual = await (this.constructor as typeof DiscordPrompt).getRejectVisual(error, message, channel, data)
    await this.sendVisual(visual, channel)
  }

  createEmitter (): EventEmitter {
    return new EventEmitter()
  }

  createCollector(channel: DiscordChannel, data: DataType&BaseData): PromptCollector<DataType, Message> {
    if (!data.__authorID) {
      throw new Error('__authorID is missing from data details. It may have been deleted within a prompt function. Make sure it is always returned in every function.')
    }
    const discordChannel = channel
    const emitter: PromptCollector<DataType, Message> = this.createEmitter()
    const collector = discordChannel.channel.createMessageCollector(m => m.author.id === data.__authorID);
    collector.on('collect', async (message: Message) => {
      /**
       * This will store only user input (because of the above filter)
       * Bot messages are stored within DiscordChannel send method
       */
      channel.storeMessages(message)
      this.handleMessage(message, data, emitter)
    });
    emitter.once('stop', () => {
      collector.stop()
    })
    return emitter
  }

  async handleMessage (message: Message, data: DataType, emitter: PromptCollector<DataType, Message>): Promise<void> {
    try {
      // Exit
      if (message.content === 'exit') {
        emitter.emit('exit')
        return
      }
      // Check if MenuVisual for special handling
      const visual = await this.getVisual(data)
      if (visual instanceof MenuVisual) {
        this.handleMenuMessage(message, data, visual.menu, emitter)
      } else {
        emitter.emit('message', message)
      }
    } catch (err) {
      emitter.emit('error', err)
    }
  }
  
  handleMenuMessage (message: Message, data: DataType, menu: MenuEmbed, emitter: PromptCollector<DataType, Message>): void {
    if (!menu.isValidSelection(message.content)) {
      const rejection = (this.constructor as typeof DiscordPrompt).createMenuRejection(message, data, menu)
      emitter.emit('reject', message, rejection)
    } else {
      emitter.emit('message', message)
    }
  }
}
