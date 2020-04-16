import { VisualInterface } from "prompt-anything";
import { MessageOptions } from 'discord.js'

export class MessageVisual implements VisualInterface {
  text: string;
  options?: MessageOptions

  constructor (text: string, options?: MessageOptions) {
    this.text = text
    this.options = options;
  }
}
