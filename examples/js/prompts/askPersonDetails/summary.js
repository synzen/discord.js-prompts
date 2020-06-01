/* eslint-disable @typescript-eslint/no-var-requires */
const {
  MessageVisual,
  DiscordPrompt
} = require('discord.js-prompts')

// Prompt that just sends visual, and doesn't wait for input
export const summaryVisual = async (data) => {
  return new MessageVisual(`Your name is ${data.name}. You are ${data.age} years old.`)
}

export const summaryPrompt = new DiscordPrompt(summaryVisual)
