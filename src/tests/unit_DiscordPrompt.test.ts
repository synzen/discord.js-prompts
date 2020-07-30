import { EventEmitter } from 'events'
import { DiscordChannel } from '../DiscordChannel';
import { DiscordPrompt } from '../DiscordPrompt';
import { MessageVisual } from '../visuals/MessageVisual';
import { PromptCollector, Rejection } from 'prompt-anything';
import { MenuVisual } from '../visuals/MenuVisual';
import { MenuEmbed } from '../MenuEmbed';
import { Message, MessageEmbed } from 'discord.js'
import { DiscordRejection } from '../types/DiscordRejection';
import { mocked } from 'ts-jest'

jest.mock('../visuals/MessageVisual')

const mockedMessageVisual = mocked(MessageVisual)

class MockCollector extends EventEmitter {
  stop = jest.fn()
}

describe('Unit::DiscordPrompt', () => {
  let visual: MessageVisual
  let prompt: DiscordPrompt<{}>
  afterEach(function () {
    jest.resetAllMocks()
    mockedMessageVisual.mockReset()
  })
  beforeEach(() => {
    visual = new MessageVisual('aedsg')
    prompt = new DiscordPrompt(visual)
  })
  describe('static getRejectVisual', () => {
    it('returns correctly for regular rejection', async () => {
      const text = 'err text'
      const rejection = new Rejection(text)
      const result = await DiscordPrompt.getRejectVisual(rejection)
      expect(result).toBeInstanceOf(MessageVisual)
      expect(mockedMessageVisual).toHaveBeenCalledWith(text)
    })
    it('returns correctly for DiscordRejection', async () => {
      const text = 'error text'
      const embed = new MessageEmbed()
      const rejection = new DiscordRejection(text, embed)
      const visual = await DiscordPrompt.getRejectVisual(rejection)
      expect(visual).toBeInstanceOf(MessageVisual)
      expect(mockedMessageVisual).toHaveBeenCalledWith(text, {
        embed,
      })
    })
  })
  describe('static createMenuRejection', () => {
    it('returns correctly', () => {
      const result = DiscordPrompt.createMenuRejection()
      expect(result).toBeInstanceOf(Rejection)
    })
  })
  describe('createCollector', () => {
    let createdCollector: MockCollector
    const discordChannel = {
      channel: {
        createMessageCollector: jest.fn()
      },
      storeMessages: jest.fn()
    } as unknown as DiscordChannel
    beforeEach(() => {
      createdCollector = new MockCollector()
      discordChannel.channel.createMessageCollector = jest.fn()
        .mockReturnValue(createdCollector)
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
        .mockResolvedValue()
      const data = {
        __authorID: 'bar'
      }
      const emitter = prompt.createCollector(discordChannel, data)
      const message = {} as Message
      createdCollector.emit('collect', message)
      expect(handleMessage).toHaveBeenCalledWith(message, data, emitter)
    })
    it('stores the message for every message collected', () => {
      jest.spyOn(prompt, 'handleMessage')
        .mockResolvedValue()
      const data = {
        __authorID: 'bar'
      }
      prompt.createCollector(discordChannel, data)
      const message = {} as Message
      createdCollector.emit('collect', message)
      expect(discordChannel.storeMessages)
        .toHaveBeenCalledWith(message)
    })
  })
  describe('handleMessage', () => {
    it('emits exit when message content is exit', async () => {
      const emitter: PromptCollector<{}, Message> = {
        emit: jest.fn()
      } as unknown as EventEmitter
      const message = {
        content: 'exit'
      } as Message
      await prompt.handleMessage(message, {}, emitter)
      expect(emitter.emit).toHaveBeenCalledWith('exit')
    })
    it('emits message if visual is not a menu', async () => {
      const messageVisual = new MessageVisual('dh')
      jest.spyOn(prompt, 'getVisual')
        .mockResolvedValue(messageVisual)
      const emitter: PromptCollector<{}, Message> = {
        emit: jest.fn()
      } as unknown as EventEmitter
      const message = {
        content: 'dfht'
      } as Message
      await prompt.handleMessage(message, {}, emitter)
      expect(emitter.emit).toHaveBeenCalledWith('message', message)
    })
    it('calls handleMenuMessage if visual is a menu', async () => {
      const messageVisual = new MenuVisual(new MenuEmbed())
      jest.spyOn(prompt, 'getVisual').mockResolvedValue(messageVisual)
      const handleMenuMessage = jest.spyOn(prompt, 'handleMenuMessage')
        .mockImplementation()
      const emitter: PromptCollector<{}, Message> = {
        emit: jest.fn()
      } as unknown as EventEmitter
      const message = {
        content: 'dfht'
      } as Message
      await prompt.handleMessage(message, {}, emitter)
      expect(handleMenuMessage).toHaveBeenCalled()
      expect(emitter.emit).not.toHaveBeenCalled()
    })
    it('emits error when getVisual fails', async () => {
      const error = new Error('awstgedr')
      jest.spyOn(prompt, 'getVisual')
        .mockRejectedValue(error)
      const emitter: PromptCollector<{}, Message> = {
        emit: jest.fn()
      } as unknown as EventEmitter
      const message = {
        content: 'dfht'
      } as Message
      await prompt.handleMessage(message, {}, emitter)
      expect(emitter.emit).toHaveBeenCalledWith('error', error)
    })
  })
  describe('handleMenuMessage', () => {
    it('emits reject if content is invalid', () => {
      const menuEmbed = new MenuEmbed()
      menuEmbed.isValidSelection = jest.fn().mockReturnValue(false)
      const createdRejection = new Rejection('aqetsw6y4r75th')
      jest.spyOn(DiscordPrompt, 'createMenuRejection')
        .mockReturnValue(createdRejection)
      const emitter = {
        emit: jest.fn()
      } as unknown as PromptCollector<{}, Message>
      const message = {
        content: 'dfht'
      } as Message
      prompt.handleMenuMessage(message, {}, menuEmbed, emitter)
      expect(emitter.emit).toHaveBeenCalledWith('reject', message, createdRejection)
    })
    it('emits message if content is valid', () => {
      const menuEmbed = new MenuEmbed()
      menuEmbed.isValidSelection = jest.fn().mockReturnValue(true)
      const emitter = {
        emit: jest.fn()
      } as unknown as PromptCollector<{}, Message>
      const message = {
        content: 'dfht'
      } as Message
      prompt.handleMenuMessage(message, {}, menuEmbed, emitter)
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
      const data = {
        asdg: 'kghfdg'
      }
      const rejection = new Rejection('sgrf')
      const rejectVisual = new MessageVisual('srfg')
      const getRejectVisual = jest.spyOn(DiscordPrompt, 'getRejectVisual')
        .mockResolvedValue(rejectVisual)
      await prompt.onReject(rejection, message, channel, data)
      expect(sendVisual).toHaveBeenCalledWith(rejectVisual, channel)
      expect(getRejectVisual).toHaveBeenCalledWith(rejection, message, channel, data)
    })
  })
})
