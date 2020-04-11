import { MessageEmbed, Message, MessageReaction } from 'discord.js'

type MenuEmbedSettings = {
  maxPerPage: number;
}

export class MenuEmbed {
  embed: MessageEmbed = new MessageEmbed()
  /**
   * Maximum number of fields per page
   */
  maxPerPage = 5
  /**
   * The current page
   */
  page = 0
  /**
   * If defined, enable pagination and handle errors when
   * the menu fails to set up pagination (when message
   * edits or reactions fail)
   */
  paginationErrorHandler?: (error: Error) => void

  constructor (embed?: MessageEmbed, settings?: MenuEmbedSettings) {
    if (embed) {
      this.embed = embed
    }
    if (settings?.maxPerPage) {
      this.maxPerPage = settings?.maxPerPage
    }
  }

  /**
   * Enable pagination by defining an error handler for
   * when the menu fails to set up pages (when message
   * edits or reactions fail)
   * 
   * @param errorHandler Error handler 
   */
  enablePagination (errorHandler: (error: Error) => void): this {
    this.paginationErrorHandler = errorHandler
    return this
  }

  /**
   * Add an auto-numbered field
   * 
   * @param name Name of option
   * @param description Description of optino
   */
  addOption (name: string, description: string): this {
    const count = this.numberOfOptions()
    this.embed.addField(`${count + 1}) ${name}`, description)
    return this
  }

  /**
   * Return the number of options this embed has
   */
  numberOfOptions (): number {
    return this.embed.fields.length
  }

  /**
   * Returns whether a number is out of range for the
   * options of this menu
   * 
   * @param number Option number
   */
  isInvalidOption (number: number): boolean {
    if (isNaN(number)) {
      return true
    }
    return number > this.numberOfOptions() || number <= 0
  }

  /**
   * Set the title of the embed
   * 
   * @param title 
   */
  setTitle (title: string): this {
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
  setAuthor (name: string, icon?: string, url?: string): this {
    this.embed.setAuthor(name, icon, url)
    return this
  }

  /**
   * Set the description of the embed
   * 
   * @param description 
   */
  setDescription (description: string): this {
    this.embed.setDescription(description)
    return this
  }

  /**
   * Set the color of the embed
   * 
   * @param color Integer color
   */
  setColor (color: number): this {
    this.embed.setColor(color)
    return this
  }

  /**
   * Check if the current page is the last page
   */
  isOnLastPage (): boolean {
    return this.maxPerPage * this.page >= this.numberOfOptions()
  }

  /**
   * Check if the current page is the first page
   */
  isOnFirstPage (): boolean {
    return this.page === 0
  }

  /**
   * Increment the page and update the message if the
   * current page is not the last
   */
  async nextPage (message: Message): Promise<this> {
    if (this.isOnLastPage()) {
      return this
    }
    ++this.page
    await this.setMessage(message)
    return this
  }

  /**
   * Decrement the page and update the message if the
   * current page is not the first
   */
  async prevPage (message: Message): Promise<this> {
    if (this.isOnFirstPage()) {
      return this
    }
    --this.page
    await this.setMessage(message)
    return this
  }
  
  /**
   * Edit a message to show the current page
   * 
   * @param message Message to update
   */
  async setMessage (message: Message): Promise<void> {
    await message.edit(this.getEmbedOfPage(this.page))
  }

  /**
   * If this menu should enable pagination
   */
  canPaginate (): boolean {
    return this.spansMultiplePages() && !!this.paginationErrorHandler
  }

  /**
   * Sets up pagination on a message
   * 
   * @param message Channel to send to
   */
  async setUpPagination (message: Message): Promise<void> {
    if (!this.paginationErrorHandler) {
      throw new TypeError('Error handler for pagination is undefined')
    }
    try {
      await message.react('◀')
      await message.react('▶')
      this.createReactionCollector(message)
    } catch (err) {
      this.paginationErrorHandler(err)
    }
  }

  /**
   * Collect reactions for pagination for this menu
   * 
   * @param message Message to collect reactions on
   */
  createReactionCollector (message: Message): void {
    if (!this.paginationErrorHandler) {
      throw new TypeError('Error handler for pagination is undefined')
    }
    const filter = (r: MessageReaction): boolean => r.emoji.name === '◀' || r.emoji.name === '▶'
    const collector = message.createReactionCollector(filter, {
      time: 90000
    })
    collector.on('collect', (reaction) => {
      const name = reaction.emoji.name
      if (name === '◀') {
        this.prevPage(message).catch(this.paginationErrorHandler)
      } else if (name === '▶') {
        this.nextPage(message).catch(this.paginationErrorHandler)
      }
    })
  }

  /**
   * Get the embed that corresponds to a page number
   * 
   * @param page
   */
  getEmbedOfPage (page: number): MessageEmbed {
    if (!this.maxPerPage) {
      return this.embed
    }
    const embed = new MessageEmbed(this.embed)
    const startField = page * this.maxPerPage
    const fields = this.embed.fields.slice(startField, startField + this.maxPerPage)
    embed.fields = fields
    return embed
  }

  /**
   * Check if the number of fields spans across multiple pages
   */
  spansMultiplePages (): boolean {
    if (!this.maxPerPage) {
      return false
    }
    return this.numberOfOptions() / this.maxPerPage > 1
  }
}
