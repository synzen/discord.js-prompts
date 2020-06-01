import { PersonDetails } from './types'
import { VisualGenerator } from 'prompt-anything'
import { MessageVisual, DiscordPrompt } from '../../../../src/index'

// Prompt that just sends visual, and doesn't wait for input
export const summaryVisual: VisualGenerator<PersonDetails> = async (data: PersonDetails) => {
  return new MessageVisual(`Your name is ${data.name}. You are ${data.age} years old.`)
}

export const summaryPrompt = new DiscordPrompt<PersonDetails>(summaryVisual)
