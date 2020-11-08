/* eslint-disable @typescript-eslint/no-var-requires */
const { Client } = require('discord.js')
const {
  DiscordPromptRunner,
  Errors
} = require('discord.js-prompts');
const { askPersonDetails } = require('./askPersonDetails.js')

const client = new Client()

client.on('ready', () => console.log('Ready'))

// Now pass the root node, askPersonDetails, to a PromptRunner, as done below
client.on('message', async (message) => {
  try {
    switch (message.content) {
      case 'askdetails': {
        console.log('Running ask person details prompt')
        const runner = new DiscordPromptRunner(message.author, {})
        const data = await runner.run(askPersonDetails, message.channel)
        // Data from the last prompt (askAge)
        console.log(data)
        // data.age
        // data.name
        break
      }
      default: {
        break
      }
    }
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
});

client.login(process.env.BOT_TOKEN);
