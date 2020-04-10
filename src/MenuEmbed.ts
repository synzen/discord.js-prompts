import { MessageEmbed, Message, TextChannel, MessageReaction } from 'discord.js'

type MenuEmbedSettings = {
  maxPerPage: number
}

export class MenuEmbed {
  text = ''
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
    if (isNaN(number)) {
      return true
    }
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
   * Increment the page and update the message if the
   * current page is not the last
   */
  async nextPage (message: Message) {
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
  async prevPage (message: Message) {
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
  async setMessage (message: Message) {
    await message.edit(this.getEmbedOfPage(this.page))
  }

  /**
   * Sets up pagination on a message
   * 
   * @param message Channel to send to
   */
  async setUpPagination (message: Message) {
    if (this.spansMultiplePages()) {
      await message.react('◀')
      await message.react('▶')
      this.createReactionCollector(message)
    }
    return message
  }

  /**
   * Collect reactions for pagination for this menu
   * 
   * @param message Message to collect reactions on
   */
  createReactionCollector (message: Message) {
    const filter = (r: MessageReaction) => r.emoji.name === '◀' || r.emoji.name === '▶'
    const collector = message.createReactionCollector(filter, {
      time: 90000
    })
    collector.on('collect', (reaction) => {
      const name = reaction.emoji.name
      if (name === '◀') {
        this.prevPage(message)
      } else {
        this.nextPage(message)
      }
    })
  }

  /**
   * Get the embed that corresponds to a page number
   * 
   * @param page
   */
  getEmbedOfPage (page: number) {
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
  spansMultiplePages () {
    if (!this.maxPerPage) {
      return false
    }
    return this.embed.fields.length / this.maxPerPage > 1
  }
}
