import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Payment } from "mercadopago";
import dotenv from "dotenv";
import admin from "../Firebase/FirebaseAdmin.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5175" }));

const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN,
  options: { timeout: 5000, idempotencyKey: "abc" },
});
const payment = new Payment(client);

app.post("/pagar", async (req, res) => {
  try {
    const { product, email, uid, displayName } = req.body;

    // Cria o pagamento no Mercado Pago
    const body = {
      transaction_amount: product.price,
      description: product.title,
      payment_method_id: "pix",
      payer: { email },
    };

    const mpResponse = await payment.create({ body });

    // Salva no Firestore
    const docRef = await admin.firestore().collection("compras").add({
      uid,
      email,
      displayName,
      product,
      status: "pendente",
      mp_id: mpResponse.id,
      createdAt: new Date(),
    });

    console.log("Compra registrada com ID:", docRef.id);

    res.json({
      qr_code: mpResponse.point_of_interaction.transaction_data.qr_code,
      qr_code_base64:
        mpResponse.point_of_interaction.transaction_data.qr_code_base64,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar pagamento" });
  }
});

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});
