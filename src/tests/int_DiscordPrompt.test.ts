import { EventEmitter } from 'events'
import { DiscordChannel } from '../DiscordChannel';
import { DiscordPrompt, BaseData } from '../DiscordPrompt';
import { MessageVisual } from '../visuals/MessageVisual';
import { Rejection } from 'prompt-anything';
import { MenuVisual } from '../visuals/MenuVisual';
import { MenuEmbed } from '../MenuEmbed';
import { Message } from 'discord.js'

async function flushPromises(): Promise<void> {
  return new Promise(resolve => {
    setImmediate(resolve);
  });
}

class MockCollector extends EventEmitter {
  stop = jest.fn()
}

describe('Int::DiscordPrompt', () => {
  let visual: MessageVisual
  let prompt: DiscordPrompt<BaseData>
  afterEach(function () {
    jest.resetAllMocks()
  })
  beforeEach(() => {
    visual = new MessageVisual('aedsg')
    prompt = new DiscordPrompt(visual)
  })
  describe('createCollector', () => {
    let createdCollector: MockCollector
    const discordChannel = {
      channel: {
        createMessageCollector: jest.fn()
      }
    } as unknown as DiscordChannel
    beforeEach(() => {
      createdCollector = new MockCollector()
      discordChannel.channel.createMessageCollector = jest.fn()
        .mockReturnValue(createdCollector)
      discordChannel.storeMessage = jest.fn()
    })
    it('emits a message for non-menu visuals', async () => {
      const data = {
        __authorID: 'af'
      }
      const returned = prompt.createCollector(discordChannel, data)
      const emit = jest.spyOn(returned, 'emit')
      const message = {
        content: 'hello world',
        author: {
          id: data.__authorID
        }
      } as Message
      createdCollector.emit('collect', message)
      await flushPromises()
      expect(emit).toHaveBeenCalledWith('message', message)
    })
    it('emits exit when message content is exit', () => {
      const data = {
        __authorID: 'srfh'
      }
      const returned = prompt.createCollector(discordChannel, data)
      const emit = jest.spyOn(returned, 'emit')
      const message = {
        content: 'exit',
        author: {
          id: data.__authorID
        }
      } as Message
      createdCollector.emit('collect', message)
      expect(emit).toHaveBeenCalledWith('exit', message)
    })
    it('emits a message when valid input for menu', async () => {
      const menu = new MenuEmbed()
      jest.spyOn(menu, 'isValidSelection')
        .mockReturnValue(true)
      const menuVisual = new MenuVisual(menu)
      prompt = new DiscordPrompt(menuVisual, async () => ({} as BaseData))
      jest.spyOn(prompt, 'getVisual')
        .mockResolvedValue(menuVisual)
      const data = {
        __authorID: 'sed'
      }
      const returned = prompt.createCollector(discordChannel, data)
      const emit = jest.spyOn(returned, 'emit')
      const message = {
        content: '1',
        author: {
          id: data.__authorID
        }
      } as Message
      createdCollector.emit('collect', message)
      await flushPromises()
      expect(emit).toHaveBeenCalledWith('message', message)
    })
    it('emits a reject when invalid input for menu', async () => {
      const menu = new MenuEmbed()
      jest.spyOn(menu, 'isValidSelection')
        .mockReturnValue(false)
      const menuVisual = new MenuVisual(menu)
      prompt = new DiscordPrompt(menuVisual, async () => ({} as BaseData))
      jest.spyOn(prompt, 'getVisual')
        .mockResolvedValue(menuVisual)
      const data = {
        __authorID: 'sryhdet'
      }
      const returned = prompt.createCollector(discordChannel, data)
      const emit = jest.spyOn(returned, 'emit')
      const message = {
        content: '2',
        author: {
          id: data.__authorID
        }
      } as Message
      createdCollector.emit('collect', message)
      await flushPromises()
      expect(emit)
        .toHaveBeenCalledWith('reject', message, new Rejection('That is an invalid option. Try again.'))
    })
    it('stores the message if message from bot', async () => {
      const data = {
        __authorID: 'aiyf'
      }
      const clientID = 'qaet64wry'
      prompt.createCollector(discordChannel, data)
      const message = {
        content: 'hello world',
        author: {
          id: clientID
        },
        client: {
          user: {
            id: clientID
          }
        }
      } as Message
      createdCollector.emit('collect', message)
      await flushPromises()
      expect(discordChannel.storeMessage)
        .toHaveBeenCalledWith(message)
    })
    it('stores the message if from original author', async () => {
      const data = {
        __authorID: 'aiyf'
      }
      prompt.createCollector(discordChannel, data)
      const message = {
        content: 'hello world',
        author: {
          id: data.__authorID
        }
      } as Message
      createdCollector.emit('collect', message)
      await flushPromises()
      expect(discordChannel.storeMessage)
        .toHaveBeenCalledWith(message)
    })
    it('does not store message if not from author or bot', async () => {
      const data = {
        __authorID: 'aiyf'
      }
      prompt.createCollector(discordChannel, data)
      const message = {
        content: 'hello world',
        author: {
          id: data.__authorID + '2w346try'
        },
        client: {
          user: {}
        }
      } as Message
      createdCollector.emit('collect', message)
      await flushPromises()
      expect(discordChannel.storeMessage)
        .not.toHaveBeenCalled()
    })
  })
})
