import { MessageEmbed } from "discord.js";
import { Rejection } from "prompt-anything";

export class DiscordRejection extends Rejection {
  embed?: MessageEmbed;
  text: string;

  /**
   * @param text Text to send
   * @param embed Embed to send
   */
  constructor(text: string, embed?: MessageEmbed) {
    super()
    this.embed = embed;
    this.text = text;
  }
}
