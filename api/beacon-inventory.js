import admin from "firebase-admin";

const getFirebaseAdmin = (() => {
  let app;
  return () => {
    if (!app) {
      const decodedKey = Buffer.from(process.env.FIREBASE_KEY_BASE64, "base64").toString("utf-8");
      const serviceAccount = JSON.parse(decodedKey);

      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    return admin;
  };
})();

export default async function handler(req, res) {
  const token = req.headers["x-api-key"];
  if (token !== process.env.API_KEY) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const adminApp = getFirebaseAdmin();
  const db = adminApp.firestore();

  try {
    const snapshot = await db.collection("BeaconInventory").get();

    const inventarios = snapshot.docs.map(doc => {
      const data = doc.data();
      const loc = data.localizacao || {};

      return {
        inventarioId: doc.id,
        latitude: loc.latitude ?? null,
        longitude: loc.longitude ?? null,
        localizacaoTimestamp: loc.timestamp ?? null,
        beacons: data.data || [],
      };
    });

    res.status(200).json(inventarios);
  } catch (error) {
    console.error("Erro Firebase:", error);
    res.status(500).json({ error: "Erro interno" });
  }
}
