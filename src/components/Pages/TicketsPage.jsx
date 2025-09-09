import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../../Firebase/FirebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function TicketsPage() {
  const location = useLocation();
  const { uid } = location.state;
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "compras"),
      where("uid", "==", uid),
      where("status", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTickets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTickets(fetchedTickets);
    });

    return () => unsubscribe();
  }, [uid]);

  return (
    <div className="p-4 w-full min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Seus Tickets
      </h1>

      {tickets.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum ticket disponível.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center"
            >
              <h2 className="font-semibold text-lg text-gray-800 mb-2 text-center">
                {ticket.product.title}
              </h2>
              <p className="text-gray-700 mb-2">
                Preço:{" "}
                <span className="font-medium">R$ {ticket.product.price}</span>
              </p>

              {ticket.qr_code_retirada_base64 && (
                <img
                  src={ticket.qr_code_retirada_base64}
                  alt="QR Code de Retirada"
                  className="w-48 h-48 sm:w-64 sm:h-64 mb-4"
                />
              )}

              <p
                className={`font-semibold mb-2 ${
                  ticket.retirado ? "text-red-600" : "text-green-600"
                }`}
              >
                {ticket.retirado ? "Já retirado." : "Disponível para retirada"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TicketsPage;
