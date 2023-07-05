import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="app">
      <ToastContainer />
      <Navbar />
      <Wallet loggedIn={loggedIn} setLoggedIn={setLoggedIn} setAddress ={setAddress} />
      <Transfer
        address={address}
        isLoggedIn={loggedIn}
      />
    </div>
  );
}

export default App;
