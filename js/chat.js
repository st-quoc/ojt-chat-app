const typingForm = document.querySelector('.typing-form');
const chatContainer = document.querySelector('.chat-list');
const suggestions = document.querySelectorAll('.suggestion');
const toggleThemeButton = document.querySelector('#theme-toggle-button');
const deleteChatButton = document.querySelector('#delete-chat-button');
const userID = sessionStorage.getItem('userID');
if (!userID) {
  window.location.href = '/index.html';
}

// get all sessions by user id using body
const getAllSessions = async (userID) => {
  try {
    const response = await fetch('http://localhost:3000/api/users/getall', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userID }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
const renderSession = (session) => {};

getAllSessions(userID);

//get all session by user id using post method
const getAllPromtBySessionId = async (sessionID) => {
  try {
    const response = await fetch('http://localhost:3000/api/session/getall', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionID }),
    });
    const data = await response.json();
    renderChatContainer(data);
    return data;
  } catch (error) {
    console.error(error);
  }
};

// render chat container
const renderChatContainer = (data) => {
  data.forEach((message) => {
    const html = `<div class="message-content">
                    <img class="avatar" src="../assets/img/pumpkin.svg" alt="Gemini avatar">
                    <p class="text"></p>
                  </div>
                  <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;
    const incomingMessageDiv = createMessageElement(html, 'incoming');
    incomingMessageDiv.querySelector('.text').innerText = message.promtText;
    chatContainer.appendChild(incomingMessageDiv);
  });
};

// save chat to db
const saveChat = async (data) => {
  try {
    const response = await fetch('http://localhost:3000/api/message/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
      // getAllPromtBySessionId(data.sessionID);
    });
  } catch (error) {
    console.error(error);
  }
};

// State variables
let userMessage = null;
let isResponseGenerating = false;

// API configuration
const API_KEY = 'AIzaSyA7hjj7yYZuSNuT_95krbg5lT7qs_j85pM'; // Your API key here

const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

// Event listener for the theme toggle button
toggleThemeButton.addEventListener('click', () => {
  const isLightMode = document.body.classList.toggle('light_mode');
  toggleThemeButton.innerText = isLightMode ? 'dark_mode' : 'light_mode';
  // Save the current theme to local storage
  localStorage.setItem('themeColor', isLightMode ? 'light_mode' : 'dark_mode');
});

// Load theme and chat data from local storage on page load
const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem('saved-chats');
  const isLightMode = localStorage.getItem('themeColor') === 'light_mode';

  // Apply the stored theme
  document.body.classList.toggle('light_mode', isLightMode);
  toggleThemeButton.innerText = isLightMode ? 'dark_mode' : 'light_mode';

  // Restore saved chats or clear the chat container
  chatContainer.innerHTML = savedChats || '';
  document.body.classList.toggle('hide-header', savedChats);

  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
};

// Create a new message element and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement('div');
  div.classList.add('message', ...classes);
  div.innerHTML = content;
  return div;
};

// Show typing effect by displaying words one by one
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    // Append each word to the text element with a space
    textElement.innerText +=
      (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector('.icon').classList.add('hide');

    // If all words are displayed
    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector('.icon').classList.remove('hide');
      createMessageApi({
        userID: '1234',
        sessionID: '5678',
        promtText: userMessage,
        promtRepsonse: text,
        timestamp: new Date().getTime(),
      }); // Create message in the API
      localStorage.setItem('saved-chats', chatContainer.innerHTML); // Save chats to local storage
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  }, 75);
};

// Fetch response from the API based on user message
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector('.text'); // Lấy text element

  try {
    // Gửi yêu cầu POST tới API với toàn bộ sessionData
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: sessionData.map(({ role, content }) => ({
          role,
          parts: [{ text: content }],
        })),
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Lấy phản hồi từ API và lưu vào sessionData
    const apiResponse = data?.candidates[0].content.parts[0].text.replace(
      /\*\*(.*?)\*\*/g,
      '$1'
    );
    sessionData.push({ role: 'model', content: apiResponse }); // Lưu phản hồi với vai trò "model"
    console.log(sessionData);

    renderResponse(apiResponse, textElement);
  } catch (error) {
    isResponseGenerating = false;
    textElement.innerText = error.message;
    textElement.parentElement.closest('.message').classList.add('error');
  } finally {
    incomingMessageDiv.classList.remove('loading');
  }
};
const renderResponse = (response, textElement) => {
  // Sử dụng regex để tách code block (nếu có)
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g; // Lấy ngôn ngữ và mã code
  const inlineCodeRegex = /`([^`]+)`/g; // Lấy inline code
  let lastIndex = 0;

  // Xử lý code block trước
  response.replace(codeBlockRegex, (match, language, code, offset) => {
    // Thêm đoạn văn bản trước đoạn code block
    if (offset > lastIndex) {
      const textNode = document.createTextNode(
        response.slice(lastIndex, offset)
      );
      textElement.appendChild(textNode);
    }

    // Tạo code block với Prism.js syntax highlight
    const pre = document.createElement('pre');
    const codeElement = document.createElement('code');
    codeElement.className = `language-${
      language ? language.trim() : 'plaintext'
    }`;
    codeElement.textContent = code.trim();

    pre.appendChild(codeElement);
    textElement.appendChild(pre);

    lastIndex = offset + match.length;
  });

  // Thêm văn bản còn lại sau đoạn code block
  if (lastIndex < response.length) {
    const textNode = document.createTextNode(response.slice(lastIndex));
    textElement.appendChild(textNode);
  }

  // Xử lý inline code
  let finalHTML = textElement.innerHTML; // Lưu nội dung hiện tại của textElement vào biến tạm
  finalHTML = finalHTML.replace(inlineCodeRegex, (match, code) => {
    return `<code>${code.trim()}</code>`;
  });

  // Xóa nội dung hiện tại và thêm nội dung đã xử lý
  textElement.innerHTML = finalHTML;

  // Kích hoạt lại Prism.js để highlight
  Prism.highlightAllUnder(textElement);

  isResponseGenerating = false;
  localStorage.setItem('saved-chats', chatContainer.innerHTML); // Lưu đoạn chat vào local storage
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Cuộn xuống cuối
};
// Show a loading animation while waiting for the API response
const showLoadingAnimation = () => {
  const html = `<div class="message-content">
                  <img class="avatar" src="../assets/img/pumpkin.svg" alt="Avatar">
                  <p class="text"></p>
                  <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                  </div>
                </div>
                <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, 'incoming', 'loading');
  chatContainer.appendChild(incomingMessageDiv);

  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  generateAPIResponse(incomingMessageDiv);
};

// Copy message text to the clipboard
const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector('.text').innerText;

  navigator.clipboard.writeText(messageText);
  copyButton.innerText = 'done'; // Show confirmation icon
  setTimeout(() => (copyButton.innerText = 'content_copy'), 1000); // Revert icon after 1 second
};

// Handle sending outgoing chat messages
let sessionData = [];

// Cập nhật hàm để thêm câu hỏi hiện tại vào sessionData
const handleOutgoingChat = () => {
  userMessage =
    typingForm.querySelector('.typing-input').value.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return; // Exit if no message or response is generating

  isResponseGenerating = true;

  // Save the question with the role as "user"
  sessionData.push({ role: 'user', content: userMessage });

  const html = `<div class="message-content">
                  <img class="avatar" src="../assets/img/user.jpg" alt="User avatar">
                  <p class="text"></p>
                </div>`;

  const outgoingMessageDiv = createMessageElement(html, 'outgoing');
  outgoingMessageDiv.querySelector('.text').innerText = userMessage;
  chatContainer.appendChild(outgoingMessageDiv);

  typingForm.reset(); // Clear the input field
  document.body.classList.add('hide-header');
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  setTimeout(showLoadingAnimation, 500); // Show loading animation for response

  // Update the session in localStorage
  updateSessionInLocalStorage(currentSessionID, sessionData);
};

// Function to update the session data in localStorage
const updateSessionInLocalStorage = (sessionID, sessionData) => {
  const sessionKey = `session_${sessionID}`;
  localStorage.setItem(sessionKey, JSON.stringify(sessionData)); // Save updated sessionData
};

// Delete all chats from local storage when button is clicked
deleteChatButton.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all the chats?')) {
    localStorage.removeItem('saved-chats');

    // Retrieve the last session index from localStorage
    let lastSessionIndex =
      parseInt(localStorage.getItem('lastSessionIndex')) || 0;

    // Check if picked_sessionId exists in local storage
    const pickedSessionId = localStorage.getItem('picked_sessionId'); // Assuming you store the picked session ID in local storage
    const existingSessionKey = `session_${pickedSessionId}`;

    // Check if session_${pickedSessionId} exists
    if (pickedSessionId && localStorage.getItem(existingSessionKey)) {
      const data = getSessionById(pickedSessionId);
      renderResponse(data);
    } else {
      // Create a new session only if sessionData is not empty
      if (sessionData.length > 0) {
        lastSessionIndex++; // Increment the index
        const newSessionKey = `session_${lastSessionIndex}`;
        localStorage.setItem(newSessionKey, JSON.stringify(sessionData)); // Save the current sessionData
      } else {
        // Optionally, notify the user that the session is empty
        alert(
          'No chats to save. Please enter some chats before creating a new session.'
        );
      }
    }

    // Reset sessionData for a new session
    sessionData = [];

    // Update the last session index only if a new session was created
    localStorage.setItem('lastSessionIndex', lastSessionIndex);

    loadDataFromLocalstorage(); // Load remaining data

    window.location.reload(); // Reload the page to clear the chat container
  }
});

const sessionList = document.getElementById('session-ul');

// Function to load sessions from localStorage and display them
const loadSessions = () => {
  // Clear the current list
  sessionList.innerHTML = '';

  // Loop through localStorage and find session keys
  for (let i = 1; ; i++) {
    const sessionKey = `session_${i}`;
    const sessionData = localStorage.getItem(sessionKey);

    // Break the loop if there's no session data for the current key
    if (!sessionData) break;

    const parsedSessionData = JSON.parse(sessionData);

    // Check if the session has any messages
    if (parsedSessionData.length === 0) {
      continue; // Skip this session if there are no messages
    }

    // Create a new list item for each session
    const li = document.createElement('li');
    li.innerText = parsedSessionData[0]?.content || `Chat session ${i}`; // Display the first message or a placeholder
    li.title = `Chat session ${i}`;

    // Add click event listener to display the chat content when clicked
    li.addEventListener('click', () =>
      displaySessionChat(i, parsedSessionData)
    );

    sessionList.appendChild(li);
  }
};

const displaySessionChat = (sessionID, messages) => {
  // Set the current session ID
  currentSessionID = sessionID;
  console.log(sessionID);
  localStorage.setItem('picked_sessionId', sessionID); // Save the current chat to local storage
  // Clear the current chat container
  chatContainer.innerHTML = '';
  const header = document.querySelector('.header'); // Replace with the appropriate selector for your header
  if (header) {
    header.style.display = 'none'; // Hide the header
  }

  // Clear the sessionData array to avoid mixing messages
  sessionData = []; // Reset sessionData for the new session

  // Loop through the messages and append them to the chat container
  messages.forEach((message) => {
    const messageElement = createMessageElement(
      `
      <div class="message-content">
        <img class="avatar" src="${
          message.role === 'user'
            ? '../assets/img/user.jpg'
            : '../assets/img/pumpkin.svg'
        }" alt="${message.role === 'user' ? 'User avatar' : 'Gemini avatar'}">
        <p class="text">${message.content}</p>
      </div>
    `,
      message.role === 'user' ? 'outgoing' : 'incoming'
    );

    chatContainer.appendChild(messageElement);

    // Push existing messages into sessionData for continuation
    sessionData.push(message); // Add message to sessionData to continue conversation
  });

  // Scroll to the bottom of the chat container
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

// Call this function after deleting chats or when the page loads
loadSessions();

let currentSessionID = null; // Variable to store the currently active session ID

// Optionally, you can add an event listener for the "add" button if you want to add new sessions
document.getElementById('add-button').addEventListener('click', () => {
  // Logic to add a new session can go here
});

// Set userMessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach((suggestion) => {
  suggestion.addEventListener('click', () => {
    userMessage = suggestion.querySelector('.text').innerText;
    handleOutgoingChat();
  });
});

// Prevent default form submission and handle outgoing chat
typingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleOutgoingChat();
});

loadDataFromLocalstorage();

const createMessageApi = async (data) => {
  try {
    const response = await fetch('http://localhost:5000/api/message/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
  } catch (error) {
    console.error(error);
  }
};

//get user by user id
const getUser = async (userID) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/session/getAll/${userID}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

// get all messages by session id
const getAllMessages = async (sessionID) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/message/getAll/${sessionID}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

// delete session by session id
const deleteSession = async (sessionID) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/session/delete/${sessionID}`,
      {
        method: 'DELETE',
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

// delte all sessions by user id
const deleteAllSessions = async (userID) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/session/deleteAll/${userID}`,
      {
        method: 'DELETE',
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

// create session api
const createSession = async (data) => {
  try {
    const response = await fetch('http://localhost:5000/api/session/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
  } catch (error) {
    console.error(error);
  }
};

// when user login, check lastest session if exist message return it or create new session
const checkLastestSession = async (userID) => {
  const sessions = await getAllSessions(userID);
  if (sessions.length === 0) {
    createSession({
      userID,
      sessionID: Math.random().toString(36).substring(7),
      timestamp: new Date().getTime(),
    });
  } else {
    const lastestSession = sessions[sessions.length - 1];
    const messages = await getAllMessages(lastestSession.sessionID);
    messages.forEach((message) => {
      const html = `<div class="message-content">
                      <img class="avatar" src="../assets/img/pumpkin.svg" alt="Gemini avatar">
                      <p class="text"></p>
                    </div>
                    <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;
      const incomingMessageDiv = createMessageElement(html, 'incoming');
      incomingMessageDiv.querySelector('.text').innerText = message.promtText;
      chatContainer.appendChild(incomingMessageDiv);
    });
  }
};

document
  .getElementById('menu-toggle-button')
  .addEventListener('click', function () {
    loadSessions();
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    sidebar.classList.toggle('expanded'); // Mở rộng/thu gọn sidebar
  });

document
  .getElementById('profile-toggle-button')
  .addEventListener('click', function () {
    const profileMenu = document.getElementById('profile-menu');
    profileMenu.style.display =
      profileMenu.style.display === 'none' || profileMenu.style.display === ''
        ? 'block'
        : 'none';
  });
