import {
  MessageVisual,
  DiscordPromptFunction,
  DiscordPrompt,
  VisualGenerator,
  Rejection,
} from "../../../../src/index"
import { Message } from "discord.js"
import { FriendsNameData } from './types'

// Prompt to ask a user how many friends they have.
export const askFriendCountVis: VisualGenerator<FriendsNameData> = async () => {
  return new MessageVisual(`How many friends do you have?`)
}

export const askFriendCountFn: DiscordPromptFunction<FriendsNameData> = async (m: Message, data: FriendsNameData) => {
  const count = Number(m.content);
  if (isNaN(count)) {
    throw new Rejection(`That's not a valid number, try again.`)
  }
  if (count < 1) {
    throw new Rejection('You have to have more than one friend! Try again.')
  }
  return {
    ...data,
    count,
  }
}

export const askFriendCountPrompt = new DiscordPrompt(askFriendCountVis, askFriendCountFn)
