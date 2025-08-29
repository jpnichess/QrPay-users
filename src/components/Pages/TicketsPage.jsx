import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../../Firebase/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

function TicketsPage() {
  const location = useLocation();
  const { uid } = location.state; // pega o UID passado pelo navigate
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!uid) return;

    const fetchTickets = async () => {
      try {
        const q = query(collection(db, "compras"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        const fetchedTickets = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setTickets(fetchedTickets);
      } catch (err) {
        console.error("Erro ao buscar tickets:", err);
      }
    };

    fetchTickets();
  }, [uid]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Seus Tickets</h1>
      {tickets.length === 0 ? (
        <p>Nenhum ticket disponível.</p>
      ) : (
        tickets.map(ticket => (
          <div key={ticket.id} className="bg-white p-4 rounded shadow mb-4">
            <h2 className="font-medium">{ticket.product.title}</h2>
            <p>Preço: R$ {ticket.product.price}</p>
            <p>Status: {ticket.status ? "Pago " : "Pendente "}</p>

            {ticket.qr_code_retirada_base64 ? (
              <img
                src={ticket.qr_code_retirada_base64}
                alt="QR Code de Retirada"
                className="mt-2 w-40 h-40"
              />
            ) : (
              <p>QR Code de retirada não disponível.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default TicketsPage;
