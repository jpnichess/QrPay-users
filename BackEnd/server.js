import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { MercadoPagoConfig, Payment } from "mercadopago";
import serviceAccount from "../Firebase/serviceAccountKey.json" assert { type: "json" };
import QRCode from "qrcode";

dotenv.config();

// Inicializa Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Inicializa Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN,
  options: { timeout: 5000, idempotencyKey: "abc" },
});
const payment = new Payment(client);

// Configura servidor Express
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5175" }));

// --------------------
// Endpoint: criar pagamento PIX
// --------------------
app.post("/pagar", async (req, res) => {
  try {
    const { product, email, uid, displayName } = req.body;

    // Corpo do pagamento
    const body = {
      transaction_amount: product.price,
      description: product.title,
      payment_method_id: "pix",
      payer: { email },
    };

    const mpResponse = await payment.create({ body });

    // Gerar QR code para retirada
    const qrValueRetirada = `retirada:${mpResponse.id}-${Date.now()}`;
    const qrCodeBase64Retirada = await QRCode.toDataURL(qrValueRetirada);

    // Salvar no Firestore
    const docRef = await db.collection("compras").add({
      uid,
      email,
      displayName: displayName || "Sem Nome",
      product,
      status: false, // ainda não pago
      mp_id: mpResponse.id,
      qr_code: mpResponse.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: mpResponse.point_of_interaction.transaction_data.qr_code_base64,
      qr_code_retirada: qrValueRetirada,
      qr_code_retirada_base64: qrCodeBase64Retirada,
      ticket_url: mpResponse.point_of_interaction.transaction_data.ticket_url,
      createdAt: new Date(),
    });

    console.log("Compra registrada com ID:", docRef.id);

    res.json({
      id: mpResponse.id,
      qr_code: mpResponse.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: mpResponse.point_of_interaction.transaction_data.qr_code_base64,
      qr_code_retirada_base64: qrCodeBase64Retirada,
      ticket_url: mpResponse.point_of_interaction.transaction_data.ticket_url,
    });
  } catch (err) {
    console.error("Erro ao gerar pagamento:", err);
    res.status(500).json({ error: "Erro ao gerar pagamento" });
  }
});

// --------------------
// Webhook: atualizar status de pagamento
// --------------------
app.post("/webhook", async (req, res) => {
  try {
    const { id, topic } = req.body;

    if (topic !== "payment") return res.status(400).send("Evento ignorado");

    const querySnapshot = await db
      .collection("compras")
      .where("mp_id", "==", id)
      .get();

    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;

      // Gerar QR code de retirada atualizado (opcional)
      const qrValueRetirada = `retirada:${docId}-${Date.now()}`;
      const qrCodeBase64Retirada = await QRCode.toDataURL(qrValueRetirada);

      await db.collection("compras").doc(docId).update({
        status: true,
        updatedAt: new Date(),
        qr_code_retirada: qrValueRetirada,
        qr_code_retirada_base64: qrCodeBase64Retirada,
      });

      console.log("Pagamento confirmado! QR code de retirada atualizado.");
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Erro no webhook:", err);
    res.status(500).json({ error: "Erro no webhook" });
  }
});

// --------------------
// Inicializa servidor
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
