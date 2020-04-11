import { MessageEmbed, Message } from 'discord.js'
import { MenuEmbed } from "../MenuEmbed"
import { EventEmitter } from 'events'

async function flushPromises(): Promise<void> {
  return new Promise(resolve => {
    setImmediate(resolve);
  });
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
      expect(menuEmbed.embed).toBeInstanceOf(MessageEmbed)
      expect(menuEmbed.maxPerPage).toEqual(5)
      expect(menuEmbed.page).toEqual(0)
    })
    it('overwrites embed and settings', () => {
      const myEmbed = new MessageEmbed().setTitle('awsdf')
      const maxPerPage = 10
      const menuEmbed = new MenuEmbed(myEmbed, {
        maxPerPage
      })
      expect(menuEmbed.embed).toEqual(myEmbed)
      expect(menuEmbed.maxPerPage).toEqual(maxPerPage)
    })
  })
  describe('enablePagination', () => {
    it('defines the error handler', () => {
      const func = jest.fn()
      menuEmbed.enablePagination(func)
      expect(menuEmbed.paginationErrorHandler).toEqual(func)
    })
  })
  describe('addOption', () => {
    it('adds the field correctly', () => {
      const embed = {
        addField: jest.fn(),
        fields: [1, 2]
      } as unknown as MessageEmbed
      menuEmbed.embed = embed
      const title = 'aedsg'
      const description = 'swetr'
      const returned = menuEmbed.addOption(title, description)
      expect(embed.addField).toHaveBeenCalledWith(`3) ${title}`, description)
      expect(returned).toEqual(menuEmbed)
    })
  })
  describe('isInvalidOption', () => {
    it('returns correctly', () => {
      menuEmbed.embed = {
        fields: [1, 1]
      } as unknown as MessageEmbed
      expect(menuEmbed.isInvalidOption(0))
        .toEqual(true)
      expect(menuEmbed.isInvalidOption(1))
        .toEqual(false)
      expect(menuEmbed.isInvalidOption(2))
        .toEqual(false)
      expect(menuEmbed.isInvalidOption(3))
        .toEqual(true)
    })
  })
  describe('setTitle', () => {
    it('sets the title', () => {
      const embed = {
        setTitle: jest.fn()
      } as unknown as MessageEmbed
      menuEmbed.embed = embed
      const title = 'asedfrhgt'
      const returned = menuEmbed.setTitle(title)
      expect(menuEmbed.embed.setTitle)
        .toHaveBeenCalledWith(title)
      expect(returned).toEqual(menuEmbed)
    })
  })
  describe('setAuthor', () => {
    it('sets the author', () => {
      const embed = {
        setAuthor: jest.fn()
      } as unknown as MessageEmbed
      menuEmbed.embed = embed
      const name = 'asedfrhgt'
      const icon = 'aesdtg'
      const url = 'sweyr'
      const returned = menuEmbed.setAuthor(name, icon, url)
      expect(menuEmbed.embed.setAuthor)
        .toHaveBeenCalledWith(name, icon, url)
      expect(returned).toEqual(menuEmbed)
    })
    it('has optional icon and url', () => {
      const embed = {
        setAuthor: jest.fn()
      } as unknown as MessageEmbed
      menuEmbed.embed = embed
      const name = 'asedfrhgt'
      const returned = menuEmbed.setAuthor(name)
      expect(menuEmbed.embed.setAuthor)
        .toHaveBeenCalledWith(name, undefined, undefined)
      expect(returned).toEqual(menuEmbed)
    })
  })
  describe('setDescription', () => {
    it('sets the description', () => {
      const embed = {
        setDescription: jest.fn()
      } as unknown as MessageEmbed
      menuEmbed.embed = embed
      const desc = 'asedfrhgt'
      const returned = menuEmbed.setDescription(desc)
      expect(menuEmbed.embed.setDescription)
        .toHaveBeenCalledWith(desc)
      expect(returned).toEqual(menuEmbed)
    })
  })
  describe('setColor', () => {
    it('sets the color', () => {
      const embed = {
        setColor: jest.fn()
      } as unknown as MessageEmbed
      menuEmbed.embed = embed
      const color = 2456
      const returned = menuEmbed.setColor(color)
      expect(menuEmbed.embed.setColor)
        .toHaveBeenCalledWith(color)
      expect(returned).toEqual(menuEmbed)
    })
  })
  describe('isOnLastPage', () => {
    it('returns correctly', () => {
      const embed = {
        fields: [1, 2, 3]
      } as unknown as MessageEmbed
      menuEmbed.embed = embed
      menuEmbed.maxPerPage = 2
      menuEmbed.page = 1
      expect(menuEmbed.isOnLastPage())
        .toEqual(false)
      menuEmbed.page = 2
      expect(menuEmbed.isOnLastPage())
        .toEqual(true)
      menuEmbed.page = 3
      expect(menuEmbed.isOnLastPage())
          .toEqual(true)
    })
  })
  describe('isOnFirstPage', () => {
    it('returns correctly', () => {
      const embed = {
        fields: [1, 2, 3]
      } as unknown as MessageEmbed
      menuEmbed.embed = embed
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
      expect(edit).toHaveBeenCalledWith(embedPage)
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
      expect(errorHandler).toHaveBeenCalledWith(reactError)
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
      collector.emit('collect', reaction)
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
      collector.emit('collect', reaction)
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
      collector.emit('collect', reaction)
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
      collector.emit('collect', reaction)
      await flushPromises()
      expect(menuEmbed.paginationErrorHandler)
        .toHaveBeenCalledWith(error)
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
      collector.emit('collect', reaction)
      await flushPromises()
      expect(menuEmbed.paginationErrorHandler)
        .toHaveBeenCalledWith(error)
    })
  })
  describe('getEmbedOfPage', () => {
    it('returns the full embed if no max per page', () => {
      menuEmbed.maxPerPage = 0
      const embed = {
        fields: [1,2,3,4,5,6,7,8,9,10,11]
      } as unknown as MessageEmbed
      menuEmbed.embed = embed
      expect(menuEmbed.getEmbedOfPage(2))
        .toEqual(embed)
    })
    it('returns the right embed', () => {
      menuEmbed.maxPerPage = 3
      const embed = {
        title: 'foo',
        fields: [1,2,3,4,5,6,7,8,9,10,11]
      } as unknown as MessageEmbed
      const firstPage = {
        title: 'foo',
        fields: [1,2,3]
      }
      const secondPage = {
        title: 'foo',
        fields: [4,5,6]
      }
      const fourthPage = {
        title: 'foo',
        fields: [10,11]
      }
      menuEmbed.embed = embed
      expect(menuEmbed.getEmbedOfPage(0))
        .toEqual(expect.objectContaining(firstPage))
      expect(menuEmbed.getEmbedOfPage(1))
        .toEqual(expect.objectContaining(secondPage))
      expect(menuEmbed.getEmbedOfPage(3))
        .toEqual(expect.objectContaining(fourthPage))
    })
  })
  describe('spansMultiplePages', () => {
    it('returns correctly', () => {
      const embed = {
        title: 'foo',
        fields: [1,2,3,4,5,6,7,8,9,10,11]
      } as unknown as MessageEmbed
      menuEmbed.embed = embed
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
