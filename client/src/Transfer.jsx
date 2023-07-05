import { useState } from "react";
import server from "./server";
import { toast } from "react-toastify";

function Transfer({ address, setBalance, isLoggedIn }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const response = await server.post("/transfer", {
        fromAccount: address,
        toAccount: recipient,
        amount: sendAmount,
      });
      const { data } = response;
      console.log(response);
      toast.success(data.message);
    } catch (ex) {
      // alert(ex.response.data.message);
      toast.error(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
          disabled={!isLoggedIn}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
          disabled={!isLoggedIn}
        ></input>
      </label>

      <input
        type="submit"
        className="button"
        value="Transfer"
        disabled={!isLoggedIn}
      />
    </form>
  );
}

export default Transfer;
