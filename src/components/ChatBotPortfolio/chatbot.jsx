import { useState, useEffect, useRef } from "react"
import { X, ChevronUp, ChevronDown, RotateCcw } from "lucide-react"
import { fetchPortfolioData, sendChatbotMessage } from "../../api/projectApi"
import "./styles.css"
import suggestedQuestions from '../data/suggestedQuestions.json'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const [portfolioData, setPortfolioData] = useState(null)
  const [followUpQuestions, setFollowUpQuestions] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPortfolioData()
        setPortfolioData(data)
      } catch (error) {
        console.error("Error loading portfolio data:", error)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const generateFollowUpQuestions = async (lastResponse, conversationHistory) => {
    try {
      const response = await sendChatbotMessage(
        [
          ...conversationHistory,
          {
            role: "system",
            content:
              "Generate 3 follow-up questions based on the last response. Return only the questions in a JSON array format.",
          },
          { role: "user", content: `Generate 3 follow-up questions based on this response: ${lastResponse}` },
        ],
        portfolioData,
      )

      return JSON.parse(response.message)
    } catch (error) {
      console.error("Error generating follow-up questions:", error)
      return []
    }
  }

  const handleSubmit = async (content) => {
    if (!content.trim()) return

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

    const newUserMessage = {
      role: "user",
      content,
      timestamp,
      name: "You",
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInput("")
    setIsTyping(true)
    setFollowUpQuestions([])

    try {
      const chatMessages = [...messages, newUserMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
      const data = await sendChatbotMessage(chatMessages, portfolioData)
      setIsTyping(false)
      const assistantMessage = {
        role: "assistant",
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        name: "AI Assistant",
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Generate follow-up questions
      const newFollowUpQuestions = await generateFollowUpQuestions(data.message, [...chatMessages, assistantMessage])
      setFollowUpQuestions(newFollowUpQuestions)
    } catch (error) {
      console.error("Error:", error)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}. Please try again later.`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          name: "AI Assistant",
        },
      ])
    }
  }

  const handleReset = () => {
    setMessages([])
    setInput("")
    setIsTyping(false)
    setFollowUpQuestions([])
  }

  const formatMessage = (content) => {
    return content
      .split("\n")
      .map((paragraph, index) => (
        <div key={index} className="message-paragraph">
          {paragraph.trim() && (paragraph.startsWith("") ? paragraph : `${paragraph}`)}
        </div>
      ))
      .filter(Boolean)
  }

  return (
    <div className={`background-color-cards ${isOpen ? "slide-in" : "slide-out"} ${isMinimized ? "minimized" : ""}`}>
      <div className="chatbot-card-container">
        <div className="chatbot-card-header">
          <span className="chatbot-card-title">AI Assistant</span>
          <div className="header-buttons">
            <button onClick={handleReset} className="action-button" title="Reset conversation">
              <RotateCcw className="icon" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="action-button"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <ChevronUp className="icon" /> : <ChevronDown className="icon" />}
            </button>
            <button onClick={() => setIsOpen(false)} className="close-button" title="Close">
              <X className="icon" />
            </button>
          </div>
        </div>

        <div className="chat-area">
          <div className="messages-container">
          {messages.length === 0 && (
        <div className="welcome-screen">
          <div className="ai-orb" />
          <p className="welcome-text">What do you want to know about our portfolio?</p>
          <div className="suggested-questions">
            {suggestedQuestions.questions.map((q, i) => (
              <button key={i} onClick={() => handleSubmit(q.text)} className="suggested-question-button">
                {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

            {messages.map((message, i) => (
              <div key={i} className={`message ${message.role}`}>
                <div className="message-wrapper">
                  <div className="message-content">
                    {message.role === "assistant" ? formatMessage(message.content) : message.content}
                  </div>
                  {message.role === "assistant" && i === messages.length - 1 && followUpQuestions.length > 0 && (
                    <div className="follow-up-questions">
                      <p>You might also want to know:</p>
                      {followUpQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSubmit(question)}
                          className="follow-up-question-button"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="message-meta">
                    <span className="message-name">{message.name}</span>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message assistant">
                <div className="message-wrapper">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div className="message-meta">
                    <span className="message-name">AI Assistant</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="input-area">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(input)
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="chat-input"
            />
            <button type="submit" className="action-button">
              <ChevronUp className="icon" />
            </button>
          </form>
        </div>
      </div>
      {!isOpen && (
        <button className="toggle-button" onClick={() => setIsOpen(true)} title="Open chat">
          <ChevronUp className="icon" />
        </button>
      )}
    </div>
  )
}

