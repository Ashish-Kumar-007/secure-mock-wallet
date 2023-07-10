import { useState } from "react";
import server from "./server";
import { toast } from "react-toastify";
import { TbClipboardCopy, TbClipboardCheck } from "react-icons/tb";
import cookies from "js-cookie";

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
        setPassword("")
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
          cookies.set("token", data.token);
          setIsLoggedIn(true);
          setLoggedIn(true);
          setAddress(wallet);
          setBalance(data.balance);
          toast.success(`${data.message}✔️`);
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
        setAddress("");
        setBalance(data.balance);
        toast.success(`${data.message}✔️`);
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
    <div className="container border bg-gray-200 rounded-lg p-4 h-[570px] lg:w-[600px] w-80 ">
      <div className="container bg-gray-200 rounded-lg p-2">
        <div className="flex flex-col">
          <input
            type="text"
            placeholder="Enter password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className="border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:border-teal-500"
          />
          {isSuccess ? (
            <div className="flex justify-between items-center mt-1">
              <small className="truncate text-gray-700 w-60">
                {walletAddress}
              </small>
              <button
                onClick={() => handleCopy(walletAddress)}
                className="bg-teal-500 text-white border-none px-2 py-1 rounded cursor-pointer"
              >
                {copied ? (
                  <TbClipboardCheck size={20} />
                ) : (
                  <TbClipboardCopy size={20} />
                )}
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded mt-4 w-full"
          onClick={(e) => {
            generateWallet(e);
          }}
          disabled = {isSuccess}
        >
          Generate Wallet
        </button>
      </div>

      <h1 className="text-3xl font-bold mt-4 text-gray-800 mb-2">
        Your Wallet
      </h1>
      <hr className="border-gray-500" />

      <div className="container bg-gray-200 rounded-lg p-2">
        <div className="flex flex-col">
          <label className="block mt-4">
            <span className="mb-2">Wallet Address:</span>
          </label>
          <input
            placeholder="Enter Wallet Address"
            onChange={(e) => setwallet(e.target.value)}
            className="border border-gray-300 rounded p-2 mt-2 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="block mt-4">Password:</label>
          <input
            placeholder="Enter Password"
            onChange={(e) => setLogInPswd(e.target.value)}
            className="border border-gray-300 rounded p-2 mt-2 focus:outline-none focus:border-teal-500"
          />

          {isLoggedIn ? (
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mt-4 w-full"
              onClick={(e) => {
                logOutWallet(e);
              }}
            >
              Log out
            </button>
          ) : (
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded mt-4 w-full"
              onClick={(e) => {
                logInWallet(e);
              }}
            >
              Log in
            </button>
          )}
        </div>

        <div className="balance mt-4 bg-gray-300 p-2 text-gray-700">
          Balance: {balance}
        </div>
      </div>
    </div>
  );
}

export default Wallet;
