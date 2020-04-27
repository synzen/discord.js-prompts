import { EventEmitter } from 'events'
import { DiscordChannel } from '../DiscordChannel';
import { DiscordPrompt, BaseData } from '../DiscordPrompt';
import { MessageVisual } from '../visuals/MessageVisual';
import { PromptCollector, Rejection } from 'prompt-anything';
import { MenuVisual } from '../visuals/MenuVisual';
import { MenuEmbed } from '../MenuEmbed';
import { Message } from 'discord.js'

jest.mock('../visuals/MessageVisual')

class MockCollector extends EventEmitter {
  stop = jest.fn()
}

describe('Unit::DiscordPrompt', () => {
  let visual: MessageVisual
  let prompt: DiscordPrompt<BaseData>
  const baseData: BaseData = {
    __authorID: 'abc'
  }
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
      jest.spyOn(prompt, 'handleMessage')
        .mockResolvedValue()
    })
    it('returns an event emitter', () => {
      const returned = prompt.createCollector(discordChannel, {
        __authorID: 'asde'
      })
      expect(returned).toBeInstanceOf(EventEmitter)
    })
    it('calls stops collector once emitter is stopped', () => {
      const emitter = prompt.createCollector(discordChannel, {
        __authorID: 'azsf'
      })
      emitter.emit('stop')
      expect(createdCollector.stop).toHaveBeenCalledTimes(1)
    })
    it('calls handle message for every message in collector', () => {
      const handleMessage = jest.spyOn(prompt, 'handleMessage')
      const data = {
        __authorID: 'bar'
      }
      const emitter = prompt.createCollector(discordChannel, data)
      const message = {} as Message
      createdCollector.emit('collect', message)
      expect(handleMessage).toHaveBeenCalledWith(message, data, emitter)
    })
    it('stores the messages', () => {
      const data = {
        __authorID: 'bar'
      }
      prompt.createCollector(discordChannel, data)
      const message = {} as Message
      createdCollector.emit('collect', message)
      expect(discordChannel.storeMessage)
        .toHaveBeenCalledWith(message)
    })
  })
  describe('handleMessage', () => {
    it('emits exit when message content is exit', async () => {
      const emitter: PromptCollector<BaseData> = {
        emit: jest.fn()
      } as unknown as EventEmitter
      const message = {
        content: 'exit'
      } as Message
      await prompt.handleMessage(message, baseData, emitter)
      expect(emitter.emit).toHaveBeenCalledWith('exit', message)
    })
    it('emits message if visual is not a menu', async () => {
      const messageVisual = new MessageVisual('dh')
      jest.spyOn(prompt, 'getVisual')
        .mockResolvedValue(messageVisual)
      const emitter: PromptCollector<BaseData> = {
        emit: jest.fn()
      } as unknown as EventEmitter
      const message = {
        content: 'dfht'
      } as Message
      await prompt.handleMessage(message, baseData, emitter)
      expect(emitter.emit).toHaveBeenCalledWith('message', message)
    })
    it('calls handleMenuMessage if visual is a menu', async () => {
      const messageVisual = new MenuVisual(new MenuEmbed())
      jest.spyOn(prompt, 'getVisual').mockResolvedValue(messageVisual)
      const handleMenuMessage = jest.spyOn(prompt, 'handleMenuMessage')
        .mockImplementation()
      const emitter: PromptCollector<BaseData> = {
        emit: jest.fn()
      } as unknown as EventEmitter
      const message = {
        content: 'dfht'
      } as Message
      await prompt.handleMessage(message, baseData, emitter)
      expect(handleMenuMessage).toHaveBeenCalled()
      expect(emitter.emit).not.toHaveBeenCalled()
    })
    it('emits error when getVisual fails', async () => {
      const error = new Error('awstgedr')
      jest.spyOn(prompt, 'getVisual')
        .mockRejectedValue(error)
      const emitter: PromptCollector<BaseData> = {
        emit: jest.fn()
      } as unknown as EventEmitter
      const message = {
        content: 'dfht'
      } as Message
      await prompt.handleMessage(message, baseData, emitter)
      expect(emitter.emit).toHaveBeenCalledWith('error', error)
    })
  })
  describe('handleMenuMessage', () => {
    it('emits reject if content is invalid', () => {
      const menuEmbed = new MenuEmbed()
      menuEmbed.isValidSelection = jest.fn().mockReturnValue(false)
      const emitter = {
        emit: jest.fn()
      } as unknown as PromptCollector<BaseData>
      const message = {
        content: 'dfht'
      } as Message
      prompt.handleMenuMessage(message, menuEmbed, emitter)
      expect(emitter.emit).toHaveBeenCalledWith('reject', message, new Rejection('That is an invalid option. Try again.'))
    })
    it('emits message if content is valid', () => {
      const menuEmbed = new MenuEmbed()
      menuEmbed.isValidSelection = jest.fn().mockReturnValue(true)
      const emitter = {
        emit: jest.fn()
      } as unknown as PromptCollector<BaseData>
      const message = {
        content: 'dfht'
      } as Message
      prompt.handleMenuMessage(message, menuEmbed, emitter)
      expect(emitter.emit).toHaveBeenCalledWith('message', message)
    })
  })
  describe('onReject', () => {
    beforeEach(() => {
      jest.spyOn(prompt, 'sendVisual').mockResolvedValue({} as Message)
    })
    it('sends the reject visual', async () => {
      const message = {
        aaa: 'bbb'
      } as unknown as Message
      const sendVisual = jest.spyOn(prompt, 'sendVisual')
      const channel = {
        foo: 'ade'
      } as unknown as DiscordChannel
      const rejection = new Rejection('sgrf')
      prompt.onReject(message, rejection, channel)
      expect(sendVisual).toHaveBeenCalledWith(DiscordPrompt.getRejectVisual(rejection), channel)
    })
  })
  describe('onInactivity', () => {
    beforeEach(() => {
      jest.spyOn(prompt, 'sendVisual').mockResolvedValue({} as Message)
    })
   it('sends the inactivity visual', async () => {
      const sendVisual = jest.spyOn(prompt, 'sendVisual')
      const channel = {
        foo: 'ade'
      } as unknown as DiscordChannel
      prompt.onInactivity(channel)
      expect(sendVisual).toHaveBeenCalledWith(DiscordPrompt.inactivityVisual, channel)
    })
  })
  describe('onExit', () => {
    beforeEach(() => {
      jest.spyOn(prompt, 'sendVisual').mockResolvedValue({} as Message)
    })
    it('sends the exit visual', async () => {
      const sendVisual = jest.spyOn(prompt, 'sendVisual')
      const message = {
        dhr: 'sedg'
      } as unknown as Message
      const channel = {
        foo: 'ade'
      } as unknown as DiscordChannel
      prompt.onExit(message, channel)
      expect(sendVisual).toHaveBeenCalledWith(DiscordPrompt.exitVisual, channel)
    })
  })
})
