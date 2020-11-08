/* eslint-disable @typescript-eslint/no-var-requires */
const {
  PromptNode,
} = require('discord.js-prompts');

// Create the prompts
const { askNamePrompt } = require('./prompts/askPersonDetails/askName.js')
const { askAgePrompt } = require('./prompts/askPersonDetails/askAge.js')
const { summaryPrompt } = require('./prompts/askPersonDetails/summary.js')

// Set up nodes
const askName = new PromptNode(askNamePrompt)
const askAge = new PromptNode(askAgePrompt)
const summary = new PromptNode(summaryPrompt)

askName.addChild(askAge)
askAge.addChild(summary)

module.exports = askName
