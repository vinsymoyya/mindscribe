import { useState } from "react"

function IndexPopup() {
  const [status, setStatus] = useState("Mindscribe is ready!")

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        width: 300
      }}>
      <h2>Mindscribe Companion</h2>
      <p>Your AI journaling companion for notebooks.</p>
      <p>Visit a notebook site (Colab, Jupyter, etc.) to see the companion in action.</p>
      <p>Status: {status}</p>
      <button onClick={() => setStatus("Activated!")}>Activate</button>
    </div>
  )
}

export default IndexPopup
