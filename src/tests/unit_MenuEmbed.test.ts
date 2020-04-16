import { MenuEmbed } from "../MenuEmbed"
import { EventEmitter } from 'events'
import { MessageEmbed, MessageEmbedWithFields } from '../interfaces/MessageEmbed'
import { Message } from 'discord.js'

async function flushPromises(): Promise<void> {
  return new Promise(resolve => {
    setImmediate(resolve);
  });
}

const generateEmbed = (fieldCount: number): MessageEmbedWithFields => {
  const embed: MessageEmbedWithFields = {
    fields: []
  }
  const field = {
    name: 'a',
    value: 'b'
  }
  for (let i = 0; i < fieldCount; ++i) {
    embed.fields.push(field)
  }
  return embed
}

describe('Unit::MenuEmbed', () => {
  let menuEmbed: MenuEmbed
  afterEach(() => {
    jest.restoreAllMocks()
  })
  beforeEach(() => {
    menuEmbed = new MenuEmbed()
  })
  describe('constructor', () => {
    it('accepts no args', () => {
      expect(menuEmbed.maxPerPage).toEqual(5)
      expect(menuEmbed.page).toEqual(0)
      expect(menuEmbed.embed.fields).toEqual([])
    })
    it('overwrites embed and settings', () => {
      const myEmbed = {
        title: 'awsdf',
        fields: [{
          name: 'adf',
          value: 'shfrg'
        }]
      }
      const menuEmbed = new MenuEmbed(myEmbed)
      expect(menuEmbed.embed).toEqual(myEmbed)
    })
    it('adds an empty fields array if it does not exist', () => {
      const myEmbed = {
        title: 'awsdf'
      }
      const maxPerPage = 10
      const menuEmbed = new MenuEmbed(myEmbed, {
        maxPerPage
      })
      expect(menuEmbed.embed).toEqual({
        ...myEmbed,
        fields: []
      })
      expect(menuEmbed.maxPerPage).toEqual(maxPerPage)
    })
    it('overwrites settings', () => {
      const maxPerPage = 10
      const paginationTimeout = 346346
      const menuEmbed = new MenuEmbed(undefined, {
        maxPerPage,
        paginationTimeout
      })
      expect(menuEmbed.maxPerPage).toEqual(maxPerPage)
      expect(menuEmbed.paginationTimeout).toEqual(paginationTimeout)
    })
  })
  describe('enablePagination', () => {
    it('defines the error handler', () => {
      const func = jest.fn()
      menuEmbed.enablePagination(func)
      expect(menuEmbed.paginationErrorHandler).toEqual(func)
    })
    it('returns this', () => {
      const func = jest.fn()
      const returned = menuEmbed.enablePagination(func)
      expect(returned).toEqual(menuEmbed)
    })
  })
  describe('addOption', () => {
    beforeEach(() => {
      jest.spyOn(menuEmbed, 'numberOfOptions')
        .mockReturnValue(-1)
    })
    it('adds the field correctly', () => {
      jest.spyOn(menuEmbed, 'numberOfOptions')
        .mockReturnValue(2)
      menuEmbed.embed = {
        fields: []
      }
      const title = 'aedsg'
      const description = 'swetr'
      menuEmbed.addOption(title, description)
      const fields = menuEmbed.embed.fields
      expect(fields).toEqual([{
        name: `3) ${title}`,
        value: description
      }])
    })
    it('returns this', () => {
      menuEmbed.embed = {
        fields: []
      }
      const returned = menuEmbed.addOption('title', 'description')
      expect(returned).toEqual(menuEmbed)
    })
    it('it uses 0 width space as description if not provided', () => {
      menuEmbed.embed = {
        fields: []
      }
      const title = 'aedsg'
      menuEmbed.addOption(title)
      const fields = menuEmbed.embed.fields
      expect(fields[0].value).toEqual('\u200b')
    })
  })
  describe('isInvalidOption', () => {
    it('returns correctly', () => {
      jest.spyOn(menuEmbed, 'numberOfOptions')
        .mockReturnValue(2)
      expect(menuEmbed.isInvalidOption(0))
        .toEqual(true)
      expect(menuEmbed.isInvalidOption(1))
        .toEqual(false)
      expect(menuEmbed.isInvalidOption(2))
        .toEqual(false)
      expect(menuEmbed.isInvalidOption(3))
        .toEqual(true)
    })
    it('returns true for NaN', () => {
      expect(menuEmbed.isInvalidOption(NaN))
        .toEqual(true)
    })
  })
  describe('setTitle', () => {
    it('sets the title', () => {
      menuEmbed.embed = {
        fields: []
      }
      const title = 'asedfrhgt'
      const returned = menuEmbed.setTitle(title)
      expect(menuEmbed.embed.title)
        .toEqual(title)
      expect(returned).toEqual(menuEmbed)
    })
  })
  describe('setAuthor', () => {
    it('sets the author', () => {
      menuEmbed.embed = {
        fields: []
      }
      const name = 'asedfrhgt'
      const icon = 'aesdtg'
      const url = 'sweyr'
      const returned = menuEmbed.setAuthor(name, icon, url)
      expect(menuEmbed.embed.author)
        .toEqual({
          name,
          // eslint-disable-next-line @typescript-eslint/camelcase
          icon_url: icon,
          url
        })
      expect(returned).toEqual(menuEmbed)
    })
    it('has optional icon and url', () => {
      menuEmbed.embed = {
        fields: []
      }
      const name = 'asedfrhgt'
      const returned = menuEmbed.setAuthor(name)
      expect(menuEmbed.embed.author)
        .toEqual({
          name,
          // eslint-disable-next-line @typescript-eslint/camelcase
          icon_url: undefined,
          url: undefined
        })
      expect(returned).toEqual(menuEmbed)
    })
  })
  describe('setDescription', () => {
    it('sets the description', () => {
      menuEmbed.embed = {
        fields: []
      }
      const desc = 'asedfrhgt'
      const returned = menuEmbed.setDescription(desc)
      expect(menuEmbed.embed.description)
        .toEqual(desc)
      expect(returned).toEqual(menuEmbed)
    })
  })
  describe('setColor', () => {
    it('sets the color', () => {
      menuEmbed.embed = {
        fields: []
      }
      const color = 2456
      const returned = menuEmbed.setColor(color)
      expect(menuEmbed.embed.color)
        .toEqual(color)
      expect(returned).toEqual(menuEmbed)
    })
  })
  describe('isOnLastPage', () => {
    it('returns correctly', () => {
      jest.spyOn(menuEmbed, 'numberOfOptions')
        .mockReturnValue(3)
      menuEmbed.maxPerPage = 2
      menuEmbed.page = 0
      expect(menuEmbed.isOnLastPage())
        .toEqual(false)
      menuEmbed.page = 1
      expect(menuEmbed.isOnLastPage())
        .toEqual(true)
      menuEmbed.page = 2
      expect(menuEmbed.isOnLastPage())
          .toEqual(true)
    })
  })
  describe('isOnFirstPage', () => {
    it('returns correctly', () => {
      menuEmbed.embed = generateEmbed(3)
      menuEmbed.page = 0
      expect(menuEmbed.isOnFirstPage())
        .toEqual(true)
      menuEmbed.page = 1
      expect(menuEmbed.isOnFirstPage())
        .toEqual(false)
    })
  })
  describe('nextPage', () => {
    beforeEach(() => {
      jest.spyOn(MenuEmbed.prototype, 'setMessage')
        .mockResolvedValue()
    })
    it('increments the page', async () => {
      const originalPage = 0
      menuEmbed.page = originalPage
      jest.spyOn(menuEmbed, 'isOnLastPage')
        .mockReturnValue(false)
      await menuEmbed.nextPage({} as Message)
      expect(menuEmbed.page).toEqual(originalPage + 1)
    })
    it('does not increment the page if on last page', async () => {
      const originalPage = 0
      menuEmbed.page = originalPage
      jest.spyOn(menuEmbed, 'isOnLastPage')
        .mockReturnValue(true)
      await menuEmbed.nextPage({} as Message)
      expect(menuEmbed.page).toEqual(originalPage)
    })
    it('returns this', async () => {
      menuEmbed.page = 0
      jest.spyOn(menuEmbed, 'isOnLastPage')
        .mockReturnValue(false)
      const returned = await menuEmbed.nextPage({} as Message)
      expect(returned).toEqual(menuEmbed)
    })
    it('calls setMessage', async () => {
      menuEmbed.page = 0
      jest.spyOn(menuEmbed, 'isOnLastPage')
        .mockReturnValue(false)
      const setMessage = jest.spyOn(menuEmbed, 'setMessage')
      await menuEmbed.nextPage({} as Message)
      expect(setMessage).toHaveBeenCalled()
    })
  })
  describe('prevPage', () => {
    beforeEach(() => {
      jest.spyOn(MenuEmbed.prototype, 'setMessage')
        .mockResolvedValue()
    })
    it('decrements the page', async () => {
      const originalPage = 1
      menuEmbed.page = originalPage
      jest.spyOn(menuEmbed, 'isOnFirstPage')
        .mockReturnValue(false)
      await menuEmbed.prevPage({} as Message)
      expect(menuEmbed.page).toEqual(originalPage - 1)
    })
    it('does not decrement the page if on first page', async () => {
      const originalPage = 1
      menuEmbed.page = originalPage
      jest.spyOn(menuEmbed, 'isOnFirstPage')
        .mockReturnValue(true)
      await menuEmbed.prevPage({} as Message)
      expect(menuEmbed.page).toEqual(originalPage)
    })
    it('returns this', async () => {
      menuEmbed.page = 0
      jest.spyOn(menuEmbed, 'isOnFirstPage')
        .mockReturnValue(false)
      const returned = await menuEmbed.prevPage({} as Message)
      expect(returned).toEqual(menuEmbed)
    })
    it('calls setMessage', async () => {
      menuEmbed.page = 0
      jest.spyOn(menuEmbed, 'isOnFirstPage')
        .mockReturnValue(false)
      const setMessage = jest.spyOn(menuEmbed, 'setMessage')
      await menuEmbed.prevPage({} as Message)
      expect(setMessage).toHaveBeenCalled()
    })
  })
  describe('setMessage', () => {
    it('edits the message', async () => {
      const edit = jest.fn()
      const message = {
        edit
      } as unknown as Message
      const embedPage = {
        a: 'b'
      } as unknown as MessageEmbed
      jest.spyOn(menuEmbed, 'getEmbedOfPage')
        .mockReturnValue(embedPage)
      await menuEmbed.setMessage(message)
      expect(edit).toHaveBeenCalledWith('', {
        embed: embedPage
      })
    })
  })
  describe('canPaginate', () => {
    it('returns correctly', () => {
      // Case 1
      jest.spyOn(menuEmbed, 'spansMultiplePages') 
        .mockReturnValue(true)
      menuEmbed.paginationErrorHandler = jest.fn()
      expect(menuEmbed.canPaginate()).toEqual(true)
      // Case 2
      jest.spyOn(menuEmbed, 'spansMultiplePages') 
        .mockReturnValue(false)
      menuEmbed.paginationErrorHandler = jest.fn()
      expect(menuEmbed.canPaginate()).toEqual(false)
      // Case 3
      jest.spyOn(menuEmbed, 'spansMultiplePages') 
        .mockReturnValue(true)
      menuEmbed.paginationErrorHandler = undefined
      expect(menuEmbed.canPaginate()).toEqual(false)
      // Case 4
      jest.spyOn(menuEmbed, 'spansMultiplePages') 
        .mockReturnValue(false)
      menuEmbed.paginationErrorHandler = undefined
      expect(menuEmbed.canPaginate()).toEqual(false)
    })
  })
  describe('setUpPagination', () => {
    it('rejects if no error handler is defined', () => {
      menuEmbed.paginationErrorHandler = undefined
      expect(menuEmbed.setUpPagination({} as Message))
        .rejects.toThrow('Error handler for pagination is undefined')
    })
    it('reacts with arrows', async () => {
      menuEmbed.paginationErrorHandler = jest.fn()
      const spy = jest.spyOn(menuEmbed, 'createReactionCollector')
        .mockReturnValue()
      const react = jest.fn()
      const message = {
        react
      } as unknown as Message
      await menuEmbed.setUpPagination(message)
      expect(react).toHaveBeenNthCalledWith(1, '◀')
      expect(react).toHaveBeenNthCalledWith(2, '▶')
      expect(spy).toHaveBeenCalled()
    })
    it('handles errors', async () => {
      const errorHandler = jest.fn()
      menuEmbed.paginationErrorHandler = errorHandler
      jest.spyOn(menuEmbed, 'createReactionCollector')
        .mockReturnValue()
      const reactError = new Error('wsgrw')
      const react = jest.fn()
        .mockRejectedValue(reactError)
      const message = {
        react
      } as unknown as Message
      await menuEmbed.setUpPagination(message)
      expect(errorHandler).toHaveBeenCalledWith(reactError, message)
    })
  })
  describe('createReactionCollector', () => {
    let collector: EventEmitter
    let message: Message
    let prevPage: jest.SpyInstance
    let nextPage: jest.SpyInstance
    beforeEach(() => {
      collector = new EventEmitter()
      message = {
        createReactionCollector: jest.fn()
          .mockReturnValue(collector)
      } as unknown as Message
      prevPage = jest.spyOn(menuEmbed, 'prevPage')
        .mockResolvedValue(menuEmbed)
      nextPage = jest.spyOn(menuEmbed, 'nextPage')
        .mockResolvedValue(menuEmbed)
      menuEmbed.paginationErrorHandler = jest.fn()
    })
    it('throws an error if no error handler is defined', () => {
      menuEmbed.paginationErrorHandler = undefined
      expect(() => menuEmbed.createReactionCollector(message))
        .toThrow('Error handler for pagination is undefined')
    })
    it('goes to prev page if ◀ emoji', async () => {
      menuEmbed.createReactionCollector(message)
      const reaction = {
        emoji: {
          name: '◀'
        }
      }
      collector.emit('collect', reaction, {})
      await flushPromises()
      expect(prevPage).toHaveBeenCalled()
      expect(nextPage).not.toHaveBeenCalled()
    })
    it('goes to next page if ▶ emoji', async () => {
      menuEmbed.createReactionCollector(message)
      const reaction = {
        emoji: {
          name: '▶'
        }
      }
      collector.emit('collect', reaction, {})
      await flushPromises()
      expect(prevPage).not.toHaveBeenCalled()
      expect(nextPage).toHaveBeenCalled()
    })
    it('ignores other emojis', async () => {
      menuEmbed.createReactionCollector(message)
      const reaction = {
        emoji: {
          name: 'srdfehy'
        }
      }
      collector.emit('collect', reaction, {})
      await flushPromises()
      expect(prevPage).not.toHaveBeenCalled()
      expect(nextPage).not.toHaveBeenCalled()
    })
    it('ignores the bot reaction', async () => {
      menuEmbed.createReactionCollector(message)
      const reaction = {
        emoji: {
          name: '▶'
        }
      }
      collector.emit('collect', reaction, { bot: true })
      await flushPromises()
      expect(prevPage).not.toHaveBeenCalled()
      expect(nextPage).not.toHaveBeenCalled()
    })
    it('handles errors for next page', async () => {
      menuEmbed.createReactionCollector(message)
      const reaction = {
        emoji: {
          name: '▶'
        }
      }
      const error = new Error('sedgrwf')
      nextPage.mockRejectedValue(error)
      collector.emit('collect', reaction, {})
      await flushPromises()
      expect(menuEmbed.paginationErrorHandler)
        .toHaveBeenCalledWith(error, message)
    })
    it('handles errors for prev page', async () => {
      menuEmbed.createReactionCollector(message)
      const reaction = {
        emoji: {
          name: '◀'
        }
      }
      const error = new Error('sedgrwf')
      prevPage.mockRejectedValue(error)
      collector.emit('collect', reaction, {})
      await flushPromises()
      expect(menuEmbed.paginationErrorHandler)
        .toHaveBeenCalledWith(error, message)
    })
  })
  describe('getEmbedOfPage', () => {
    it('returns the full embed if no max per page', () => {
      menuEmbed.maxPerPage = 0
      const embed = generateEmbed(11)
      menuEmbed.embed = embed
      expect(menuEmbed.getEmbedOfPage(2))
        .toEqual(embed)
    })
    it('returns the right embed', () => {
      menuEmbed.maxPerPage = 2
      const embed = {
        title: 'foo',
        fields: [{
          name: 'name1',
          value: 'value1'
        }, {
          name: 'name2',
          value: 'value2'
        }, {
          name: 'name1',
          value: 'value3'
        }, {
          name: 'name4',
          value: 'value4'
        }, {
          name: 'name5',
          value: 'value5'
        }]
      }
      const firstPage = {
        title: 'foo',
        fields: [embed.fields[0], embed.fields[1]]
      }
      const secondPage = {
        title: 'foo',
        fields: [embed.fields[2], embed.fields[3]]
      }
      const thirdPage = {
        title: 'foo',
        fields: [embed.fields[4]]
      }
      menuEmbed.embed = embed
      expect(menuEmbed.getEmbedOfPage(0))
        .toEqual(expect.objectContaining(firstPage))
      expect(menuEmbed.getEmbedOfPage(1))
        .toEqual(expect.objectContaining(secondPage))
      expect(menuEmbed.getEmbedOfPage(2))
        .toEqual(expect.objectContaining(thirdPage))
    })
  })
  describe('spansMultiplePages', () => {
    it('returns correctly', () => {
      jest.spyOn(menuEmbed, 'numberOfOptions')
        .mockReturnValue(11)
      menuEmbed.maxPerPage = 3
      expect(menuEmbed.spansMultiplePages())
        .toEqual(true)
      menuEmbed.maxPerPage = 11
      expect(menuEmbed.spansMultiplePages())
        .toEqual(false)
      menuEmbed.maxPerPage = 0
      expect(menuEmbed.spansMultiplePages())
        .toEqual(false)
    })
  })
})
