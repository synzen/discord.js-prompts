import { DiscordPrompt } from "../DiscordPrompt"
import { PromptCollector, Rejection, PromptNode, Errors } from "prompt-anything"
import { DiscordPromptRunner } from '../DiscordPromptRunner'
import { EventEmitter } from 'events';
import { DiscordChannel } from '../DiscordChannel';
import { MenuVisual } from '../visuals/MenuVisual';
import { MenuEmbed } from '../MenuEmbed';
import { DiscordPromptFunction } from "../types/DiscordPromptFunction";
import { TextChannel, User, Message, MessageReaction } from 'discord.js'
import { MessageVisual } from "../visuals/MessageVisual";

async function flushPromises(): Promise<void> {
  return new Promise(resolve => {
    setImmediate(resolve);
  });
}

const createMockTextChannel = (): TextChannel => ({
  id: '',
  send: jest.fn(),
  createMessageCollector: jest.fn()
}) as unknown as TextChannel

const createMockAuthor = (authorID: string): User => ({
  id: authorID
}) as unknown as User

const createMockMessage = (authorID: string, content = ''): Message => ({
  content,
  author: {
    id: authorID
  } as User,
  channel: {
    messages: {
      cache: new Map()
    }
  },
  edit: jest.fn(),
  react: jest.fn(),
  createReactionCollector: jest.fn()
}) as unknown as Message

const createMockReaction = (name: string): MessageReaction => ({
  emoji: {
    name
  }
}) as unknown as MessageReaction

describe('E2E tests', () => {
  type PromptData = {
    age?: number;
    name?: string;
  }
  const authorID = 'wse4rye35th'
  let author: User
  let emit: jest.SpyInstance
  let collectorStop: jest.SpyInstance
  let emitter: PromptCollector<PromptData, Message>
  let collector: EventEmitter
  let textChannel: TextChannel
  let channel: DiscordChannel
  beforeEach(() => {
    jest.restoreAllMocks()
    author = createMockAuthor(authorID)
    emitter = new EventEmitter()
    emit = jest.spyOn(emitter, 'emit')
    collectorStop = jest.fn()
    collector = new EventEmitter()
    Object.defineProperty(collector, 'stop', {
      value: collectorStop
    })
    jest.spyOn(DiscordPrompt.prototype, 'createEmitter')
      .mockReturnValue(emitter)
    textChannel = createMockTextChannel()
    const createMessageCollector = textChannel.createMessageCollector as jest.Mock
    createMessageCollector.mockImplementation((filter: (m: Message) => boolean) => {
      collector.on('tryCollect', (m: Message) => {
        if (filter(m)) {
          collector.emit('collect', m)
        }
      })
      return collector
    })
    channel = new DiscordChannel(textChannel)
    jest.spyOn(DiscordPromptRunner, 'convertTextChannel')
      .mockReturnValue(channel)
  })
  afterEach(() => {
    collector.removeAllListeners()
    emitter.removeAllListeners()
  })
  it(`ignores messages that are not from the author`, async () => {
    const askNameFn: DiscordPromptFunction<PromptData> = async (m, data) => {
      return {
        ...data,
        name: m.content
      }
    }
    const askNameVisual = new MessageVisual('What is your name?')
    const askName = new DiscordPrompt<PromptData>(askNameVisual, askNameFn)
    const askNameNode = new PromptNode(askName)
    const runner = new DiscordPromptRunner<PromptData>(author, {})
    runner.run(askNameNode, textChannel)
    // Wait for all pending promise callbacks to be executed for the emitter to set up
    await flushPromises()
    // Simulate unauthorized user input
    collector.emit('tryCollect', createMockMessage(authorID + 'aedg'))
    await flushPromises()
    expect(emit).not.toHaveBeenCalledWith('message')
    // Simulate authorized user input
    const collectedMessage = createMockMessage(authorID)
    collector.emit('tryCollect', collectedMessage)
    await flushPromises()
    expect(emit).toHaveBeenCalledWith('message', collectedMessage)
  })
  it(`rejects when message is exit`, async () => {
    const askNameFn: DiscordPromptFunction<PromptData> = async (m, data) => {
      return {
        ...data,
        name: m.content
      }
    }
    const askNameVisual = new MessageVisual('What is your name?')
    const askName = new DiscordPrompt<PromptData>(askNameVisual, askNameFn)
    const askNameNode = new PromptNode(askName)
    const runner = new DiscordPromptRunner<PromptData>(author, {})
    const run = runner.run(askNameNode, textChannel)
    // Wait for all pending promise callbacks to be executed for the emitter to set up
    await flushPromises()
    const exitMessage = createMockMessage(authorID, 'exit')
    collector.emit('tryCollect', exitMessage)
    await expect(run).rejects.toThrow(Errors.UserVoluntaryExitError)
    expect(emit).toHaveBeenCalledWith('exit')
    expect(collectorStop).toHaveBeenCalled()
  })
  it(`automatically rejects menu input`, async () => {
    const selectOptionFn: DiscordPromptFunction<PromptData> = async (m, data) => {
      return {
        ...data,
        name: m.content
      }
    }
    const menu = new MenuEmbed()
      .addOption('a', 'b')
      .addOption('a', 'b')
      .addOption('a', 'b')
    const menuVisual = new MenuVisual(menu)
    const selectOption = new DiscordPrompt<PromptData>(menuVisual, selectOptionFn)
    const selectOptionNode = new PromptNode(selectOption)
    const runner = new DiscordPromptRunner<PromptData>(author, {})
    runner.run(selectOptionNode, textChannel)
    await flushPromises()
    // Invalid option selection
    const invalidMessage = createMockMessage(authorID, '4')
    collector.emit('tryCollect', invalidMessage)
    await flushPromises()
    expect(emit.mock.calls[0][0]).toEqual('reject')
    expect(emit.mock.calls[0][1]).toEqual(invalidMessage)
    expect(emit.mock.calls[0][2]).toBeInstanceOf(Rejection)
    // Valid option selection
    const validMessage = createMockMessage(authorID, '3')
    collector.emit('tryCollect', validMessage)
    await flushPromises()
    expect(emit.mock.calls[1][0]).toEqual('message')
    expect(emit.mock.calls[1][1]).toEqual(validMessage)
  })
  it('changes embed to the next page with MenuEmbed', async () => {
    const selectOptionFn: DiscordPromptFunction<PromptData> = async (m, data) => {
      return {
        ...data,
        name: m.content
      }
    }
    const menu = new MenuEmbed(undefined, { maxPerPage: 1 })
      .addOption('option1', 'd')
      .addOption('option2', 'd')
      .addOption('option3', 'd')
      .enablePagination(err => {
        throw err
      })
    const nextPage = jest.spyOn(menu, 'nextPage')
    const menuVisual = new MenuVisual(menu)
    const selectOption = new DiscordPrompt<PromptData>(menuVisual, selectOptionFn)
    const selectOptionNode = new PromptNode(selectOption)
    const runner = new DiscordPromptRunner<PromptData>(author, {})

    // Create mocks
    const reactableMessage = createMockMessage(authorID)
    const createReactionCollector = reactableMessage.createReactionCollector as jest.Mock
    const reactCollector = new EventEmitter()
    createReactionCollector.mockImplementation((filter: (r: MessageReaction) => boolean) => {
      reactCollector.on('tryCollect', (r: MessageReaction, user: User) => {
        if (filter(r)) {
          reactCollector.emit('collect', r, user)
        }
      })
      return reactCollector
    })
    const textChannelSend = textChannel.send as jest.Mock
    textChannelSend.mockResolvedValue(reactableMessage)

    // Run
    const run = runner.run(selectOptionNode, textChannel)
    await flushPromises()

    // React
    const nextEmoji = createMockReaction('▶')
    const reactor = createMockAuthor(authorID)
    reactCollector.emit('tryCollect', nextEmoji, reactor)
    await flushPromises()

    // Check nextPage was called
    expect(nextPage).toHaveBeenCalledTimes(1)
    const edit = reactableMessage.edit as jest.Mock
    expect(edit).toHaveBeenCalledWith('', {
      embed: expect.objectContaining({
        fields: [{
          name: '2) option2',
          value: 'd',
          inline: false
        }]
      })
    })

    // Clean up
    reactCollector.removeAllListeners()
    emitter.emit('exit')
    await expect(run).rejects.toThrow(Errors.UserVoluntaryExitError)
  })
})
