import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useLocation } from "react-router-dom";

function ComprarPage() {
  const [qrCode, setQrCode] = useState(null);
  const [qrCodeImg, setQrCodeImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [ticketId, setTicketId] = useState(null);

  const location = useLocation();
  const product = location.state?.product;
  const user = location.state?.user;

  if (!product || !user) {
    return <p>Produto ou usuário não encontrados.</p>;
  }

  async function handlePagar() {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("Faça login para continuar!");
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          email: user.email,
          uid: user.uid,
          displayName: user.displayName || "Sem Nome",
        }),
      });

      const data = await response.json();

      let qrBase64 = data.qr_code_base64;
      if (!qrBase64 && data.qr_code) {
        const QRCodeLib = await import("qrcode");
        qrBase64 = await QRCodeLib.toDataURL(data.qr_code);
      }

      setQrCode(data.qr_code);
      setQrCodeImg(qrBase64);
      setExpiresAt(new Date(data.expiresAt));
      setTicketId(data.ticketId); // <-- armazena o ticketId aqui
    } catch (error) {
      console.error("Erro ao pagar:", error);
      alert("Erro ao gerar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const handleSimularPagamento = async () => {
    if (!ticketId) return alert("Gere o pagamento antes de simular.");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/simular-pagamento`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docId: ticketId }),
        }
      );
      const data = await response.json();

      if (data.ok) {
        alert("Pagamento simulado com sucesso! Ticket liberado para retirada.");
      } else {
        alert("Erro: " + data.error);
      }
    } catch (err) {
      console.error("Erro ao simular pagamento:", err);
      alert("Falha ao simular pagamento.");
    }
  };

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresAt - new Date()) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        setQrCode(null);
        setQrCodeImg(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const copy = async (qrCode) => {
    try {
      await navigator.clipboard.writeText(qrCode);
      alert("Código copiado com sucesso!");
    } catch {
      alert("Não foi possível copiar o código.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {product.title}
        </h2>
        <p className="text-lg text-gray-700 mb-4">
          Preço:{" "}
          <span className="font-semibold">R$ {product.price.toFixed(2)}</span>
        </p>

        <img
          src={product.foto}
          alt={product.title}
          className="w-64 h-auto mb-6 rounded shadow"
        />

        <button
          onClick={handlePagar}
          disabled={loading}
          className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Gerando QR Code..." : "Pagar com PIX"}
        </button>

        {qrCodeImg && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2">Escaneie o QR Code</h2>
            <img src={qrCodeImg} alt="QR Code Pix" className="w-64 h-64 mb-4" />
            <p className="mb-2 text-red-600 font-medium">
              Expira em: {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")} min
            </p>

            <h3 className="font-medium mb-2">Ou copie e cole:</h3>
            <button
              onClick={() => copy(qrCode)}
              className="bg-green-600 w-32 rounded hover:bg-green-700 text-white font-medium transition-colors mb-4"
            >
              Copiar Código
            </button>

            <button
              onClick={handleSimularPagamento}
              className="mt-2 w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Simular pagamento como aprovado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComprarPage;
