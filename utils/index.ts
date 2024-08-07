import "dotenv/config";
import * as express from "express";
import * as cors from "cors";
import { createJwtMiddleware } from "../../utils/backend/jwt_middleware";
import { createBaseServer } from "../../utils/backend/base_backend/create";
import { getFunctionCallingLLM } from "./backend/fn-calling-llm";
import {
  generateTwitterPostsPrompt,
  twitterPostSchema,
  twitterPostSchemaType,
} from "./prompt";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import openai from "openai";

async function main() {
  // TODO: Set the CANVA_APP_ID environment variable in the project's .env file
  const APP_ID = process.env.CANVA_APP_ID;

  if (!APP_ID) {
    throw new Error(
      `The CANVA_APP_ID environment variable is undefined. Set the variable in the project's .env file.`
    );
  }

  const router = express.Router();

  /**
   * TODO: Configure your CORS Policy
   *
   * Cross-Origin Resource Sharing
   * ([CORS](https://developer.mozilla.org/en-US/docs/Glossary/CORS)) is an
   * [HTTP](https://developer.mozilla.org/en-US/docs/Glossary/HTTP)-header based
   * mechanism that allows a server to indicate any
   * [origins](https://developer.mozilla.org/en-US/docs/Glossary/Origin)
   * (domain, scheme, or port) other than its own from which a browser should
   * permit loading resources.
   *
   * A basic CORS configuration would include the origin of your app in the
   * following example:
   * const corsOptions = {
   *   origin: 'https://app-abcdefg.canva-apps.com',
   *   optionsSuccessStatus: 200
   * }
   *
   * The origin of your app is https://app-${APP_ID}.canva-apps.com, and note
   * that the APP_ID should to be converted to lowercase.
   *
   * https://www.npmjs.com/package/cors#configuring-cors
   *
   * You may need to include multiple permissible origins, or dynamic origins
   * based on the environment in which the server is running. Further
   * information can be found
   * [here](https://www.npmjs.com/package/cors#configuring-cors-w-dynamic-origin).
   */
  router.use(cors());

  const jwtMiddleware = createJwtMiddleware(APP_ID);
  router.use(jwtMiddleware);

  /*
   * TODO: Define your backend routes after initializing the jwt middleware.
   */
  router.get("/custom-route", async (req, res) => {
    console.log("request", req.canva);
    res.status(200).send({
      appId: req.canva.appId,
      userId: req.canva.userId,
      brandId: req.canva.brandId,
    });
  });

  router.post("/get-posts", async (req, res) => {
    const url = req.body?.url;
    const apiKey = req.body?.apiKey;

    try {
      const llm = new openai.OpenAI({ apiKey });
      await llm.models.list();
    } catch (error) {
      return res.status(400).send({ error: "Invalid OpenAI API Key" });
    }

    try {
      const loader = YoutubeLoader.createFromUrl(url, {
        language: "en",
        addVideoInfo: true,
      });

      const docs = await loader.load();

      const fnCallModel = getFunctionCallingLLM(twitterPostSchema, apiKey);

      const outputParser = new JsonOutputFunctionsParser();

      const chain = generateTwitterPostsPrompt
        .pipe(fnCallModel)
        .pipe(outputParser);

      const result = (await chain.invoke({
        transcript: docs[0].pageContent,
      })) as twitterPostSchemaType;

      return res.status(200).send(result);
    } catch (error: any) {
      return res.status(400).send({
        error: `Couldn't extract transcripts for "${url}" make sure you entered a valid Youtube URL`,
      });
    }
  });

  const server = createBaseServer(router);
  server.start(process.env.CANVA_BACKEND_PORT);
}

export type GenerateSlidesResponse = {
  slides: {
    title: string;
    content: string;
    image: string;
  }[];
};

main();
