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

  const { name } = JSON.parse(event.body);

  

  try {


    await client.db("sports-notes").collection("players").insertOne({
      name: name,
      date: new Date,
      teamId: process.env.TEAM_ID
    })

    return  {
      statusCode: 200
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
