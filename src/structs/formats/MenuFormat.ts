import { MessageOptions } from 'discord.js'
import { FormatInterface } from "prompt-anything";
import { MenuEmbed } from "../MenuEmbed";

export class MenuEmbedFormat implements FormatInterface {
  text = ''
  options?: MessageOptions
  menu?: MenuEmbed

  constructor (menu: MenuEmbed, options?: MessageOptions) {
    this.menu = menu
    this.options = options;
  }
}
