import { MessageOptions } from 'discord.js'
import { FormatInterface } from "prompt-anything";

export class MessageFormat implements FormatInterface {
  text: string;
  options?: MessageOptions

  constructor (text: string, options?: MessageOptions) {
    this.text = text
    this.options = options;
  }
}
