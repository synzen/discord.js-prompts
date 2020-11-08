import {
  PromptNode,
} from '../../src/index';

/**
 * STEP 1
 * Create the prompts with their visual and functional components
 */
import { askFriendNamePrompt } from './prompts/askFriendNames/askFriendName'
import { askFriendCountPrompt } from './prompts/askFriendNames/askFriendCount'
import { summaryPrompt } from './prompts/askFriendNames/summary'

/**
 * STEP 2
 * Set up prompt nodes that are used within a dialogue. The conditions
 * are also set here.
 */

// Ask how many friends they have
const askFriendCount = new PromptNode(askFriendCountPrompt)
// Ask for the friend's name
const askFriendName = new PromptNode(askFriendNamePrompt, async (data) => {
  return typeof data.count === 'number' && data.count > 0
})
// Say how many friends the user has, and the names they input
const summary = new PromptNode(summaryPrompt, async (data) => {
  return typeof data.count === 'number' && data.count === 0
})

/**
 * STEP 3
 * Connect the prompts to create the flow of the dialogue
 */

// Ask the user to name a friend for as many times they 
askFriendCount.addChild(askFriendName)

// Ask friend name can recurse on itself, depending on how many friends the user has
askFriendName.setChildren([
  askFriendName,
  summary
])

/**
 * STEP 4
 * Return the root node for the PromptRunner to run
 */
export default askFriendCount
