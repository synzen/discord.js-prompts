import { MenuEmbed } from "../MenuEmbed"
import { EventEmitter } from 'events'
import { Message, MessageEmbed } from 'discord.js'
import { mocked } from 'ts-jest/utils'

jest.mock('discord.js')

async function flushPromises(): Promise<void> {
  return new Promise(resolve => {
    setImmediate(resolve);
  });
}

const generateEmbed = (fieldCount: number): MessageEmbed => {
  const embed = new MessageEmbed()
  embed.fields = []
  const field = {
    name: 'a',
    value: 'b',
    inline: false
  }
  for (let i = 0; i < fieldCount; ++i) {
    embed.fields.push(field)
  }
  return embed
}

describe('Unit::MenuEmbed', () => {
  let menuEmbed: MenuEmbed
  afterEach(() => {
    mocked(MessageEmbed).mockReset()
    jest.restoreAllMocks()
  })
  beforeEach(() => {
    menuEmbed = new MenuEmbed()
  })
  describe('constructor', () => {
    it('accepts no args', () => {
      expect(menuEmbed.maxPerPage).toEqual(5)
      expect(menuEmbed.page).toEqual(0)
    })
    it('overwrites embed and settings', () => {
      const myEmbed = new MessageEmbed({
        title: 'awsdf',
        fields: [{
          name: 'adf',
          value: 'shfrg'
        }]
      })
      const menuEmbed = new MenuEmbed(myEmbed)
      expect(menuEmbed.embed).toEqual(myEmbed)
    })
    it('overwrites settings', () => {
      const maxPerPage = 10
      const paginationTimeout = 346346
      const multiSelect = true
      const menuEmbed = new MenuEmbed(undefined, {
        maxPerPage,
        paginationTimeout,
        multiSelect
      })
      expect(menuEmbed.maxPerPage).toEqual(maxPerPage)
      expect(menuEmbed.paginationTimeout).toEqual(paginationTimeout)
      expect(menuEmbed.multiSelect).toEqual(multiSelect)
      // expect(menuEmbed.multiSelect).toEqual(multiSelect)
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
      const title = 'aedsg'
      const description = 'swetr'
      menuEmbed.addOption(title, description)
      expect(menuEmbed.options).toEqual([{
        name: `3) ${title}`,
        description
      }])
    })
    it('returns this', () => {
      const returned = menuEmbed.addOption('title', 'description')
      expect(returned).toEqual(menuEmbed)
    })
    it('it uses 0 width space as description if not provided', () => {
      const title = 'aedsg'
      menuEmbed.addOption(title)
      expect(menuEmbed.options[0].description).toEqual('\u200b')
    })
    it('overrides the default number if given', () => {
      const title = 'aedsg'
      const description = 'swetr'
      const number = 53335
      menuEmbed.addOption(title, description, number)
      expect(menuEmbed.options).toEqual([{
        name: `${number}) ${title}`,
        description
      }])
    })
  })
  describe('enableMultiSelect', () => {
    it('works correctly', () => {
      menuEmbed.multiSelect = false
      menuEmbed.enableMultiSelect()
      expect(menuEmbed.multiSelect)
        .toEqual(true)
    })
    it('returns this', () => {
      expect(menuEmbed.enableMultiSelect())
        .toEqual(menuEmbed)
    })
  })
  describe('disableMultiSelect', () => {
    it('works correctly', () => {
      menuEmbed.multiSelect = true
      menuEmbed.disableMultiSelect()
      expect(menuEmbed.multiSelect)
        .toEqual(false)
    })
    it('returns this', () => {
      expect(menuEmbed.disableMultiSelect())
        .toEqual(menuEmbed)
    })
  })
  describe('isValidOption', () => {
    it('returns correctly', () => {
      jest.spyOn(menuEmbed, 'numberOfOptions')
        .mockReturnValue(2)
      expect(menuEmbed.isValidOption(0))
        .toEqual(false)
      expect(menuEmbed.isValidOption(1))
        .toEqual(true)
      expect(menuEmbed.isValidOption(2))
        .toEqual(true)
      expect(menuEmbed.isValidOption(3))
        .toEqual(false)
    })
    it('returns false for NaN', () => {
      expect(menuEmbed.isValidOption(NaN))
        .toEqual(false)
    })
  })
  describe('isValidSelection', () => {
    it('returns correctly for non-multiSelect', () => {
      jest.spyOn(menuEmbed, 'isValidOption')
        .mockReturnValue(true)
      expect(menuEmbed.isValidSelection('asedgt'))
        .toEqual(true)
      jest.spyOn(menuEmbed, 'isValidOption')
        .mockReturnValue(false)
      expect(menuEmbed.isValidSelection('asedgt'))
        .toEqual(false)
    })
    it('returns correctly for multiSelect when one option is invalid', () => {
      menuEmbed.multiSelect = true
      jest.spyOn(menuEmbed, 'isValidOption')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
      expect(menuEmbed.isValidSelection('1,5,6'))
        .toEqual(false)
    })
    it('returns correctly for multiSelect when all options are valid', () => {
      menuEmbed.multiSelect = false
      jest.spyOn(menuEmbed, 'isValidOption')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
      expect(menuEmbed.isValidSelection('1,5,6'))
        .toEqual(true)
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
      menuEmbed.maxPerPage = 3
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
      const embedJSON = {
        foo: 'bar'
      }
      const embedPage = {
        a: 'b',
        toJSON: jest.fn().mockReturnValue(embedJSON)
      } as unknown as MessageEmbed
      jest.spyOn(menuEmbed, 'getEmbedOfPage')
        .mockReturnValue(embedPage)
      await menuEmbed.setMessage(message)
      expect(edit).toHaveBeenCalledWith('', {
        embed: embedJSON
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
        react,
        channel: {
          messages: {
            cache: new Map()
          }
        }
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
        react,
        channel: {
          messages: {
            cache: new Map()
          }
        }
      } as unknown as Message
      await menuEmbed.setUpPagination(message)
      expect(errorHandler).toHaveBeenCalledWith(reactError, message)
    })
    it('adds the message to cache', async () => {
      menuEmbed.paginationErrorHandler = jest.fn()
      jest.spyOn(menuEmbed, 'createReactionCollector')
        .mockReturnValue()
      const react = jest.fn()
      const set = jest.fn()
      const message = {
        id: 'abc123',
        react,
        channel: {
          messages: {
            cache: {
              set
            }
          }
        }
      } as unknown as Message
      await menuEmbed.setUpPagination(message)
      expect(set).toHaveBeenCalledWith(message.id, message)
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
    it('handles errors for next and prev page', async () => {
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
  describe('getOptionsOfPage', () => {
    it('returns the original options if no maxPerPage', () => {
      menuEmbed.maxPerPage = 0
      menuEmbed.options = [{
        name: 'sad'
      }, {
        name: 'sadfgd'
      }]
      expect(menuEmbed.getOptionsOfPage(55))
        .toEqual(menuEmbed.options)
    })
    it('returns the right page', () => {
      menuEmbed.maxPerPage = 2
      menuEmbed.options = [{
        name: '1'
      }, {
        name: '2'
      }, {
        name: '3'
      }, {
        name: '4'
      }, {
        name: '5'
      }]
      expect(menuEmbed.getOptionsOfPage(2))
      .toEqual([{
        ...menuEmbed.options[4]
      }])
    })
  })
  describe('getEmbedOfPage', () => {
    it('returns the embed with added options', () => {
      const options = [{
        name: '1',
        description: 'd1'
      }, {
        name: '2',
        description: 'd2'
      }]
      const embed = new MessageEmbed()
      jest.spyOn(menuEmbed, 'getOptionsOfPage')
        .mockReturnValue(options)
      mocked(MessageEmbed).mockImplementation(() => {
        return embed
      })
      const returned = menuEmbed.getEmbedOfPage(1)
      expect(embed.addField)
        .toHaveBeenNthCalledWith(1, options[0].name, options[0].description)
      expect(embed.addField)
        .toHaveBeenNthCalledWith(2, options[1].name, options[1].description)
      expect(returned).toEqual(embed)
      
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
