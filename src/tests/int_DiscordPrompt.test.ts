import { EventEmitter } from 'events'
import { DiscordChannel } from '../DiscordChannel';
import { DiscordPrompt } from '../DiscordPrompt';
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
  let prompt: DiscordPrompt<{}>
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
      },
      storeMessage: jest.fn()
    } as unknown as DiscordChannel
    beforeEach(() => {
      createdCollector = new MockCollector()
      discordChannel.channel.createMessageCollector = jest.fn()
        .mockReturnValue(createdCollector)
    })
    it('emits a message for non-menu visuals', async () => {
      const returned = prompt.createCollector(discordChannel, {
        __authorID: 'af'
      })
      const emit = jest.spyOn(returned, 'emit')
      const message = {
        content: 'hello world'
      } as Message
      createdCollector.emit('collect', message)
      await flushPromises()
      expect(emit).toHaveBeenCalledWith('message', message)
    })
    it('emits exit when message content is exit', () => {
      const returned = prompt.createCollector(discordChannel, {
        __authorID: 'srfh'
      })
      const emit = jest.spyOn(returned, 'emit')
      const message = {
        content: 'exit'
      } as Message
      createdCollector.emit('collect', message)
      expect(emit).toHaveBeenCalledWith('exit', message)
    })
    it('emits a message when valid input for menu', async () => {
      const menu = new MenuEmbed()
      jest.spyOn(menu, 'isValidSelection')
        .mockReturnValue(true)
      const menuVisual = new MenuVisual(menu)
      prompt = new DiscordPrompt(menuVisual, async () => ({}))
      jest.spyOn(prompt, 'getVisual')
        .mockResolvedValue(menuVisual)
      const returned = prompt.createCollector(discordChannel, {
        __authorID: 'sed'
      })
      const emit = jest.spyOn(returned, 'emit')
      const message = {
        content: '1'
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
      prompt = new DiscordPrompt(menuVisual, async () => ({}))
      jest.spyOn(prompt, 'getVisual')
        .mockResolvedValue(menuVisual)
      const returned = prompt.createCollector(discordChannel, {
        __authorID: 'sryhdet'
      })
      const emit = jest.spyOn(returned, 'emit')
      const message = {
        content: '2'
      } as Message
      createdCollector.emit('collect', message)
      await flushPromises()
      expect(emit).toHaveBeenCalledWith('reject', message, new Rejection('That is an invalid option. Try again.'))
    })
  })
})
