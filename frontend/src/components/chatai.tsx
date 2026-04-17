import React, { useEffect, useState, useRef } from "react";
import { FaMinus, FaPaperPlane, FaUser, FaComment, FaCommentDots, FaHeadset, FaCommentAlt } from "react-icons/fa"; 
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight';

interface ChatWidgetProps {
  currentSystemMessage: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ currentSystemMessage }) => {
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    { role: 'system', content: 'You are a Furniture Store Website Helping Assistant for Users to get info about products, services, and answer their queries. Keep your responses concise. Here are important links (port 5173): \n\n' + 
      '- Main Routes: login: http://localhost:5173/login, register: http://localhost:5173/signup\n' +
      '- Buy Routes: http://localhost:5173/buy, /living, /storage, /bedroom, /dining, /chairs, /tables, /mattress, /best-deals\n' + 
      '- Rent Routes: http://localhost:5173/rent, /rent-living, /rent-storage, /rent-bedroom, /rent-dining, /rent-chairs, /rent-tables, /rent-mattress, /rent-best-deals\n' + 
      '- Account: http://localhost:5173/profile, /cart, /wishlist, /order-history, /payment-history, /booking-confirmation\n' +
      '- Info: http://localhost:5173/about-us, /contact-us, /term-condition, /privacy\n' 
    },
    {
      role: "assistant",
      content: "Hi! I'm your Furniture Store Assistant. How can I help you today?"
    }]);

  const [streamedResponse, setStreamedResponse] = useState<string>('')
  const [isMinimized, setIsMinimized] = useState(true);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, streamedResponse, isAiTyping]);

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex space-x-1 p-2 rounded-lg">
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-150"></div>
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-300"></div>
    </div>
  );

  const handleKeyDownAiChat = async () => {
    let current = [...chatHistory, { role: 'user', content: message }]
    setChatHistory(current)
    setMessage('') // Clear the input after sending the command
    setStreamedResponse('')
    setIsAiTyping(true) // Show typing indicator
    let bufferedResponse = ''

    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'stablelm-zephyr:latest',
          messages: current
        })
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          bufferedResponse += chunk

          // Split the buffered response into individual JSON objects
          const jsonChunks = bufferedResponse.split('\n')

          for (let jsonString of jsonChunks) {
            jsonString = jsonString.trim() // Remove any surrounding whitespace

            // Skip empty chunks
            if (!jsonString) continue

            try {
              const message = JSON.parse(jsonString)

              setStreamedResponse((prevResponse) => {
                const updatedResponse = prevResponse + message.message.content
                scrollToBottom()
                return updatedResponse
              })

              // Check if the message is done
              if (message.done) {
                setStreamedResponse((finalResponse) => {
                  console.log('Final Streamed Response: ', finalResponse) // Log the final streamed response
                  current = [...current, { role: 'assistant', content: finalResponse }]
                  setChatHistory(current)
                  return ''
                })

                setIsAiTyping(false) // Hide typing indicator when done
                setStreamedResponse('')
              }
            } catch (error) {
              console.error('Failed to parse JSON:', jsonString, error)
            }
          }

          // Clear bufferedResponse after processing each chunk
          bufferedResponse = ''
        }
      }
    } catch (error) {
      console.error('Error sending command to AI:', error)
      setIsAiTyping(false) // Make sure to hide typing indicator on error
    }
  }

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      const userMessage = { role: "user", content: message };
      setChatHistory((prev) => [...prev, userMessage]);
      setMessage("");

      // Send the message to the AI
      handleKeyDownAiChat();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    if (currentSystemMessage) {
      const systemMessage = { role: "system", content: currentSystemMessage };
      setChatHistory((prev) => [...prev, systemMessage]);
    }
  }, [currentSystemMessage]);

  return (
    <div className={`fixed bottom-4 right-4 ${isMinimized ? 'w-14 h-14 rounded-full' : 'h-[500px] w-[350px] rounded-lg'} bg-white shadow-2xl flex flex-col transition-all duration-300 z-50 border border-gray-200 overflow-hidden`}>
      {isMinimized ? (
        // Minimized state - show only a floating icon
        <div 
          className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-800 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={handleMinimize}
        >
          <FaCommentAlt className="text-white" size={22} />
        </div>
      ) : (
        // Full chat widget
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white p-3 rounded-t-lg flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={handleMinimize}>
              <FaComment className="text-white" size={18} />
              <span className="font-medium">Furniture Store Assistant</span>
            </div>
            <button
              onClick={handleMinimize}
              className="text-white hover:text-gray-200 transition duration-200 focus:outline-none"
              aria-label="Minimize chat"
            >
              <FaMinus size={16} />
            </button>
          </div>

          {/* Chat History */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50 to-white"
            style={{ scrollBehavior: 'smooth' }}
          >
            {chatHistory.filter(chat => chat.role !== 'system').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3 opacity-70">
                <FaCommentDots size={40} className="text-purple-400" />
                <p className="text-gray-500 text-center">
                  How can I help you with our furniture store today?
                </p>
              </div>
            ) : (
              chatHistory.filter(chat => chat.role !== 'system').map((chat, index) => (
                <div
                  key={index}
                  className={`flex items-end space-x-2 ${chat.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  {chat.role !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <FaHeadset className="text-white" size={14} />
                    </div>
                  )}
                  
                  <div
                    className={`
                      max-w-[70%] rounded-2xl shadow-sm p-3
                      ${chat.role === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                      }
                    `}
                  >
                    {chat.role === "user" ? (
                      <p className="text-sm">{chat.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm max-w-none">
                        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                          {chat.content.replace(/(http:\/\/[^\s]+)/g, '$1*').replace(/(important|highlight)/gi, '$1*')}
                        </Markdown>
                      </div>
                    )}
                  </div>
                  
                  {chat.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-gray-600" size={14} />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {streamedResponse && (
              <div className="flex items-end space-x-2 justify-start animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <FaHeadset className="text-white" size={14} />
                </div>
                <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[70%] shadow-sm">
                  <div className="text-sm prose prose-sm max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {streamedResponse.replace(/(http:\/\/[^\s]+)/g, '$1*').replace(/(important|highlight)/gi, '$1*')}
                    </Markdown>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show typing indicator when AI is typing and no streamed response yet */}
            {isAiTyping && !streamedResponse && (
              <div className="flex items-end space-x-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <FaHeadset className="text-white" size={14} />
                </div>
                <div className="bg-gray-100 p-2 rounded-2xl rounded-tl-none">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1 focus-within:ring-2 focus-within:ring-purple-400 focus-within:bg-white transition-all duration-200">
              <input
                type="text"
                className="flex-1 bg-transparent border-none py-2 px-1 focus:outline-none text-sm"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`
                  p-2 rounded-full transition duration-200 flex items-center justify-center 
                  ${message.trim() 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                `}
                aria-label="Send message"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;