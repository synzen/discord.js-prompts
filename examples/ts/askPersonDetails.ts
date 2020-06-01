import { Client, TextChannel } from 'discord.js'
import {
  PromptNode,
  DiscordPromptRunner,
  Errors
} from '../../src/index';

// Create the prompts
import { askNamePrompt } from './prompts/askPersonDetails/askName'
import { askAgePrompt } from './prompts/askPersonDetails/askAge'
import { summaryPrompt } from './prompts/askPersonDetails/summary'
import { PersonDetails } from './prompts/askPersonDetails/types'

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
    const runner = new DiscordPromptRunner<PersonDetails>(message.author, {})
    console.log('Running prompt')
    try {
      const data = await runner.run(askName, message.channel as TextChannel)
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
