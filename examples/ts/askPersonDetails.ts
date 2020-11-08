import {
  PromptNode,
} from '../../src/index';

// Step 1: Create the prompts
import { askNamePrompt } from './prompts/askPersonDetails/askName'
import { askAgePrompt } from './prompts/askPersonDetails/askAge'
import { summaryPrompt } from './prompts/askPersonDetails/summary'

// Step 2: Set up nodes to set up relationships
const askName = new PromptNode(askNamePrompt)
const askAge = new PromptNode(askAgePrompt)
const summary = new PromptNode(summaryPrompt)

// Step 3: Create the relationships
askName.addChild(askAge)
askAge.addChild(summary)

export default askName

