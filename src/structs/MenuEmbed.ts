import { MessageEmbed } from 'discord.js'

type MenuEmbedSettings = {
  maxPerPage: number
}

export class MenuEmbed {
  embed: MessageEmbed
  /**
   * Maximum number of fields per page
   */
  maxPerPage = 5
  /**
   * The current page
   */
  page = 0

  constructor (embed = new MessageEmbed(), settings?: MenuEmbedSettings) {
    this.embed = embed
    if (settings?.maxPerPage) {
      this.maxPerPage = settings?.maxPerPage
    }
  }

  /**
   * Add an auto-numbered field
   * 
   * @param name Name of option
   * @param description Description of optino
   */
  addOption (name: string, description: string) {
    const count = this.embed.fields.length
    this.embed.addField(`${count + 1}) ${name}`, description)
    return this
  }

  /**
   * Returns whether a number is out of range for the
   * options of this menu
   * 
   * @param number Option number
   */
  isInvalidOption (number: number) {
    return number > this.embed.fields.length || number <= 0
  }

  /**
   * Set the title of the embed
   * 
   * @param title 
   */
  setTitle (title: string) {
    this.embed.setTitle(title)
    return this
  }

  /**
   * Set the author of the embed
   * 
   * @param name 
   * @param icon 
   * @param url 
   */
  setAuthor (name: string, icon?: string, url?: string) {
    this.embed.setAuthor(name, icon, url)
    return this
  }

  /**
   * Set the description of the embed
   * 
   * @param description 
   */
  setDescription (description: string) {
    this.embed.setDescription(description)
    return this
  }

  /**
   * Set the color of the embed
   * 
   * @param color Integer color
   */
  setColor (color: number) {
    this.embed.setColor(color)
    return this
  }

  /**
   * Check if the current page is the last page
   */
  isOnLastPage () {
    return this.maxPerPage * this.page >= this.embed.fields.length
  }

  /**
   * Check if the current page is the first page
   */
  isOnFirstPage () {
    return this.page === 0
  }

  /**
   * Increment the current page if it's not the last page
   */
  nextPage () {
    if (!this.isOnLastPage()) {
      ++this.page
    }
    return this
  }

  /**
   * Decrement the current page if it's not the first page
   */
  prevPage () {
    if (!this.isOnFirstPage()) {
      --this.page
    }
    return this
  }

  /**
   * Get the fields of the embed that corresponds to a page
   * number
   * 
   * @param page
   */
  getFieldsOfPage (page: number) {
    const begin = page * this.maxPerPage
    return this.embed.fields.slice(begin, begin + this.maxPerPage)
  }
}
