import { useState } from "react";
import server from "./server";
import { toast } from "react-toastify";
import cookies from "js-cookie";

function Transfer({ address, setBalance, isLoggedIn }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const response = await server.post(
        "/transfer",
        {
          fromAccount: address,
          toAccount: recipient,
          amount: sendAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${cookies.get("token")}`,
          },
        }
      );
      const { data } = response;
      console.log(response);
      toast.success(data.message);
    } catch (ex) {
      // alert(ex.response.data.message);
      toast.error(ex.response.data.message);
    }
  }

  return (
    <div className="container border p-5 bg-gray-200 h-[530px] rounded-lg lg:w-[600px] w-80">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        Send Transaction
      </h1>
      <hr className="border-gray-500" />

      <div className="container bg-gray-200 rounded-lg p-2">
        <div className="flex flex-col">
          <label className="block">
            <span className="text-gray-700">Send Amount:</span>
          </label>
          <input
            placeholder="1, 2, 3..."
            value={sendAmount}
            onChange={setValue(setSendAmount)}
            disabled={!isLoggedIn}
            className="border border-gray-300 rounded p-2 mt-2 focus:outline-none focus:border-teal-500"
          />

          <label className="block mt-4">
            <span className="text-gray-700">Recipient:</span>
          </label>
          <input
            placeholder="Type an address, for example: 0x2"
            value={recipient}
            onChange={setValue(setRecipient)}
            disabled={!isLoggedIn}
            className="border border-gray-300 rounded p-2 mt-2 focus:outline-none focus:border-teal-500"
          />

          <input
            type="submit"
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded mt-4"
            value="Transfer"
            disabled={!isLoggedIn}
            onClick={(e) => transfer(e)}
          />
        </div>
      </div>
    </div>
  );
}

export default Transfer;
