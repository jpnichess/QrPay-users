import { useNavigate } from "react-router-dom";

function Tickets({ user }) {
  const navigate = useNavigate();

  const onSeeTickets = () => {
    if (!user) {
      alert("Entre com sua conta Google para ver seus tickets.");
      return;
    }

    // Passa apenas uid e dados simples
    navigate("/tickets", { state: { uid: user.uid } });
  };

  return (
    <div>
      <button
        className="bg-blue-700 w-32 rounded hover:bg-blue-900 text-white font-medium transition-colors"
        onClick={onSeeTickets} 
      >
        Seus Tickets
      </button>
    </div>
  );
}

export default Tickets;
