import {
  MessageVisual,
  DiscordPrompt,
  VisualGenerator,
} from "../../../../src/index"
import { FriendsNameData } from './types'

// Prompt to ask a friend's name
export const summaryVis: VisualGenerator<FriendsNameData> = async (data: FriendsNameData) => {
  return new MessageVisual(`You have ${data.names.length} friends, their names are: ${data.names.join(', ')}!`)
}

export const summaryPrompt = new DiscordPrompt(summaryVis)
