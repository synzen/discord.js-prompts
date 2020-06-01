/* eslint-disable @typescript-eslint/no-var-requires */
const { Client } = require('discord.js')
const {
  PromptNode,
  DiscordPromptRunner,
  Errors
} = require('discord.js-prompts');

// Create the prompts
const { askNamePrompt } = require('./prompts/askPersonDetails/askName.js')
const { askAgePrompt } = require('./prompts/askPersonDetails/askAge.js')
const { summaryPrompt } = require('./prompts/askPersonDetails/summary.js')

const client = new Client()

// Set up nodes
const askName = new PromptNode(askNamePrompt)
const askAge = new PromptNode(askAgePrompt)
const summary = new PromptNode(summaryPrompt)

askName.addChild(askAge)
askAge.addChild(summary)

// Now pass the root node, askName, to a PromptRunner, as done below
client.on('message', async (message) => {
  if (message.content === 'askdetails') {
    const runner = new DiscordPromptRunner(message.author, {})
    console.log('Running prompt')
    try {
      const data = await runner.run(askName, message.channel)
      // Data from the last prompt (askAge)
      console.log(data)
      // data.age
      // data.name
    } catch (err) {
        if (err instanceof Errors.UserInactivityError) {
          console.log('User was inactive', err)
          // User is inactive
        } else if (err instanceof Errors.UserVoluntaryExitError) {
          // User manually typed "exit"
          console.log('User exited', err)
        } else {
          // Unexpected error
        }
      }
  }
});

client.login(process.env.BOT_TOKEN);
