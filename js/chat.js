const typingForm = document.querySelector('.typing-form');
const chatContainer = document.querySelector('.chat-list');
const suggestions = document.querySelectorAll('.suggestion');
const toggleThemeButton = document.querySelector('#theme-toggle-button');
const deleteChatButton = document.querySelector('#delete-chat-button');
const messageInput = document.getElementById('prompt-textarea');
const hiddenTextarea = document.getElementById('hidden-textarea');
const userID = sessionStorage.getItem('userID');
if (!userID) {
  window.location.href = '/index.html';
}
let sessionData = [];

let userMessage = null;
let isResponseGenerating = false;

// API configuration
const API_KEY = 'AIzaSyA7hjj7yYZuSNuT_95krbg5lT7qs_j85pM'; // Your API key here

const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

async function getAllSessions() {
  // Lấy userId từ session storage
  const userId = sessionStorage.getItem('userID');

  if (!userId) {
    console.error('User ID không tồn tại trong session storage.');
    return null;
  }

  const url = `http://localhost:3000/api/sessions/${userId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Kiểm tra xem phản hồi có thành công hay không
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const sessions = await response.json();
    return sessions; // Trả về danh sách session
  } catch (error) {
    console.error('Lỗi khi lấy danh sách session:', error);
    return null; // Trả về null hoặc xử lý lỗi phù hợp
  }
}

async function displayAllSession() {
  const sessions = await getAllSessions(); // Gọi hàm lấy tất cả session
  const sessionUl = document.getElementById('session-ul'); // Lấy phần tử ul
  sessionUl.innerHTML = ''; // Xóa nội dung hiện tại của ul

  if (sessions && sessions.length > 0) {
    sessions.forEach((session) => {
      // Tạo phần tử li cho mỗi session
      const li = document.createElement('li');
      li.textContent = `Session ID: ${session.id}, Title: ${session.title}`; // Thay đổi để phù hợp với cấu trúc dữ liệu của bạn
      sessionUl.appendChild(li); // Thêm li vào ul
    });
  } else {
    // Nếu không có session nào
    const li = document.createElement('li');
    li.textContent = 'Không có session nào.';
    sessionUl.appendChild(li);
  }
}

async function createSession(sessionData) {
  const userId = sessionStorage.getItem('userID');

  if (!userId) {
    console.error('User ID không tồn tại trong session storage.');
    return null; // Hoặc xử lý phù hợp nếu không có userId
  }

  const url = 'http://localhost:3000/api/sessions'; // URL của endpoint tạo session

  const bodyData = {
    userId: userId, // Sử dụng userId từ session storage
    sessionData: sessionData, // Dữ liệu session (tên, trạng thái, v.v.)
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData), // Chuyển đổi body thành JSON
    });

    // Kiểm tra xem phản hồi có thành công hay không
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const newSession = await response.json(); // Nhận dữ liệu của session mới
    // console.log('Session mới đã được tạo:', newSession);
    return newSession; // Trả về session mới tạo
  } catch (error) {
    console.error('Lỗi khi tạo session:', error);
    return null; // Trả về null hoặc xử lý lỗi phù hợp
  }
}

const addButton = document.getElementById('add-button');
addButton.addEventListener('click', () => {
  localStorage.removeItem('picked_sessionId');
  //reload page
  localStorage.removeItem('saved-chats');
  // Lấy dữ liệu từ các trường nhập liệu
  const sessionData = {
    name: 'Session mới',
    status: 'Active',
  };

  createSession(sessionData).then((newSession) => {
    if (newSession) {
      // console.log('Session mới được tạo:', newSession);
      localStorage.setItem('picked_sessionId', newSession._id);
      window.location.reload();
    } else {
    }
  });
});

//get all promt by session id
async function getAllPromts(sessionId) {
  if (!sessionId) {
    console.error('Session ID không được cung cấp.');
    return null;
  }

  const url = `http://localhost:3000/api/promts/${sessionId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const promts = await response.json();
    // console.log('Danh sách promts:', promts);
    return Array.isArray(promts) ? promts : []; // Đảm bảo trả về mảng
  } catch (error) {
    console.error('Lỗi khi lấy danh sách promts:', error);
    return null;
  }
}

async function createPromt(question, answer) {
  // Lấy sessionId và userId từ local storage
  const sessionId = localStorage.getItem('picked_sessionId');
  const userId = sessionStorage.getItem('userID');

  // Kiểm tra xem sessionId và userId có tồn tại không
  if (!sessionId || !userId) {
    console.error('Session ID hoặc User ID không tồn tại trong local storage.');
    return null; // Hoặc xử lý phù hợp nếu không có sessionId hoặc userId
  }

  const url = 'http://localhost:3000/api/promts'; // URL của endpoint

  const promtData = {
    sessionId,
    userId,
    question,
    answer,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promtData), // Chuyển đổi dữ liệu thành JSON
    });

    // Kiểm tra xem phản hồi có thành công hay không
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const newPromt = await response.json(); // Nhận dữ liệu của promt mới
    // console.log('Promt mới được tạo:', newPromt);
    return newPromt; // Trả về promt mới
  } catch (error) {
    console.error('Lỗi khi tạo promt:', error);
    return null; // Trả về null hoặc xử lý lỗi phù hợp
  }
}

// render chat container
// const renderChatContainer = (data) => {
//   data.forEach((message) => {
//     const html = `<div class="message-content">
//                     <img class="avatar" src="../assets/img/pumpkin.svg" alt="Gemini avatar">
//                     <p class="text"></p>
//                   </div>
//                   <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;
//     const incomingMessageDiv = createMessageElement(html, 'incoming');
//     incomingMessageDiv.querySelector('.text').innerText = message.promtText;
//     chatContainer.appendChild(incomingMessageDiv);
//   });
// };

// save chat to db
// const saveChat = async (data) => {
//   try {
//     const response = await fetch('http://localhost:3000/api/message/create', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ data }),
//       // getAllPromtBySessionId(data.sessionID);
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };

// State variables

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

const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector('.text'); // Lấy text element

  try {
    // Lọc sessionData chỉ giữ lại các đối tượng với role và content
    const formattedSessionData = sessionData
      .filter((item) => item.role && item.content) // Giữ lại các item có role và content
      .map(({ role, content }) => ({
        role,
        content, // Đổi key từ parts[0].text sang content
      }));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: formattedSessionData.map(({ role, content }) => ({
          role,
          parts: [{ text: content }], // Định dạng lại để gửi
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

    // Lưu phản hồi với vai trò "model"
    sessionData.push({ role: 'model', content: apiResponse });
    // console.log('check after', sessionData);

    renderResponse(apiResponse, textElement);
    const sessionContainsSessionId = sessionData.some((data) =>
      data.hasOwnProperty('sessionId')
    );
    // console.log('check session', sessionContainsSessionId);
    //if sessionData has length < 4
    if (!sessionContainsSessionId) {
      const lastUserQuestion = sessionData[sessionData.length - 2]; // Câu hỏi của người dùng mới nhất
      const lastModelAnswer = sessionData[sessionData.length - 1]; // Câu trả lời của model mới nhất
      if (
        lastUserQuestion.role === 'user' &&
        lastModelAnswer.role === 'model'
      ) {
        await createPromt(lastUserQuestion.content, lastModelAnswer.content); // Gọi hàm để lưu vào DB
      }
    } else {
      const lastUserQuestion = sessionData[sessionData.length - 4]; // Câu hỏi của người dùng mới nhất
      const lastModelAnswer = sessionData[sessionData.length - 3]; // Câu trả lời của model mới nhất
      if (
        lastUserQuestion.role === 'user' &&
        lastModelAnswer.role === 'model'
      ) {
        await createPromt(lastUserQuestion.content, lastModelAnswer.content); // Gọi hàm để lưu vào DB
      }
    }
    loadSessions();
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

// Cập nhật hàm để thêm câu hỏi hiện tại vào sessionData
const handleOutgoingChat = () => {
  userMessage = messageInput.innerText.trim() || userMessage;
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

  // typingForm.reset(); // Clear the input field
  document.body.classList.add('hide-header');
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  setTimeout(showLoadingAnimation, 500); // Show loading animation for response

  // Update the session in localStorage
  updateSessionInLocalStorage(sessionData);
};

// Function to update the session data in localStorage
// Function to update the session data in localStorage
const updateSessionInLocalStorage = (sessionData) => {
  // Map sessionData to only include role and content
  const formattedSessionData = sessionData.map((item) => {
    if (item.question) {
      return { role: 'user', content: item.question };
    } else if (item.answer) {
      return { role: 'model', content: item.answer };
    }
    return item; // Return as-is if it doesn't match either question or answer
  });

  sessionData = formattedSessionData;
};

// Delete all chats from local storage when button is clicked
deleteChatButton.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all the chats?')) {
    localStorage.removeItem('saved-chats');
    loadDataFromLocalstorage();
  }
});

const sessionList = document.getElementById('session-ul');

// Function to load sessions from the database and display them
const loadSessions = async () => {
  sessionList.innerHTML = '';

  const sessions = await getAllSessions();

  if (sessions && sessions.length > 0) {
    sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    for (const session of sessions) {
      const messages = await getAllPromts(session._id);

      // Only proceed if there are messages in the session
      if (messages && messages.length > 0) {
        // Use the question of the first prompt as the session name (if available)
        const sessionName = messages[0].question
          ? messages[0].question
          : `Chat session ${session._id}`;

        const li = document.createElement('li');
        li.classList.add('session-item');

        // Set the text of li first
        const text = document.createElement('p');
        text.innerText = sessionName;
        text.title = sessionName;
        li.appendChild(text);

        // Create the delete button
        const deleteButton = document.createElement('div');
        deleteButton.innerText = 'x';
        deleteButton.title = 'Delete session';
        deleteButton.classList.add('delete-session-button');
        deleteButton.addEventListener('click', async (event) => {
          if (confirm('Are you sure you want to delete this session?')) {
            deleteSession(session._id);
            loadSessions();
          }
        });

        // Append the delete button after setting innerText
        li.appendChild(deleteButton);

        li.addEventListener('click', async () => {
          localStorage.setItem('picked_sessionId', session._id);
          displaySessionChat(session._id, messages);

          // Check and add elements to sessionData if question and answer fields are present
          const hasQuestion = sessionData.some((item) => item.question);
          const hasAnswer = sessionData.some((item) => item.answer);

          if (hasAnswer) {
            const answerItems = sessionData.filter((item) => item.answer);
            answerItems.forEach((answerItem) => {
              sessionData.push({
                role: 'model',
                content: answerItem.answer,
              });
            });
          }

          if (hasQuestion) {
            const questionItems = sessionData.filter((item) => item.question);
            questionItems.forEach((questionItem) => {
              sessionData.push({
                role: 'user',
                content: questionItem.question,
              });
            });
          }

          sessionData = sessionData.filter(
            (item) => !item.question && !item.answer
          );
        });

        sessionList.appendChild(li);
      }
    }
  } else {
    const li = document.createElement('li');
    li.innerText = 'Không có session nào.';
    sessionList.appendChild(li);
  }
};

// Gọi hàm để tải session khi trang được tải
document.addEventListener('DOMContentLoaded', loadSessions);

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
    // Hiển thị câu hỏi
    if (message.question) {
      const questionElement = createMessageElement(
        `
        <div class="message-content">
          <img class="avatar" src="../assets/img/user.jpg" alt="User avatar">
          <p class="text">${message.question}</p>
        </div>
      `,
        'outgoing'
      ); // Class cho câu hỏi
      chatContainer.appendChild(questionElement);
    }

    // Hiển thị câu trả lời
    if (message.answer) {
      const answerElement = createMessageElement(
        `
        <div class="message-content">
          <img class="avatar" src="../assets/img/pumpkin.svg" alt="Gemini avatar">
          <p class="text"></p>
        </div>
      `,
        'incoming'
      ); // Class cho câu trả lời

      // Append the answer element to the chat container first
      chatContainer.appendChild(answerElement);

      // Call renderResponse to handle formatting for code blocks or inline code
      const textElement = answerElement.querySelector('.text'); // Get the <p> element for text content
      renderResponse(message.answer, textElement); // Render the formatted response
    }

    // Push existing messages into sessionData for continuation
    sessionData.push(message); // Add message to sessionData to continue conversation
  });
};

// Call this function after deleting chats or when the page loads
loadSessions();

let currentSessionID = null; // Variable to store the currently active session ID

// Set userMessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach((suggestion) => {
  suggestion.addEventListener('click', () => {
    userMessage = suggestion.querySelector('.text').innerText;
    handleOutgoingChat();
  });
});

messageInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // Nếu Shift + Enter thì cho phép xuống dòng
      document.execCommand('insertHTML', false, '<br><br>');
      event.preventDefault(); // Ngăn chặn hành động mặc định của Enter
    } else {
      // Nếu chỉ nhấn Enter thì gửi tin nhắn
      event.preventDefault(); // Ngăn chặn hành động mặc định của Enter
      const message = messageInput.innerHTML; // Lấy nội dung
      handleOutgoingChat(); // Thay bằng logic gửi tin nhắn
      messageInput.innerHTML = ''; // Xóa nội dung sau khi gửi
    }
  }
});

// Prevent default form submission and handle outgoing chat
typingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleOutgoingChat();
});

loadDataFromLocalstorage();

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
    // loadSessions();
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
