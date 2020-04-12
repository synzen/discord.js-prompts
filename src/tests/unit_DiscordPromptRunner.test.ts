import { DiscordPromptRunner } from "../DiscordPromptRunner"
import { User } from "../types/User"
import { DiscordChannel } from "../DiscordChannel"
import { TextChannel } from "../types/TextChannel"

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
})
