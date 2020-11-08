import {
  PromptNode,
} from '../../src/index';

// Create the prompts
import { askNamePrompt } from './prompts/askPersonDetails/askName'
import { askAgePrompt } from './prompts/askPersonDetails/askAge'
import { summaryPrompt } from './prompts/askPersonDetails/summary'

// Set up nodes
const askName = new PromptNode(askNamePrompt)
const askAge = new PromptNode(askAgePrompt)
const summary = new PromptNode(summaryPrompt)

// Set up paths
askName.addChild(askAge)
askAge.addChild(summary)

export default askName

