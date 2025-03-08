import ytdl from "ytdl-core";

import  { MongoClient, ServerApiVersion } from 'mongodb';
const uri = process.env.MONGO_CONNECTION_STRING;




export const handler = async (event) => {
  if (!uri) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database connection string is missing" }),
    };
  }


  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  }); 

  // const { url } = req.body;
  const { url } = JSON.parse(event.body);
  console.log(url)

  // Validate YouTube URL
  if (!ytdl.validateURL(url)) {
    return {body: JSON.stringify({ error: "Invalid YouTube URL" }), 
      statusCode: 400,
    }
  }

  try {
    const info = await ytdl.getBasicInfo(url);
    const videoId = info.videoDetails.videoId;
    const title = info.videoDetails.title;

    console.log("Title:", title);
    console.log("Video ID:", videoId);

    await client.db("sports-notes").collection("videos").insertOne({
      title: title,
      videoId: videoId,
      date: new Date,
      teamId: process.env.TEAM_ID
    })

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error fetching video info:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to add note" }),
    };
  } finally {
    await client.close();
  }
}
