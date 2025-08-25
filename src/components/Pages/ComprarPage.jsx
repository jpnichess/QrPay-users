import { useState } from "react";
import { getAuth } from "firebase/auth";

function ComprarPage() {
  const [qrCode, setQrCode] = useState(null);
  const [qrCodeImg, setQrCodeImg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Produto que será mostrado na tela
  const product = {
    title: "Salchipão SENAI",
    price: 0.01,
    foto: "salchipao.png", // coloque a imagem na pasta public ou use URL
  };

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

      const response = await fetch("http://localhost:5000/pagar", {
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
      setQrCode(data.qr_code);
      setQrCodeImg(data.qr_code_base64);
    } catch (error) {
      console.error("Erro ao pagar:", error);
      alert("Erro ao gerar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const copy = async (qrCode) => {
    try {
      await navigator.clipboard.writeText(qrCode);
      console.log("Código copiado com sucesso!");
    } catch (error) {
      console.error("Falha ao copiar o Código:", error);
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
            <img
              src={`data:image/png;base64,${qrCodeImg}`}
              alt="QR Code Pix"
              className="w-64 h-64 mb-4"
            />

            <h3 className="font-medium mb-2">Ou copie e cole:</h3>
            <button
              onClick={() => copy(qrCode)}
              className="bg-green-600 w-32 rounded hover:bg-green-700 text-white font-medium transition-colors mb-10"
            >
              Copiar Código
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComprarPage;
