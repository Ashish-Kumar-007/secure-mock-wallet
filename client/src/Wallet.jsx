import { useState } from "react";
import server from "./server";
import { toast } from "react-toastify";
import { TbClipboardCopy } from "react-icons/tb";

function Wallet({ loggedIn, setLoggedIn, setAddress }) {
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [wallet, setwallet] = useState("");
  const [logInPswd, setLogInPswd] = useState("");
  const [balance, setBalance] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset "copied" state after 2 seconds
        toast.success("copied!");
      })
      .catch((error) => {
        console.error("Error copying text:", error);
      });
  };

  const generateWallet = async (e) => {
    e.preventDefault();
    if (password) {
      if (password.length < 8) {
        toast.error("Password length must be equal to or greater than 8!");
        return;
      }

      // Additional password validity checks
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const hasUppercaseLetter = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);

      if (!hasSpecialChar || !hasUppercaseLetter || !hasNumber) {
        toast.error(
          "Password must contain at least one special character, one uppercase letter, and one number!"
        );
        return;
      }

      try {
        const response = await server.post(
          "/generate",
          { password },
          {
            headers: {
              "Content-Type": "application/json",
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
    if (logInPswd && wallet) {
      try {
        const response = await server.post("/login", {
          wallet: wallet,
          password: logInPswd,
        });
        const { data } = response;
        console.log(response.status === 200);
        if (response.status === 200) {
          // Store the received JWT token in localStorage or as a secure cookie
          // localStorage.setItem("token", data.token);
          setIsLoggedIn(true);
          setLoggedIn(true);
          setAddress(wallet)
          setBalance(data.balance);
          toast.success(`${data.message} 🎉`);
        } else {
          // Handle authentication failure
          console.log(data.message);
          toast.error(data.message);
        }
        // Handle the response from the backend
      } catch (error) {
        console.error(error);
        toast.error(`${error.response.data.error} ❌`);
        // Handle the error from the backend
      }
    } else {
      toast.error("Please fill all details!");
      return;
    }
  };

  const logOutWallet = async (e) => {
    e.preventDefault();
    try {
      const response = await server.get("/logout");
      const { data } = response;
      console.log(response.status === 200);
      if (response.status === 200) {
        // Store the received JWT token in localStorage or as a secure cookie
        setIsLoggedIn(false);
        setLoggedIn(false);
        setAddress("")
        setBalance(data.balance);
        toast.success(`${data.message} 🎉`);
      } else {
        // Handle authentication failure
        console.log(data.message);
        toast.error(data.message);
      }
      // Handle the response from the backend
    } catch (error) {
      console.error(error);
      toast.error(`${error.response.data.error} ❌`);
      // Handle the error from the backend
    }
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
          <small className="truncate-text">{walletAddress}</small>
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
          onChange={(e) => setwallet(e.target.value)}
        ></input>
      </label>

      <label>
        Password
        <input
          placeholder="Enter Password"
          onChange={(e) => setLogInPswd(e.target.value)}
        ></input>
      </label>
      {isLoggedIn ? (
        <button
          type="submit"
          className="button"
          onClick={(e) => {
            logOutWallet(e);
          }}
        >
          Log out
        </button>
      ) : (
        <button
          type="submit"
          className="button"
          onClick={(e) => {
            logInWallet(e);
          }}
        >
          Log in
        </button>
      )}

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
