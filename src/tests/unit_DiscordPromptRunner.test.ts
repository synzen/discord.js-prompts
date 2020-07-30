import { DiscordPromptRunner } from "../DiscordPromptRunner"
import { DiscordChannel } from "../DiscordChannel"
import { PromptRunner } from "prompt-anything"
import { DiscordPrompt } from "../DiscordPrompt"
import { DiscordPromptNode } from "../DiscordPromptNode"
import { User, TextChannel } from 'discord.js'

jest.mock('../DiscordPrompt')
jest.mock('../DiscordChannel')

describe('Unit::DiscordPromptRunner', () => {
  describe('constructor', () => {
    it('works correctly', () => {
      const author = {
        id: 'q3ewt426ry'
      } as User
      const data = {
        dfgdfg: 'wsrg',
        __authorID: 'asewdgtr'
      }
      const runner = new DiscordPromptRunner(author, data)
      expect(runner.initialData).toEqual({
        ...data,
        __authorID: author.id
      })
    })
  })
  describe('static addActiveChannel', () => {
    afterEach(() => {
      DiscordPromptRunner.activeChannels = new Set()
    })
    it('adds the channel id', () => {
      const channelID = 'wseryh'
      DiscordPromptRunner.addActiveChannel(channelID)
      expect(DiscordPromptRunner.activeChannels.has(channelID))
        .toEqual(true)
    })
  })
  describe('static deleteActiveChannel', () => {
    afterEach(() => {
      DiscordPromptRunner.activeChannels = new Set()
    })
    it('deletes the channel id', () => {
      const channelID = 'wseryh'
      DiscordPromptRunner.activeChannels = new Set([channelID])
      DiscordPromptRunner.deleteActiveChannel(channelID)
      expect(DiscordPromptRunner.activeChannels.has(channelID))
        .toEqual(false)
    })
  })
  describe('static isActiveChannel', () => {
    afterEach(() => {
      DiscordPromptRunner.activeChannels = new Set()
    })
    it('returns whether if the channel is an active one', () => {
      const channelID = 'wseryh'
      DiscordPromptRunner.activeChannels = new Set([channelID])
      expect(DiscordPromptRunner.isActiveChannel(channelID))
        .toEqual(true)
      DiscordPromptRunner.activeChannels = new Set()
      expect(DiscordPromptRunner.isActiveChannel(channelID))
        .toEqual(false)
    })
  })
  describe('convertTextChannel', () => {
    it('returns a DiscordChannel', () => {
      const textChannel = {
        a: 'b'
      } as unknown as TextChannel
      const returned = DiscordPromptRunner.convertTextChannel(textChannel)
      expect(DiscordChannel).toHaveBeenCalledWith(textChannel)
      expect(returned).toBeInstanceOf(DiscordChannel)
    })
  })
  describe('run', () => {
    it('accepts a DiscordChannel', () => {
      type DataType = Record<string, unknown>
      const textChannel = {} as TextChannel
      const discordChannel = new DiscordChannel(textChannel)
      const runner = new DiscordPromptRunner({} as User, {})
      const prompt = new DiscordPrompt<DataType>({ text: '' })
      const node = new DiscordPromptNode<DataType>(prompt)
      const superRun = jest.spyOn(PromptRunner.prototype, 'run')
        .mockImplementation()
      runner.run(node, discordChannel)
      expect(superRun).toHaveBeenCalledWith(node, discordChannel)
    })
    it('accepts a TextChannel', () => {
      type DataType = Record<string, unknown>
      const textChannel = {} as TextChannel
      const runner = new DiscordPromptRunner({} as User, {})
      const prompt = new DiscordPrompt<DataType>({ text: '' })
      const node = new DiscordPromptNode<DataType>(prompt)
      const superRun = jest.spyOn(PromptRunner.prototype, 'run')
        .mockImplementation()
      const convertedChannel = {
        foo: 'bar'
      } as unknown as DiscordChannel
      jest.spyOn(DiscordPromptRunner, 'convertTextChannel')
        .mockReturnValue(convertedChannel)
      runner.run(node, textChannel)
      expect(superRun).toHaveBeenCalledWith(node, convertedChannel)
    })
  })
})
