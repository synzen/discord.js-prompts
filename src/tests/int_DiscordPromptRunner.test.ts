import { DiscordPrompt } from "../DiscordPrompt"
import { PromptFunction, PromptCollector, Rejection, PromptNode } from "prompt-anything"
import { DiscordPromptRunner } from '../DiscordPromptRunner'
import { EventEmitter } from 'events';
import { DiscordChannel } from '../DiscordChannel';
import { MenuVisual } from '../visuals/MenuVisual';
import { MenuEmbed } from '../MenuEmbed';
import { TextChannel } from "../types/TextChannel";
import { User } from "../types/User";
import { Message } from "../types/Message";
import { MessageReaction } from "../types/MessageReaction";

async function flushPromises(): Promise<void> {
  return new Promise(resolve => {
    setImmediate(resolve);
  });
}

const createMockTextChannel = (): TextChannel => ({
  send: jest.fn(),
  createMessageCollector: jest.fn()
})

const createMockAuthor = (authorID: string): User => ({
  id: authorID
})

const createMockMessage = (authorID: string, content = ''): Message => ({
  content,
  author: {
    id: authorID
  } as User,
  edit: jest.fn(),
  react: jest.fn(),
  createReactionCollector: jest.fn()
})

const createMockReaction = (name: string): MessageReaction => ({
  emoji: {
    name
  }
})

describe('E2E tests', () => {
  type PromptData = {
    age?: number;
    name?: string;
  }
  const authorID = 'wse4rye35th'
  let author: User
  let emit: jest.SpyInstance
  let collectorStop: jest.SpyInstance
  let emitter: PromptCollector<PromptData>
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
    const askNameFn: PromptFunction<PromptData> = async (m, data) => {
      return {
        ...data,
        name: m.content
      }
    }
    const askName = new DiscordPrompt<PromptData>({
      text: `What's your name?`
    }, askNameFn)
    const askNameNode = new PromptNode(askName)
    const runner = new DiscordPromptRunner<PromptData>(author, {})
    runner.runDiscord(askNameNode, textChannel)
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
  it(`exits when message is exit`, async () => {
    const askNameFn: PromptFunction<PromptData> = async (m, data) => {
      return {
        ...data,
        name: m.content
      }
    }
    const askName = new DiscordPrompt<PromptData>({
      text: `What's your name?`
    }, askNameFn)
    const askNameNode = new PromptNode(askName)
    const runner = new DiscordPromptRunner<PromptData>(author, {})
    runner.runDiscord(askNameNode, textChannel)
    // Wait for all pending promise callbacks to be executed for the emitter to set up
    await flushPromises()
    const exitMessage = createMockMessage(authorID, 'exit')
    collector.emit('tryCollect', exitMessage)
    await flushPromises()
    expect(emit).toHaveBeenCalledWith('exit', exitMessage)
    expect(collectorStop).toHaveBeenCalled()
  })
  it(`automatically rejects menu input`, async () => {
    const selectOptionFn: PromptFunction<PromptData> = async (m, data) => {
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
    runner.runDiscord(selectOptionNode, textChannel)
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
    const selectOptionFn: PromptFunction<PromptData> = async (m, data) => {
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
    runner.runDiscord(selectOptionNode, textChannel)
    await flushPromises()

    // React
    const nextEmoji = createMockReaction('▶')
    const reactor = createMockAuthor(authorID)
    reactCollector.emit('tryCollect', nextEmoji, reactor)
    await flushPromises()

    // Check nextPage was called
    expect(nextPage).toHaveBeenCalledTimes(1)
    const edit = reactableMessage.edit as jest.Mock
    expect(edit).toHaveBeenCalledWith('', expect.objectContaining({
      embed: {
        fields: [{
          name: '2) option2',
          value: 'd'
        }]
      }
    }))

    // Clean up
    reactCollector.removeAllListeners()
    emitter.emit('exit', createMockMessage(authorID))
  })
})
