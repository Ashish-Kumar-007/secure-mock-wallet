import { useState } from "react";
import server from "./server";
import { toast } from "react-toastify";
import { TbClipboardCopy } from "react-icons/tb";

function Wallet({ address, setAddress, balance, setBalance }) {
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset "copied" state after 2 seconds
      })
      .catch((error) => {
        console.error("Error copying text:", error);
      });
  };

  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  const generateWallet = async (e) => {
    e.preventDefault();
    if (password) {
      if (password.length < 8) {
        toast.error("Password length must be equal or greater than 8!");
        return;
      }
      try {
        const response = await server.post(
          "/generate",
          { password },
          {
            headers: {
              "Content-Type": "application/json",
              Origin: "https://secure-mock-wallet.vercel.app",
            },
          }
        );
        console.log(response.data);
        setIsSuccess(true);
        setWalletAddress(response.data.walletAddress);
        toast.success("Wallet created! 🎉");

        // Handle the response from the backend
      } catch (error) {
        console.error(error);
        // Handle the error from the backend
      }
    } else {
      toast.error("Please enter a password first!");
      return;
    }
  };

  const logInWallet = async (e) => {
    e.preventDefault();
  };

  return (
    <div className="container wallet">
      <input
        type="text"
        placeholder="Enter password"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      {isSuccess ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "5px",
          }}
        >
          <small style={{ marginRight: "8px" }}>{walletAddress}</small>
          <button
            onClick={() => handleCopy(walletAddress)}
            style={{
              backgroundColor: "#319795",
              color: "white",
              border: "none",
              padding: "2px 5px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <TbClipboardCopy size={15} />
          </button>
        </div>
      ) : null}

      <button
        type="submit"
        className="button"
        onClick={(e) => {
          generateWallet(e);
        }}
      >
        Generate Wallet
      </button>

      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input
          placeholder="Enter Wallet Address"
          value={address}
          onChange={onChange}
        ></input>
      </label>

      <label>
        Password
        <input
          placeholder="Enter Password"
          value={password}
          onChange={onChange}
        ></input>
      </label>

      <button
        type="submit"
        className="button"
        onClick={(e) => {
          logInWallet(e);
        }}
      >
        Log in
      </button>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
