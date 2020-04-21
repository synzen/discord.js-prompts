import { Message, MessageReaction, MessageEmbed } from 'discord.js'

type MenuEmbedSettings = {
  /**
   * Maximum number of fields/options per page
   */
  maxPerPage?: number;
  /**
   * Miliseconds until reactions are no longer accepted on
   * paginated embeds
   */
  paginationTimeout?: number;
  /**
   * Allow multiple options to be selected (comma-separated)
   */
  multiSelect?: boolean;
}

type MenuEmbedOption = {
  /**
   * Name of the option
   */
  name: string;
  /**
   * Description of the option
   */
  description?: string;
}

export class MenuEmbed  {
  embed = new MessageEmbed()
  options: Array<MenuEmbedOption> = []
  /**
   * The current page
   */
  page = 0
  /**
   * If defined, enable pagination and handle errors when
   * the menu fails to set up pagination (when message
   * edits or reactions fail)
   */
  paginationErrorHandler?: (error: Error, message: Message) => void
  paginationTimeout = 90000
  maxPerPage = 5
  multiSelect = false

  constructor (embed?: MessageEmbed, settings: MenuEmbedSettings = {}) {
    if (embed) {
      this.embed = embed
    }
    if (settings.maxPerPage !== undefined) {
      this.maxPerPage = settings.maxPerPage
    }
    if (settings.paginationTimeout !== undefined) {
      this.paginationTimeout = settings.paginationTimeout
    }
    if (settings.multiSelect !== undefined) {
      this.multiSelect = settings.multiSelect
    }
  }

  /**
   * Enable pagination by defining an error handler for
   * when the menu fails to set up pages (when message
   * edits or reactions fail)
   * 
   * @param errorHandler Error handler 
   */
  enablePagination (errorHandler: (error: Error, message: Message) => void): this {
    this.paginationErrorHandler = errorHandler
    return this
  }

  /**
   * Add an auto-numbered field
   * 
   * @param name Name of option
   * @param description Description of optino
   */
  addOption (name: string, description = '\u200b'): this {
    const count = this.numberOfOptions()
    this.options.push({
      name: `${count + 1}) ${name}`,
      description
    })
    return this
  }

  /**
   * Return the number of options this embed has
   */
  numberOfOptions (): number {
    return this.options.length
  }

  /**
   * Returns whether a number is out of range for the
   * options of this menu
   * 
   * @param number Option number
   */
  isValidOption (number: number): boolean {
    if (isNaN(number)) {
      return false
    }
    return number <= this.numberOfOptions() && number > 0
  }

  /**
   * Returns if a message content correctly identifies
   * an option of this menu
   * 
   * @param content Message content
   */
  isValidSelection (content: string): boolean {
    if (!this.multiSelect) {
      return this.isValidOption(Number(content))
    } else {
      const numbers = content.split(',').map(val => Number(val))
      return numbers.every(val => this.isValidOption(val))
    }
  }

  /**
   * Check if the current page is the last page
   */
  isOnLastPage (): boolean {
    return this.maxPerPage * (this.page + 1) >= this.numberOfOptions()
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
    // toJSON must be used, it fails otherwise for some reason
    await message.edit('', {
      embed: this.getEmbedOfPage(this.page).toJSON()
    })
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
      this.paginationErrorHandler(err, message)
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
    const errorHandler = this.paginationErrorHandler
    const filter = (r: MessageReaction): boolean => {
      return r.emoji.name === '◀' || r.emoji.name === '▶'
    }
    const collector = message.createReactionCollector(filter, {
      time: this.paginationTimeout
    })
    collector.on('collect', (reaction, user) => {
      if (user.bot) {
        return
      }
      const name = reaction.emoji.name
      if (name === '◀') {
        this.prevPage(message).catch(err => {
          errorHandler(err, message)
        })
      } else if (name === '▶') {
        this.nextPage(message).catch(err => {
          errorHandler(err, message)
        })
      }
    })
  }

  /**
   * Get the options of a page
   * 
   * @param page
   */
  getOptionsOfPage (page: number): Array<MenuEmbedOption> {
    if (!this.maxPerPage) {
      return this.options
    }
    const startField = page * this.maxPerPage
    return this.options.slice(startField, startField + this.maxPerPage)
  }

  /**
   * Get the embed that corresponds to a page number
   * 
   * @param page
   */
  getEmbedOfPage (page: number): MessageEmbed {
    const newEmbed = new MessageEmbed(this.embed)
    const options = this.getOptionsOfPage(page)
    for (const option of options) {
      newEmbed.addField(option.name, option.description)
    }
    return newEmbed
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
