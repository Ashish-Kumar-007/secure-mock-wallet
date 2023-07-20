import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./index.css";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="container-xl flex flex-col justify-center items-center">
      <ToastContainer />
      <Navbar />
      <div className="card flex flex-col lg:flex-row justify-center items-center mt-5 mx-2 my-20">
        <div className="card mt-5 sm:mt-2 p-10">
          <Wallet
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            setAddress={setAddress}
            className="lg:w-1/2"
          />
        </div>
        <div className="card">
          <Transfer
            address={address}
            isLoggedIn={loggedIn}
            className="lg:w-1/2"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
