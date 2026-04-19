import type { PlasmoCSConfig } from "plasmo"
import { pipeline } from "@xenova/transformers"

export const config: PlasmoCSConfig = {
  matches: ["https://colab.research.google.com/*", "https://*.jupyter.org/*", "https://kaggle.com/*", "https://notebook.*/*"],
  all_frames: true
}

console.log("Mindscribe content script loaded on notebook page")

let generator: any = null

async function loadModel() {
  try {
    generator = await pipeline('text-generation', 'Xenova/gpt2')
    console.log("Model loaded")
  } catch (error) {
    console.error("Failed to load model:", error)
  }
}

// Inject the companion UI
function injectCompanion() {
  const companionDiv = document.createElement('div')
  companionDiv.id = 'mindscribe-companion'
  companionDiv.innerHTML = `
    <div style="position: fixed; top: 20px; right: 20px; width: 300px; height: 400px; background: white; border: 1px solid #ccc; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="padding: 10px; border-bottom: 1px solid #eee; cursor: move;" id="companion-header">
        <h3 style="margin: 0;">Mindscribe Companion</h3>
      </div>
      <div id="companion-chat" style="height: 300px; overflow-y: auto; padding: 10px;"></div>
      <input id="companion-input" type="text" placeholder="Share your thoughts..." style="width: 100%; padding: 8px; box-sizing: border-box;" />
    </div>
  `
  document.body.appendChild(companionDiv)

  // Make it draggable
  const header = document.getElementById('companion-header')
  let isDragging = false
  let offsetX, offsetY

  header.addEventListener('mousedown', (e) => {
    isDragging = true
    offsetX = e.clientX - companionDiv.offsetLeft
    offsetY = e.clientY - companionDiv.offsetTop
  })

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      companionDiv.style.left = (e.clientX - offsetX) + 'px'
      companionDiv.style.top = (e.clientY - offsetY) + 'px'
      companionDiv.style.right = 'auto'
    }
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
  })

  // Handle input
  const input = document.getElementById('companion-input') as HTMLInputElement
  input.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const message = input.value.trim()
      if (message) {
        addMessage('You', message)
        input.value = ''
        const response = await getAIResponse(message)
        addMessage('Companion', response)
      }
    }
  })
}

function addMessage(sender: string, text: string) {
  const chat = document.getElementById('companion-chat')
  const msgDiv = document.createElement('div')
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`
  chat.appendChild(msgDiv)
  chat.scrollTop = chat.scrollHeight
}

async function getAIResponse(message: string): Promise<string> {
  if (!generator) {
    return "Loading AI model... Please wait."
  }
  try {
    const output = await generator(message, { max_new_tokens: 50, temperature: 0.7 })
    return output[0].generated_text.replace(message, '').trim()
  } catch (error) {
    console.error("AI generation error:", error)
    return "I'm here to listen. Tell me more about what's on your mind."
  }
}

window.addEventListener("load", async () => {
  await loadModel()
  injectCompanion()
})
