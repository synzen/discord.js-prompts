import { Client, TextChannel } from 'discord.js'
import {
  DiscordPromptRunner,
  Errors
} from '../../src/index';
import askPersonDetails from './askPersonDetails'
import askFriendNames from './askFriendNames'
import { PersonDetails } from './prompts/askPersonDetails/types';
import { FriendsNameData } from './prompts/askFriendNames/types';

const client = new Client()

client.on('ready', () => console.log('Ready'))

// Now pass the root node, askName, to a PromptRunner, as done below
client.on('message', async (message) => {
  try {
    switch (message.content) {
      case 'askdetails': {
        console.log('Running ask person details prompt', new Date())
        const runner = new DiscordPromptRunner<PersonDetails>(message.author, {})
        const data = await runner.run(askPersonDetails, message.channel as TextChannel)
        // Data from the last prompt function (askAge)
        console.log(data)
        // data.age
        // data.name
        break
      }
      case 'askfriends': {
        console.log('Running ask friend names prompt')
        const runner = new DiscordPromptRunner<FriendsNameData>(message.author, {
          names: [],
        })
        const data = await runner.run(askFriendNames, message.channel as TextChannel)
        console.log(data)
        // data.names - array of friend names
      }
      default: {
        return
      }
    }
  } catch (err) {
    console.log(new Date())
    if (err instanceof Errors.UserInactivityError) {
      // User is inactive
      console.log('User was inactive', err)
    } else if (err instanceof Errors.UserVoluntaryExitError) {
      // User manually typed "exit"
      console.log('User exited', err)
    } else {
      // Unexpected error
      console.error('Unexpected error', err)
    }
  }
});

client.login(process.env.BOT_TOKEN);
