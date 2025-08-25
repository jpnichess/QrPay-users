import { useState } from "react";
import Login from "./components/Login";
import "./App.css";
import { useEffect } from "react";
import { auth } from "../Firebase/FirebaseConfig";
import Logout from "./components/Logout";
import Products from "./components/Products";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged(setUser);
  }, []);

  return (
    <main className="w-screen h-screen bg-slate-200">
      <header className="w-screen h-24 items-center flex flex-row justify-center">
        <img src="senai.png" alt="logo" className="w-44 h-auto mr-6" />
        {user ? <Logout user={user} /> : <Login />}
      </header>
      <section>{<Products user={user} />}</section>
    </main>
  );
}

export default App;
