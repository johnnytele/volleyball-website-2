const { MongoClient, ServerApiVersion } = require('mongodb');
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

  const { name } = await req.json();

  

  try {


    await client.db("sports-notes").collection("players").insertOne({
      name: name,
      date: new Date,
      teamId: process.env.TEAM_ID
    })

    return new Response(JSON.stringify({ name }), {
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
