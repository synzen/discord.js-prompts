import {
  MessageVisual,
  DiscordPromptFunction,
  DiscordPrompt,
  VisualGenerator,
} from "../../../../src/index"
import { Message } from "discord.js"
import { FriendsNameData } from './types'

// Prompt to ask a friend's name
export const askFriendNameVisual: VisualGenerator<FriendsNameData> = async (data: FriendsNameData) => {
  return new MessageVisual(`What's the name of your friend #${data.names.length + 1}?`)
}

export const askFriendNameFn: DiscordPromptFunction<FriendsNameData> = async (m: Message, data: FriendsNameData) => {
  const name = m.content;
  console.log(data.count)
  return {
    ...data,
    names: [...data.names, name],
    count: (data.count as number) - 1
  }
}

export const askFriendNamePrompt = new DiscordPrompt(askFriendNameVisual, askFriendNameFn)
