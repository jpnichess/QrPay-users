import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import QRCode from "qrcode";

dotenv.config();

// Inicializa Firebase usando variáveis de ambiente
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// Inicializa Express
const app = express();
app.use(express.json());
app.use(cors());

// ... resto do código igual

// --------------------
// Função: pagamento simulado
// --------------------
async function gerarPagamentoSimulado(product, user) {
  const id = Math.floor(Math.random() * 1000000);
  const EXPIRATION_MINUTES = 15;
  const expirationDate = new Date(Date.now() + EXPIRATION_MINUTES * 60 * 1000);

  const qrCodeValue = `compra:${id}-${Date.now()}`;
  const qrCodeBase64 = await QRCode.toDataURL(qrCodeValue);

  return {
    id,
    product,
    user,
    status: false,
    qr_code: qrCodeValue,
    qr_code_base64: qrCodeBase64,
    expiresAt: expirationDate,
  };
}

// --------------------
// Endpoint: criar pedido/pagamento
// --------------------
app.post("/pagar", async (req, res) => {
  try {
    const { product, email, uid, displayName } = req.body;

    if (!product || !product.price || !product.title || !email || !uid) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    const pagamento = await gerarPagamentoSimulado(product, {
      email,
      uid,
      displayName,
    });

    const docRef = await db.collection("compras").add({
      uid,
      email,
      displayName: displayName || "Sem Nome",
      product,
      status: false,
      qr_code: pagamento.qr_code,
      qr_code_base64: pagamento.qr_code_base64,
      qr_code_retirada: null,
      qr_code_retirada_base64: null,
      retirada_valida: false,
      createdAt: new Date(),
      qr_code_expiration: pagamento.expiresAt,
      retirado: false,
    });

    res.json({
      ticketId: docRef.id,
      qr_code: pagamento.qr_code,
      qr_code_base64: pagamento.qr_code_base64,
      expiresAt: pagamento.expiresAt,
    });
  } catch (err) {
    console.error("Erro ao gerar pagamento simulado:", err);
    res.status(500).json({ error: "Erro ao gerar pagamento simulado" });
  }
});
app.post("/simular-pagamento", async (req, res) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res
        .status(400)
        .json({ ok: false, error: "ID do ticket é obrigatório" });
    }

    const docRef = db.collection("compras").doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res
        .status(404)
        .json({ ok: false, error: "Ticket não encontrado" });
    }

    // Gerar QR code de retirada
    const qrValueRetirada = `retirada:${docId}-${Date.now()}`;
    const QRCodeLib = await import("qrcode");
    const qrCodeBase64Retirada = await QRCodeLib.toDataURL(qrValueRetirada);

    await docRef.update({
      status: true,
      retirada_valida: true,
      qr_code_retirada: qrValueRetirada,
      qr_code_retirada_base64: qrCodeBase64Retirada,
      updatedAt: new Date(),
    });

    res.json({
      ok: true,
      qr_code_retirada: qrValueRetirada,
      qr_code_retirada_base64: qrCodeBase64Retirada,
    });
  } catch (err) {
    console.error("Erro ao simular pagamento:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --------------------
// Inicializa servidor
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
