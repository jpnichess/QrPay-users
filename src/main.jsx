import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import "./index.css";
import ComprarPage from "./components/Pages/ComprarPage.jsx"

const router = createBrowserRouter([
{
  path: "/",
  element: <App />, 
},
{
  path: '/comprar',
  element: <ComprarPage />
}
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
  