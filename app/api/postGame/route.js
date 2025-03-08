import ytdl from "ytdl-core";

import  { MongoClient, ServerApiVersion } from 'mongodb';
const uri = process.env.MONGO_CONNECTION_STRING;




export async function POST(req) {
  if (!uri) {
    return new Response(JSON.stringify({ error: "Database connection string is missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }


  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  }); 

  // const { url } = req.body;
  const { url } = await req.json();
  console.log(url)

  // Validate YouTube URL
  if (!ytdl.validateURL(url)) {
    return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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

    return new Response(JSON.stringify({ title, videoId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching video info:", error);
    return new Response(JSON.stringify({ error: "Failed to retrieve video details" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
