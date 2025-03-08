import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_CONNECTION_STRING;
const teamId = process.env.TEAM_ID;

export async function GET() {
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
    },
  });

  try {
    await client.connect();
    const db = client.db("sports-notes");

    const players = await db.collection("players").find({ teamId: teamId }).toArray();
    const videos = await db.collection("videos").find({ teamId: teamId }).toArray();

    return new Response(JSON.stringify({ 
      players: players.map(p => ({ name: p.name, id: p._id })), 
      videos: videos.map(v => ({ name: v.title, videoId: v.videoId })) 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
