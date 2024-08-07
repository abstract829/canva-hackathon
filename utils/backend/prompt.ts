import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { z } from "zod";

export const twitterPostSchema = z.object({
  posts: z.array(z.object({ content: z.string() })),
});

export type twitterPostSchemaType = z.infer<typeof twitterPostSchema>;

export const generateTwitterPostsPrompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      `You are a creative assistant specialized in summarizing and transforming content into engaging Twitter posts.`
    ),
    HumanMessagePromptTemplate.fromTemplate(`The user has provided the following video transcript:
            --------------------------------
            {transcript}
            --------------------------------
            Your task is to create an array where each element contains:
            1. Content: A short paragraph that can be used as a Twitter post.

            Important: Ensure that each post is free of hashtags. Focus on delivering the key message clearly and concisely, without any use of hashtags.

            The objective is to condense the information into short, impactful, and engaging posts suitable for Twitter, while adhering to the no-hashtag rule.`),
  ],
  inputVariables: ["transcript"],
});
