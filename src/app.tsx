import {
  Button,
  FileInput,
  FormField,
  Rows,
  Text,
  TextInput,
  Title,
} from "@canva/app-ui-kit";
import { auth } from "@canva/user";
import { useState } from "react";
import styles from "styles/components.css";
import { ImageMimeType, ImageRef, upload, VideoRef } from "@canva/asset";
import { addNativeElement } from "@canva/preview/design";
import { getCurrentPageContext } from "@canva/design";
import { addPage } from "@canva/design";
import { twitterPostSchemaType } from "./backend/prompt";

const BACKEND_URL = `${BACKEND_HOST}`;

type State = "idle" | "loading" | "success" | "error";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const lightColors = [
  "#FFE4B5", // Amarillo Melón Claro
  "#FFEB99", // Amarillo Pálido
  "#FFEFD5", // Amarillo Durazno Claro
  "#CCE7FF", // Azul Bebé
  "#D6ECFF", // Azul Cielo Claro
  "#B3E5FC", // Azul Claro Suave
  "#E0FFD1", // Verde Menta Claro
  "#CCFFCC", // Verde Pastel Claro
  "#DFFFD6", // Verde Suave Claro
  "#F0FFF0", // Verde Blanco Suave
];

const videos = [
  "https://cdn.pixabay.com/video/2023/10/07/183960-872226574_large.mp4",
  "https://cdn.pixabay.com/video/2020/08/14/47213-451041047_large.mp4",
  "https://cdn.pixabay.com/video/2024/07/07/219862_large.mp4",
  "https://cdn.pixabay.com/video/2024/06/10/216134_large.mp4",
  "https://cdn.pixabay.com/video/2024/05/22/213026_large.mp4",
];

export const App = () => {
  const [state, setState] = useState<State>("idle");

  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");

  const [errMessage, setErrMessage] = useState<string>("");

  const handleTest = async () => {
    if (!apiKey) {
      setErrMessage("Please enter an OpenAI API Key");
      return;
    }

    if (!youtubeUrl) {
      setErrMessage("Please enter a Youtube URL");
      return;
    }

    if (!name) {
      setErrMessage("Please enter a name");
      return;
    }

    if (!userName) {
      setErrMessage("Please enter a username");
      return;
    }

    if (!profileImage) {
      setErrMessage("Please upload a profile image");
      return;
    }

    const context = await getCurrentPageContext();

    if (
      context.dimensions?.width !== 1080 ||
      context.dimensions?.height !== 1350
    ) {
      setErrMessage(
        "This app is designed to run on a 1080x1350 page. Please run it on a 1080x1350 page."
      );
      return;
    }

    setState("loading");
    try {
      const token = await auth.getCanvaUserToken();

      const res = await fetch(`${BACKEND_URL}/get-posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: youtubeUrl,
          apiKey: apiKey,
        }),
      });

      const body = (await res.json()) as twitterPostSchemaType;

      if ((body as any).error) {
        setErrMessage((body as any).error);
        setState("error");
        return;
      }

      const blueMarkUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAb1BMVEX///8dm/AAlO8Ale8Al+8Aku8SmfDz+f6y2PnS6Pvm8/3w+P7F4fqHw/b6/f/2+/4nn/HW6vy/3vpuuPTd7vyfz/fG4vozovHk8v0fnfCRyPet1fhSrfKLxfaazPd+v/VktPNCp/JbsPN4vPWl0vi4wVjJAAAJOklEQVR4nO2da5eqOgyGh1KLggqiM4zoeDvz/3/jAW+DSiEJaal78Xyctbf2tbckTdOPj4GBgYGBgYGBgYGBgYEBuwSL9DOf5Z/pIui7KQYIN8vMF/KC8LPlJuy7SZys8qQQ51UpZCb5qu+GMTHdCqm8V5QU22nfjWPgKxN18q4iRfbuGqOT0Mq7IE5vPSE3vmwRWPbjb9/NJBO3duAFf/umu0eYtHfgBekt+m4shYkP1FeO1NEbLjhpwxJagxj33WAs0xFGX8Eo7bvJOBaIIXrrxa++G40hqjVimlHynTbGI15gITHru9lwfqDbxCPyv74bDmUB2+hfeZupmBEFel7Sd9NriaPVYrII5/c//OLX0Rtyd/+UefD9HUbxvO4r7RGOZ9tECiF8IbzslKdR+VePsszcJJYWapjmp8wTJXKdnX7G3/3Im+xV4birmxxVLPdylPxMdrRl5qpwtsjXLx8r5H5iW160S2oddyUB/lKjRL/+Y8V6F1nUF+7r4xImKUTubZkE8axjP1GR/iy2ITCV/eg7a5QW7PMlzitiRomlYX0rsN9uCpkZ3TumVHuMEeUbjAeMsW6tEdTIWDwgdUKgZy4esHJgiF4RRk485knfuiqsTVjkh75X0SrywC8wdWeMlgj2qRhbN0SbUZLbgJu5NEZL5IxXYEj3203h83oae9e6sOjEPafAyK1l5oLgdIk7RSZMUQlbdSdxayG9oBhjjxMXB2kxTPnCU8QovWkYN4y1i4O0jDRyCXRyJS0RXFti6t52f0FyucK5m9OQcSKe3JyGxUTcMimkn5YZhuvUeN7lMMksTC5U7Oo0LBZTnnSxwNXNgm27CB1WyBNzc3bDZ1P474/Sf3+lcdXwLmEKDB/71qGDLU9saXGYooaLOjEptBilURlGovxhUvhlzXsapR9HxM/J5j3NbZ0bnu8lbOES2Tzgj6MxTY8NvoQHD9Aho9ZcAi1NRP8WxN4DTQzGSJSVUwv5l0fyA7yJwndLY2dhy5fVlf8TJFHmTCdsv56FQSqPD98Jy/qQLIH9ReZb6EGVPdlfsAspSiad4965lSQv5b2Y0BPgF4tuy01wtLPZq5qNbQU8V5fHDqdsKxszsMzjqnVkQ6BPoyR5TZ1Yskd1Z0gRMIypfOIthq+RHb9QnzgCvT2lRiSJExtraIHY6FoQwV1vylFiaClTVmi3tBgRW1B4I9xWFpuvX+wxfhTB3beUxdZwmQvhRZ0/6YATOLYTQZT6MAT6J9bP5zosZbE9GaNV9nhTw8fs/HZiTy/G6B85YQxhxin5AiEKtdbGc39JDUBsGVs7G4V2gSfmssKPhK10ocYYLSEnKIE70cpOoW/NimxrqANMoJWojN4YDTus48Cc008LXagvEoEwRl+RnyCFHVIvoI0T2pbMUWH9F0C2W0iOcMsjsHlCf96AMkZfGUF2/TH1O2Q2D0CJqA3G6KnjDAGdZFDtGZnFsFnUYHt0tqVAZRmI01Bl5/Bs1NqLUr8vE4zRZwATMaB9i8quJljQ0otSb4zuGCwNQJYUzaBRyf2Tm+di5R8+s+E4xAPkn5CSSe892C5Ru9jxXKwCXDD9JUz2p47RS1RSb4zyHMPKdj+YcFaokic3SCtRaGO30Ah3G4CzGnxe/otArUR9/ZkuxugDgOQFdB/WCNRIbDJGWeR5oD7cIBWqpHbtqNk0jBmjDwrb5yFyLa3twbPE514UufY7OxqjVfz2u6W4G9sN29tTL/rmjNEqgP0wxvVhw6h46EWTxmgVH3C0j7RLGwKxlV5sMEZnrCEFiIP4H/InbZJ468WG0C+HMfoHyLdA+4ftEpuMUd64Hsg/jNDmU0NlzqtEw8boHyNQKArvIDZLVFJbUYb96ibsjI0Qa2uopxKsR9oFnMsYvQOMtVHipQ29GDUYo7z64Hf0D4RfllAVBxa2wgCNedPcfLRERmP0BvzwiXT2hK11zGiMXkFcR6TFanASOY3RWwMQuVE0UxEj0cApMypXIaAt43CJvMboBdQ5PjUXAyqR1xi94CMfICCOIphEE3XfGrwXDcS1HJLVYqTk1Bqd803Na2vfF43UEdGbhg0NIeYmjlp6cWUi55FWJ5uaX9o8F0MTmSzUMoOYFyoevq9BYtvRFAVFr3ROzfPW96IBY9RTqsPdmXhL60atRH5jtFuu/gcthc7TbhomjNHO17uId2ZqexEbxmuH4c5MwaeiNKymF2fcGyHPvaeCOKd8/cuKym6Mqh+2d6K+SevN09bPb4z6fNXMiHdIH+aigTLSjG+aHIlNqMxFI8aozyUwJo+vu0T2yOjl47mG6ZTukF8lRoyyKrDVhuxylfssEXO/BwNb1QhKhPhOsdyYMEbPsFW/PHZqhhgj7/cggJz4Aph3HGMG798wVVFyuMYQ9fLoEw5XwgLklkBwuJoZU/kWh/sQkAEFweFqZkx96PJKwzMPHa59yeU/OVu/lK2MkrM1aD3JVJHO2TrCwPSZdtytBc31gBc+D8wSbPXanF1q+Oq1uToR+R4QtnN7HQ3nAxduDlPB+IqejavBaNiiNCWxi8NUsL4S6NxzTwX63HEKDr73xNuFDj7EwvYuwg3nXCjOhfSCC0+QVvBhGd0obFaEbgWfxQbBoWetaipJcvBtqUQdAEw2MIapK16UqbdkXXkPmHLzAczUgYGq+J8grdL/u9xK8mVg1NPv2+qe3zGLDUIq++tG1XBdmpF4JnrSKI5GXquuIdwL+88DK5EZXWKeiHZJrUgl/W79q/n/SoqtTX1nJj/JyC9U3nQqJaVQs0knZ1nOJktRfOrDj1fIW//YGp+PRNP8lK2lKPBVst1vSo8m6KSwtDe/8lNSfKIs8YXMDht2TwnFPA7CMIj/8j46RFflfakMFtN0vBmn0xX3+9sckEsQMz7JYZYvcu1K5tCLOYiveDPmixqHlMjG9j6VDShFkZTkfQ7eMISUYPrVnn5Isc6yOb/dFMh7tti77i6QYi73jd5mn6iyAN98k56h2JlpAuDNN39rJPpphV+ALyUF8pq5W0SHlrCOEgfzgRezTLYNGpXYmo6c2WBy8OtNHOkf/gV9JWEZ83ickVKKZPdWZlob35tlVvjrV7/dz5abf0relWCRfuaz3Wa6et/dYWBgYGBgYGBgYGBgYOBd+R+gnKE9EqZ+jQAAAABJRU5ErkJggg==";

      const topOfCard = 1350 / 2 - 350;
      const leftOfCard = 1080 / 2 - 350;

      const blueMark = await upload({
        type: "IMAGE",
        mimeType: "image/png",
        url: blueMarkUrl,
        thumbnailUrl: blueMarkUrl,
      });

      const extractedImageType = profileImage?.split(";")[0].split("/")[1];

      const profile = await upload({
        type: "IMAGE",
        mimeType: `image/${extractedImageType}` as ImageMimeType,
        url: profileImage,
        thumbnailUrl: profileImage,
      });

      let i = 0;

      for (const post of body.posts.slice(0, 5)) {
        await sleep(4000);

        await buildPageWithPost(
          name,
          userName,
          post.content,
          i,
          profile.ref,
          blueMark.ref,
          topOfCard,
          leftOfCard
        );

        i++;
      }

      setState("success");
    } catch (error) {
      console.log(error);
      setState("error");
    } finally {
      setState("idle");
    }
  };

  const buildPageWithPost = async (
    name: string,
    userName: string,
    paragraph: string,
    videoIndex: number,
    profileRef: ImageRef,
    blueMark: ImageRef,
    topOfCard: number,
    leftOfCard: number
  ) => {
    const video = await upload({
      type: "VIDEO",
      mimeType: "video/mp4",
      url: videos[videoIndex],
      thumbnailImageUrl:
        "https://www.canva.dev/example-assets/video-import/thumbnail-image.jpg",
      thumbnailVideoUrl: videos[videoIndex],
    });

    await addPage({
      background: {
        asset: {
          type: "VIDEO",
          ref: video.ref,
        },
      },
      title: "Test",
    });

    await addNativeElement({
      type: "SHAPE",
      paths: [
        {
          d: "M 0 0 H 100 V 100 H 0 L 0 0",
          fill: {
            color: "#ffffff",
            dropTarget: true,
          },
          stroke: {
            color: "#000000",
            weight: 8,
            strokeAlign: "inset",
          },
        },
      ],
      viewBox: {
        height: 100,
        width: 100,
        left: 0,
        top: 0,
      },
      height: 700,
      width: 700,
      left: leftOfCard,
      top: topOfCard,
    });

    await addNativeElement({
      type: "TEXT",
      children: [name],
      fontSize: 42,
      fontWeight: "bold",
      top: topOfCard + 30,
      left: leftOfCard + 140,
    });

    await addNativeElement({
      type: "IMAGE",
      ref: blueMark,
      top: topOfCard + 32,
      left: leftOfCard + 425,
      width: 50,
      height: 50,
    });

    await addNativeElement({
      type: "TEXT",
      children: [userName],
      fontSize: 42,
      color: "#cccccc",
      top: topOfCard + 75,
      left: leftOfCard + 140,
    });

    await addNativeElement({
      type: "SHAPE",
      paths: [
        {
          d: "M 50,0 A 50,50 0 1,1 49.9,0 Z",
          fill: {
            asset: {
              ref: profileRef,
              type: "IMAGE",
            },
          },
        },
      ],
      viewBox: {
        height: 100,
        width: 100,
        left: 0,
        top: 0,
      },
      height: 100,
      width: 100,
      left: leftOfCard + 30,
      top: topOfCard + 32,
    });

    await addNativeElement({
      type: "TEXT",
      children: [paragraph],
      fontSize: 38,
      top: topOfCard + 160,
      left: leftOfCard + 30,
      width: 600,
    });
  };

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="3u">
        <FormField
          label={`OpenAI Api Key ${apiKey ? "✅" : ""}`}
          control={(props) => (
            <TextInput
              {...props}
              onChange={(e) => setApiKey(e)}
              value={apiKey}
              placeholder="Type your OpenAI API Key"
            />
          )}
        />

        <FormField
          label={`Youtube URL ${youtubeUrl ? "✅" : ""}`}
          control={(props) => (
            <TextInput
              {...props}
              onChange={(e) => setYoutubeUrl(e)}
              value={youtubeUrl}
              placeholder="Type a youtube url"
            />
          )}
        />

        <FormField
          label={`Name ${name ? "✅" : ""}`}
          control={(props) => (
            <TextInput
              {...props}
              onChange={(e) => setName(e)}
              value={name}
              placeholder="Type a name, eg: Alex Hormozi"
            />
          )}
        />

        <FormField
          label={`Username ${userName ? "✅" : ""}`}
          control={(props) => (
            <TextInput
              {...props}
              onChange={(e) => setUserName(e)}
              value={userName}
              placeholder="Type the X username, eg: @AlexHormozi"
            />
          )}
        />
        <FormField
          label={`Profile image ${profileImage ? "✅" : ""}`}
          control={(props) => (
            <FileInput
              {...props}
              accept={[".png", ".jpg", ".jpeg"]}
              onDropAcceptedFiles={async (files) => {
                const file = files[0];

                const reader = new FileReader();

                reader.readAsDataURL(file);

                reader.onload = () => {
                  console.log("called: ", reader);
                  console.log(reader.result);
                  setProfileImage(reader.result as string);
                };
              }}
            />
          )}
        />
        <Button
          variant="primary"
          onClick={handleTest}
          loading={state === "loading"}
          stretch
        >
          Generate Posts
        </Button>

        <Text>{errMessage}</Text>
      </Rows>
    </div>
  );
};
