import { MessageEmbed, MessageEmbedWithFields } from "./interfaces/MessageEmbed"
import { Message } from "./interfaces/Message"
import { MessageReaction } from "./interfaces/MessageReaction"


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
}

export class MenuEmbed  {
  embed: MessageEmbedWithFields = {
    fields: []
  }
  /**
   * Maximum number of fields/options per page
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
  paginationErrorHandler?: (error: Error, message: Message) => void
  /**
   * Miliseconds until reactions are no longer accepted on
   * paginated embeds
   */
  paginationTimeout = 90000

  constructor (embed?: MessageEmbed, settings?: MenuEmbedSettings) {
    if (embed) {
      this.embed = {
        fields: [],
        ...embed
      }
    }
    if (settings?.maxPerPage) {
      this.maxPerPage = settings.maxPerPage
    }
    if (settings?.paginationTimeout) {
      this.paginationTimeout = settings.paginationTimeout
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
    this.embed.fields.push({
       name: `${count + 1}) ${name}`,
       value: description
    })
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
    this.embed.title = title
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
    this.embed.author = {
      name,
      // eslint-disable-next-line @typescript-eslint/camelcase
      icon_url: icon,
      url
    }
    return this
  }

  /**
   * Set the description of the embed
   * 
   * @param description 
   */
  setDescription (description: string): this {
    this.embed.description = description
    return this
  }

  /**
   * Set the color of the embed
   * 
   * @param color Integer color
   */
  setColor (color: number): this {
    this.embed.color = color
    return this
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
    await message.edit('', {
      embed: this.getEmbedOfPage(this.page)
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
          if (this.paginationErrorHandler) {
            this.paginationErrorHandler(err, message)
          }
        })
      } else if (name === '▶') {
        this.nextPage(message).catch(err => {
          if (this.paginationErrorHandler) {
            this.paginationErrorHandler(err, message)
          }
        })
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
    const startField = page * this.maxPerPage
    const fields = this.embed.fields.slice(startField, startField + this.maxPerPage)
    return {
      ...this.embed,
      fields
    }
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
