import { MessageOptions } from 'discord.js'
import { VisualInterface } from "prompt-anything";
import { MenuEmbed } from "../MenuEmbed";

export class MenuFormat implements VisualInterface {
  text = ''
  menu: MenuEmbed
  options?: MessageOptions

  constructor (menu: MenuEmbed, options?: MessageOptions) {
    this.menu = menu
    this.options = options;
  }
}
