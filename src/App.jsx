import { useState } from "react";
import Login from "./components/Login";
import "./App.css";
import { useEffect } from "react";
import { auth } from "../Firebase/FirebaseConfig";
import Logout from "./components/Logout";
import Products from "./components/Products";
import Tickets from "./components/Tickets";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged(setUser);
  }, []);

  return (
    <main className="w-screen h-screen bg-slate-200">
      <header className="w-screen h-24 items-center flex flex-row justify-center">
        <div className="w-[15rem] flex flex-row justify-between">
          {<Tickets user={user} />}
          {user ? <Logout user={user} /> : <Login />}
        </div>
      </header>
      <section>{<Products user={user} />}</section>
    </main>
  );
}

export default App;
