import { FormatInterface } from "prompt-anything";
import { MessageEmbed } from "discord.js";

export class MessageFormat implements FormatInterface {
  text: string;
  embed?: MessageEmbed;

  constructor (text: string, embed?: MessageEmbed) {
    this.text = text
    this.embed = embed;
  }
}
