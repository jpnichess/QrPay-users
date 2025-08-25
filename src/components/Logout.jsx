import { auth } from "../../Firebase/FirebaseConfig";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";

function Logout() {
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Logout realizado!");
      })
      .catch((error) => {
        console.error("Erro ao fazer logout:", error);
      });
  };

  return (
    <div className="flex flex-row">
      <button onClick={handleLogout} className="flex flex-row items-center">
        Sair <LogOut className="ml-2 w-7 h-auto"/>
      </button>
    </div>
  );
}

export default Logout;