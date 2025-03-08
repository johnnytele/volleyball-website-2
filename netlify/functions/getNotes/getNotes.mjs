import  { MongoClient, ServerApiVersion } from 'mongodb';
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
    }
  }); 

  const { playerId, videoId } = JSON.parse(event.body);
  console.log(playerId, videoId)

  try {
    await client.connect();
    const db = client.db("sports-notes");

    const notes = await db.collection("notes").find({ teamId: teamId, playerId: playerId, videoId: videoId }).toArray();
    console.log(notes)
    return{ 
      body: JSON.stringify({ 
        notes: notes.map(n => ({ timeStamp: n.timeStamp, note: n.note })), 
      }),
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed fetch notes" }),
    };
  } finally {
    await client.close();
  }
}
