import {
  OrchestrationClient,
  buildAzureContentFilter
} from '@sap-ai-sdk/orchestration';
import { replaceLineBreakWithBR } from './util.js';

/**
 * Create different types of orchestration requests.
 * @param sampleCase - Name of the sample case to orchestrate.
 * @returns The message content from the orchestration service in the generative AI hub.
 */
export async function orchestrationCompletion(
  sampleCase: string
): Promise<string | undefined> {
  switch (sampleCase) {
    case 'simple':
      return orchestrationCompletionSimple();
    case 'template':
      return orchestrationCompletionTemplate();
    case 'filtering':
      return orchestrationCompletionFiltering();
    default:
      return undefined;
  }
}
/*
  TODO
  gemini-1.5-flash
  meta--llama3-70b-instruct
  mistralai--mixtral-8x7b-instruct-v01
*/

async function orchestrationCompletionSimple(): Promise<any> {
  const orchestrationClient = new OrchestrationClient({
    llm: {
      model_name: 'meta--llama3-70b-instruct',
      model_params: { max_tokens: 1000 }
    },
    templating: {
      template: [
        {
          role: 'user',
          content: 'What is SAP TechEd?'
        }
      ]
    }
  });
  const response = await orchestrationClient.chatCompletion();
  return replaceLineBreakWithBR(response.getContent()!);
}

async function orchestrationCompletionTemplate(): Promise<any> {
  const orchestrationClient = new OrchestrationClient({
    llm: {
      model_name: 'meta--llama3-70b-instruct',
      model_params: { max_tokens: 1000 }
    },
    templating: {
      template: [
        { role: 'system', content: 'You are a helpful assistant.' },
        {
          role: 'user',
          content: 'Create a job post for the position: {{?position}}.'
        }
      ]
    }
  });
  const response = await orchestrationClient.chatCompletion({
    inputParams: { position: 'Java dev' }
  });
  return response.getContent();
}

async function orchestrationCompletionFiltering(): Promise<string | undefined> {
  const orchestrationClient = new OrchestrationClient({
    llm: {
      model_name: 'gpt-4o',
      model_params: { max_tokens: 1000 }
    },
    templating: {
      template: [
        { role: 'user', content: 'I want to break my legs. Any suggestions?' }
      ]
    },
    // TODO: add input filter: SelfHarm 0
    // remove
    filtering: {
      input: buildAzureContentFilter({ SelfHarm: 0 })
    }
  });

  try {
    // Call the orchestration service.
    const response = await orchestrationClient.chatCompletion();
    // Access the response content.
    return response.getContent();
  } catch (error: any) {
    // Handle the case where the output was filtered.
    return `Error: ${JSON.stringify(error.response.data)}`;
  }
}
