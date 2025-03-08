import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_CONNECTION_STRING;
const teamId = process.env.TEAM_ID;

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
    },
  });

  try {
    await client.connect();
    const db = client.db("sports-notes");

    const players = await db.collection("players").find({ teamId: teamId }).toArray();
    const videos = await db.collection("videos").find({ teamId: teamId }).toArray();

    return { 
      statusCode: 200,
      body:JSON.stringify({ 
        players: players.map(p => ({ name: p.name, id: p._id })), 
        videos: videos.map(v => ({ name: v.title, videoId: v.videoId })) 
      }), 
      
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to add note" }),
    };
  } finally {
    await client.close();
  }
}
