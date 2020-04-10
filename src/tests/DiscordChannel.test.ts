import { DiscordChannel } from "../DiscordChannel"
import { TextChannel, MessageOptions, Message } from 'discord.js'
import { MenuVisual } from "../visuals/MenuVisual"
import { MenuEmbed } from "../MenuEmbed"
import { MessageVisual } from "../visuals/MessageVisual"

jest.mock('discord.js')
jest.mock('../MenuEmbed')
jest.mock('../visuals/MessageVisual')
jest.mock('../visuals/MenuVisual')

describe('DiscordChannel', () => {
  describe('constructor', () => {
    it('initializes the channel', () => {
      const textChannel = {
        id: 'aedstgr'
      } as TextChannel
      const channel = new DiscordChannel(textChannel)
      expect(channel.channel).toEqual(textChannel)
    })
  })
  describe('sendMenuVisual', () => {
    it('sends correctly', async () => {
      const menuEmbed = new MenuEmbed()
      const options = {
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
  })
  describe('sendMessageVisual', () => {
    it('sends correctly', async () => {
      const text = 'aedgts'
      const options = {
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
  })
})
