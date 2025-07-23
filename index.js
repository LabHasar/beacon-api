// index.js
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const app = express();
const port = 3000;


const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(cors()); 

//
app.get("/beacon-inventory", async (req, res) => {
  try {
    const snapshot = await db.collection("BeaconInventory").get();

    const inventarios = snapshot.docs.map(doc => {
      const docData = doc.data();
      const localizacao = docData.localizacao || {};

      return {
        inventarioId: doc.id,
        latitude: localizacao.latitude ?? null,
        longitude: localizacao.longitude ?? null,
        localizacaoTimestamp: localizacao.timestamp ?? null,
        beacons: docData.data || []
      };
    });

    res.json(inventarios);
  } catch (error) {
    console.error("Erro ao buscar dados do Firebase:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});


app.listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`);
});
