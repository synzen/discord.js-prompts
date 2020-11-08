import { MessageOptions } from "discord.js";
import { Rejection } from "prompt-anything";

export class DiscordRejection extends Rejection {
  options?: MessageOptions;
  text: string;

  /**
   * @param text Text to send
   * @param options Message options which can include an embed
   */
  constructor(text: string, options?: MessageOptions) {
    super()
    this.options = options;
    this.text = text;
  }
}
