import { User } from 'discord.js'
import { DiscordPromptRunner } from "../DiscordPromptRunner"

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
})
