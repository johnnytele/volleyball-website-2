import { timeStamp } from 'console';

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_CONNECTION_STRING;

const teamId = process.env.TEAM_ID;


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

  const { playerId, videoId } = await req.json();
  console.log(playerId, videoId)

  try {
    await client.connect();
    const db = client.db("sports-notes");

    const notes = await db.collection("notes").find({ teamId: teamId, playerId: playerId, videoId: videoId }).toArray();
    console.log(notes)
    return new Response(JSON.stringify({ 
      notes: notes.map(n => ({ timeStamp: n.timeStamp, note: n.note })), 

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
