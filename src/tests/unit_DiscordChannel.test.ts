import { DiscordChannel } from "../DiscordChannel"
import { MenuVisual } from "../visuals/MenuVisual"
import { MenuEmbed } from "../MenuEmbed"
import { MessageVisual } from "../visuals/MessageVisual"
import { TextChannel, Message, MessageOptions } from 'discord.js'

jest.mock('../MenuEmbed')
jest.mock('../visuals/MessageVisual')
jest.mock('../visuals/MenuVisual')

describe('Unit::DiscordChannel', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('constructor', () => {
    it('initializes the channel', () => {
      const textChannel = {
        id: 'aedstgr'
      } as unknown as TextChannel
      const channel = new DiscordChannel(textChannel)
      expect(channel.channel).toEqual(textChannel)
    })
    it('initializes ID', () => {
      const textChannel = {
        id: 'aedstgr'
      } as unknown as TextChannel
      const channel = new DiscordChannel(textChannel)
      expect(channel.id).toEqual(textChannel.id)
    })
  })
  describe('DEFAULT OPTIONS', () => {
    it('returns correctly', () => {
      expect(DiscordChannel.DEFAULT_OPTIONS).toEqual({
        allowedMentions: {
          parse: []
        }
      })
    })
  })
  describe('storeMessages', () => {
    it('stores a message', () => {
      const message = {
        foo: 'bar'
      } as unknown as Message
      const textChannel = {} as unknown as TextChannel
      const discordChannel = new DiscordChannel(textChannel)
      discordChannel.messages.push({a: 'b'} as unknown as Message)
      discordChannel.storeMessages(message)
      expect(discordChannel.messages[1]).toEqual(message)
    })
    it('stores an array of messages', () => {
      const messages = [{
        foo: 'bar'
      }, {
        foo: 'baz'
      }] as unknown as Message[]
      const textChannel = {} as unknown as TextChannel
      const discordChannel = new DiscordChannel(textChannel)
      discordChannel.messages.push({a: 'b'} as unknown as Message)
      discordChannel.storeMessages(messages)
      expect(discordChannel.messages[1]).toEqual(messages[0])
      expect(discordChannel.messages[2]).toEqual(messages[1])
    })
  })
  describe('sendMenuVisual', () => {
    it('sends correctly', async () => {
      const menuEmbed = new MenuEmbed()
      const options = {
        ...DiscordChannel.DEFAULT_OPTIONS,
        foo: 'bar',
        ho: 'dunk'
      } as MessageOptions
      // Create the visual
      const menuVisual = new MenuVisual(menuEmbed, options)
      menuVisual.menu = menuEmbed
      menuVisual.options = options
      // Create the channel
      const createdMessage = { b: 2 }
      const textChannel = {
        send: jest.fn().mockResolvedValue(createdMessage)
      } as unknown as TextChannel
      const discordChannel = new DiscordChannel(textChannel)
      discordChannel.channel = textChannel
      // Send it
      const returned = await discordChannel.sendMenuVisual(menuVisual)
      expect(textChannel.send).toHaveBeenCalledWith('', {
        ...options,
        embed: menuEmbed.embed
      })
      expect(returned).toEqual(createdMessage)
    })
    it('sets up pagination if eligible', async () => {
      const menuEmbed = new MenuEmbed()
      jest.spyOn(menuEmbed, 'canPaginate').mockReturnValue(true)
      const setUpPagination = jest.spyOn(menuEmbed, 'setUpPagination')
        .mockImplementation()
      // Create the visual
      const menuVisual = new MenuVisual(menuEmbed)
      menuVisual.menu = menuEmbed
      // Create the channel
      const textChannel = {
        send: jest.fn().mockResolvedValue({} as Message)
      } as unknown as TextChannel
      const discordChannel = new DiscordChannel(textChannel)
      discordChannel.channel = textChannel
      // Send it
      await discordChannel.sendMenuVisual(menuVisual)
      expect(setUpPagination).toHaveBeenCalled()
    })
    it('does not set up pagination if ineligible', async () => {
      const menuEmbed = new MenuEmbed()
      jest.spyOn(menuEmbed, 'canPaginate').mockReturnValue(false)
      const setUpPagination = jest.spyOn(menuEmbed, 'setUpPagination')
        .mockImplementation()
      // Create the visual
      const menuVisual = new MenuVisual(menuEmbed)
      menuVisual.menu = menuEmbed
      // Create the channel
      const textChannel = {
        send: jest.fn().mockResolvedValue({} as Message)
      } as unknown as TextChannel
      const discordChannel = new DiscordChannel(textChannel)
      discordChannel.channel = textChannel
      // Send it
      await discordChannel.sendMenuVisual(menuVisual)
      expect(setUpPagination).not.toHaveBeenCalled()
    })
    it('throws when pagination is enabled but multiple messages were sent', async () => {
      const menuEmbed = new MenuEmbed()
      jest.spyOn(menuEmbed, 'canPaginate').mockReturnValue(true)
      jest.spyOn(menuEmbed, 'setUpPagination')
        .mockImplementation()
      // Create the visual
      const menuVisual = new MenuVisual(menuEmbed)
      menuVisual.menu = menuEmbed
      // Create the channel
      const textChannel = {
        send: jest.fn().mockResolvedValue([{}, {}] as Message[])
      } as unknown as TextChannel
      const discordChannel = new DiscordChannel(textChannel)
      discordChannel.channel = textChannel
      // Send it
      expect(discordChannel.sendMenuVisual(menuVisual))
        .rejects.toThrowError()
    })
    it('uses the first message if array of messages is returned by discordjs', async () => {
      const menuEmbed = new MenuEmbed()
      jest.spyOn(menuEmbed, 'canPaginate').mockReturnValue(true)
      const setUpPagination = jest.spyOn(menuEmbed, 'setUpPagination')
        .mockImplementation()
      // Create the visual
      const menuVisual = new MenuVisual(menuEmbed)
      menuVisual.menu = menuEmbed
      // Create the channel
      const messageSent = {
        foo: 'bar'
      } as unknown as Message
      const textChannel = {
        send: jest.fn().mockResolvedValue([messageSent])
      } as unknown as TextChannel
      const discordChannel = new DiscordChannel(textChannel)
      discordChannel.channel = textChannel
      // Send it
      await discordChannel.sendMenuVisual(menuVisual)
      expect(setUpPagination).toHaveBeenCalledWith(messageSent)
    })
  })
  describe('sendMessageVisual', () => {
    it('sends correctly', async () => {
      const text = 'aedgts'
      const options = {
        ...DiscordChannel.DEFAULT_OPTIONS,
        foo: 'bar',
        a: 1
      } as MessageOptions
      // Create the visual
      const visual = new MessageVisual(text, options)
      visual.text = text
      visual.options = options
      // Create the channel
      const createdMessage = { a: 1 }
      const textChannel = {
        send: jest.fn().mockResolvedValue(createdMessage)
      } as unknown as TextChannel
      const discordChannel = new DiscordChannel(textChannel)
      discordChannel.channel = textChannel
      // Send it
      const returned = await discordChannel.sendMessageVisual(visual)
      expect(textChannel.send).toHaveBeenCalledWith(text, options)
      expect(returned).toEqual(createdMessage)
    })
  })
  describe('send', () => {
    it('throws if it is not a MenuVisual or MessageVisual', async () => {
      const discordChannel = new DiscordChannel({} as TextChannel)
      await expect(discordChannel.send({
        text: 'hi'
      })).rejects.toThrow(TypeError)
    })
    it('calls sendMenuVisual if visual is MenuVisual', async () => {
      const visual = new MenuVisual(new MenuEmbed())
      // Create the channel
      const discordChannel = new DiscordChannel({} as TextChannel)
      const createdMessage = {
        content: 'bar'
      } as Message
      // Mock the method
      const sendMenuVisual = jest.spyOn(discordChannel, 'sendMenuVisual')
        .mockResolvedValue(createdMessage)
      // Send
      const returned = await discordChannel.send(visual)
      expect(sendMenuVisual).toHaveBeenCalledWith(visual)
      expect(returned).toEqual(createdMessage)
    })
    it('calls sendMenuVisual if visual is MessageVisual', async () => {
      const visual = new MessageVisual('aedsgrf')
      // Create the channel
      const discordChannel = new DiscordChannel({} as TextChannel)
      const createdMessage = {
        content: 'bar'
      } as Message
      // Mock the method
      const sendMenuVisual = jest.spyOn(discordChannel, 'sendMessageVisual')
        .mockResolvedValue(createdMessage)
      // Send
      const returned = await discordChannel.send(visual)
      expect(sendMenuVisual).toHaveBeenCalledWith(visual)
      expect(returned).toEqual(createdMessage)
    })
    it('saves the message for sendMessageVisual', async () => {
      const visual = new MessageVisual('aedsgrf')
      const discordChannel = new DiscordChannel({} as TextChannel)
      const createdMessage = {
        content: 'bar'
      } as Message
      jest.spyOn(discordChannel, 'sendMessageVisual')
        .mockResolvedValue(createdMessage)
      const storeMessages = jest.spyOn(discordChannel, 'storeMessages')
        .mockImplementation()
      // Send
      await discordChannel.send(visual)
      expect(storeMessages).toHaveBeenCalledWith(createdMessage)
    })
    it('saves each message if an array of messages is sent', async () => {
      const visual = new MessageVisual('aedsgrf')
      const discordChannel = new DiscordChannel({} as TextChannel)
      const createdMessages = [{
        content: 'a'
      }, {
        content: 'b'
      }] as Message[]
      jest.spyOn(discordChannel, 'sendMessageVisual')
        .mockResolvedValue(createdMessages)
      const storeMessages = jest.spyOn(discordChannel, 'storeMessages')
        .mockImplementation()
      // Send
      await discordChannel.send(visual)
      expect(storeMessages).toHaveBeenCalledWith(createdMessages)
    })
    it('saves the message for sendMenuVisual', async () => {
      const visual = new MenuVisual(new MenuEmbed())
      // Create the channel
      const discordChannel = new DiscordChannel({} as TextChannel)
      const createdMessage = {
        content: 'bar'
      } as Message
      // Mock the method
      jest.spyOn(discordChannel, 'sendMenuVisual')
        .mockResolvedValue(createdMessage)
      const storeMessages = jest.spyOn(discordChannel, 'storeMessages')
        .mockImplementation()
      // Send
      await discordChannel.send(visual)
      expect(storeMessages).toHaveBeenCalledWith(createdMessage)
    })
  })
})
