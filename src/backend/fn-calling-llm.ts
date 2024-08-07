import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatOpenAI } from "@langchain/openai";

export const getFunctionCallingLLM = (schema: any) => {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.2,
  });

  const functionCallingModel = llm.bind({
    functions: [
      {
        name: "output_formatter",
        description: "Should always be used to properly format output",
        parameters: zodToJsonSchema(schema),
      },
    ],
    function_call: { name: "output_formatter" },
  });

  return functionCallingModel;
};
