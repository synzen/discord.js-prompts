import { MessageOptions } from 'discord.js'
import { FormatInterface } from "prompt-anything";
import { MenuEmbed } from "../MenuEmbed";

export class MenuEmbedFormat implements FormatInterface {
  text = ''
  menu: MenuEmbed
  options?: MessageOptions

  constructor (menu: MenuEmbed, options?: MessageOptions) {
    this.menu = menu
    this.options = options;
  }
}
