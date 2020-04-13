import { DiscordPromptRunner } from "../DiscordPromptRunner"
import { User } from "../interfaces/User"
import { DiscordChannel } from "../DiscordChannel"
import { TextChannel } from "../interfaces/TextChannel"
import { PromptNode, PromptRunner } from "prompt-anything"
import { DiscordPrompt } from "../DiscordPrompt"

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
        authorID: 'asewdgtr'
      }
      const runner = new DiscordPromptRunner(author, data)
      expect(runner.initialData).toEqual({
        ...data,
        authorID: author.id
      })
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
      type DataType = {}
      const textChannel = {} as TextChannel
      const discordChannel = new DiscordChannel(textChannel)
      const runner = new DiscordPromptRunner({} as User, {})
      const prompt = new DiscordPrompt<DataType>({ text: '' })
      const node = new PromptNode<DataType>(prompt)
      const superRun = jest.spyOn(PromptRunner.prototype, 'run')
        .mockImplementation()
      runner.run(node, discordChannel)
      expect(superRun).toHaveBeenCalledWith(node, discordChannel)
    })
    it('accepts a TextChannel', () => {
      type DataType = {}
      const textChannel = {} as TextChannel
      const runner = new DiscordPromptRunner({} as User, {})
      const prompt = new DiscordPrompt<DataType>({ text: '' })
      const node = new PromptNode<DataType>(prompt)
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
