import { auth } from "../../Firebase/FirebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { User } from 'lucide-react'

function Login() {
  const LoginGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Usuário Logado:", result.user);
    } catch (error) {
      console.log("Erro ao logar na conta", error);
    }
  };
  return (
    <div className="flex flex-row">
      <button onClick={LoginGoogle} className="flex flex-row items-center">
        Entrar <User className="ml-1 w-7 h-auto"/>
      </button>
    </div>
  );
}

export default Login;
