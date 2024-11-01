const typingForm = document.querySelector('.typing-form');
const chatContainer = document.querySelector('.chat-list');
const suggestions = document.querySelectorAll('.suggestion');
const toggleThemeButton = document.querySelector('#theme-toggle-button');
const messageInput = document.getElementById('prompt-textarea');
const hiddenTextarea = document.getElementById('hidden-textarea');
const userID = sessionStorage.getItem('userID');
if (!userID) {
  window.location.href = '/index.html';
}
let sessionData = [];

let userMessage = null;
let isResponseGenerating = false;

const sessionId = localStorage.getItem('picked_sessionId');
console.log('sessionId', sessionId);

const API_KEY = 'AIzaSyA7hjj7yYZuSNuT_95krbg5lT7qs_j85pM';

const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

async function getAllSessions() {
  const userId = sessionStorage.getItem('userID');

  if (!userId) {
    console.error('User ID không tồn tại trong session storage.');
    return null;
  }

  const url = `https://arcane-sea-85415-cb9bc29a925f.herokuapp.com/api/sessions/${userId}`;

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

    const sessions = await response.json();
    return sessions;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách session:', error);
    return null;
  }
}

async function deletePrompts(sessionId) {
  try {
    const response = await fetch(`/promts/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
    } else {
      const errorData = await response.json();
      console.error('Error:', errorData.error);
    }
  } catch (error) {
    console.error('Failed to delete prompts:', error);
  }
}

async function deleteSessionById(sessionId) {
  try {
    const response = await fetch(`https://arcane-sea-85415-cb9bc29a925f.herokuapp.com/api/delasessions/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      await addNewSession();
      loadSessions();
    } else {
      const errorData = await response.json();
      console.error('Error:', errorData.error);
    }
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}

document.querySelector('.deleteAll').addEventListener('click', () => {
  cuteAlert({
    type: 'question',
    title: 'Delete All Sessions',
    message: 'Are you sure you want to delete all sessions?',
    confirmText: 'Yes',
    cancelText: 'No',
  }).then(async (e) => {
    if (e == 'confirm') {
      try {
        const response = await fetch(`https://arcane-sea-85415-cb9bc29a925f.herokuapp.com/api/sessions`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: sessionStorage.getItem('userID') }),
        });
        console.log('response', response);

        if (response.ok) {
          localStorage.removeItem('picked_sessionId');
          await addNewSession();
          await loadSessions();
        } else {
          console.error('Error:', response);
        }
      } catch (error) {
        console.error('Failed to delete all sessions:', error);
      }
    }
  });
});


async function createSession(sessionData) {
  const userId = sessionStorage.getItem('userID');

  if (!userId) {
    console.error('User ID không tồn tại trong session storage.');
    return null;
  }

  const url = 'https://arcane-sea-85415-cb9bc29a925f.herokuapp.com/api/sessions';

  const bodyData = {
    userId: userId,
    sessionData: sessionData,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const newSession = await response.json();
    return newSession;
  } catch (error) {
    console.error('Lỗi khi tạo session:', error);
    return null;
  }
}

const addButton = document.getElementById('add-button');
addButton.addEventListener('click', async () => {
  addNewSession();
});

const addNewSession = async () => {
  localStorage.removeItem('picked_sessionId');
  const sessionData = {
    name: 'Session mới',
    status: 'Active',
  };

  await createSession(sessionData).then((newSession) => {
    console.log('newSession', newSession);
    if (newSession) {
      localStorage.setItem('picked_sessionId', newSession._id);
    }
  });

  const sessionId = localStorage.getItem('picked_sessionId');

  await getAllPromts(sessionId).then((promts) => {
    displaySessionChat(sessionId, promts);
  });
};

async function getAllPromts(sessionId) {
  if (!sessionId) {
    console.error('Session ID không được cung cấp.');
    return null;
  }

  const url = `https://arcane-sea-85415-cb9bc29a925f.herokuapp.com/api/promts/${sessionId}`;

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
    return Array.isArray(promts) ? promts : [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách promts:', error);
    return null;
  }
}

async function createPromt(question, answer) {
  // Lấy sessionId và userId từ local storage
  const userId = sessionStorage.getItem('userID');
  const sessionId = localStorage.getItem('picked_sessionId');
  if (!sessionId || !userId) {
    console.error('Session ID hoặc User ID không tồn tại trong local storage.');
    return null;
  }

  const url = 'https://arcane-sea-85415-cb9bc29a925f.herokuapp.com/api/promts';

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
//     const response = await fetch('https://arcane-sea-85415-cb9bc29a925f.herokuapp.com/api/message/create', {
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
  // const savedChats = localStorage.getItem('saved-chats');
  const isLightMode = localStorage.getItem('themeColor') === 'light_mode';

  // Apply the stored theme
  document.body.classList.toggle('light_mode', isLightMode);
  toggleThemeButton.innerText = isLightMode ? 'dark_mode' : 'light_mode';

  // Restore saved chats or clear the chat container
  // chatContainer.innerHTML = savedChats || '';
  // document.body.classList.toggle('hide-header', savedChats);

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
      // localStorage.setItem('saved-chats', chatContainer.innerHTML); // Save chats to local storage
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  }, 75);
};

const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector('.text');

  try {
    const formattedSessionData = sessionData
      .filter((item) => item.role && item.content)
      .map(({ role, content }) => ({
        role,
        content,
      }));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: formattedSessionData.map(({ role, content }) => ({
          role,
          parts: [{ text: content }],
        })),
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const apiResponse = data?.candidates[0].content.parts[0].text.replace(
      /\*\*(.*?)\*\*/g,
      '$1'
    );

    sessionData.push({ role: 'model', content: apiResponse });
    renderResponse(apiResponse, textElement);

    const sessionContainsSessionId = sessionData.some((data) =>
      data.hasOwnProperty('sessionId')
    );

    let pickedSession = localStorage.getItem('picked_sessionId');
    if (!pickedSession) {
      const newSession = await createSession(sessionData);
      if (newSession) {
        localStorage.setItem('picked_sessionId', newSession._id);
        pickedSession = newSession;
      }
    }

    const lastUserQuestion =
      sessionData[sessionData.length - (sessionContainsSessionId ? 4 : 2)];
    const lastModelAnswer =
      sessionData[sessionData.length - (sessionContainsSessionId ? 3 : 1)];

    if (lastUserQuestion.role === 'user' && lastModelAnswer.role === 'model') {
      console.log('lastUserQuestion', lastUserQuestion);
      await createPromt(lastUserQuestion.content, lastModelAnswer.content); // Gọi hàm để lưu vào DB
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
  // localStorage.setItem('saved-chats', chatContainer.innerHTML); // Lưu đoạn chat vào local storage
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

const handleOutgoingChat = () => {
  userMessage = messageInput.innerText.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return;

  isResponseGenerating = true;

  sessionData.push({ role: 'user', content: userMessage });

  const html = `<div class="message-content">
                  <img class="avatar" src="../assets/img/user.jpg" alt="User avatar">
                  <p class="text"></p>
                </div>`;

  const outgoingMessageDiv = createMessageElement(html, 'outgoing');
  outgoingMessageDiv.querySelector('.text').innerText = userMessage;
  chatContainer.appendChild(outgoingMessageDiv);

  document.querySelector('header').style.display = 'none';
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showLoadingAnimation, 500);

  updateSessionInLocalStorage(sessionData);
};

const updateSessionInLocalStorage = (sessionData) => {
  const formattedSessionData = sessionData.map((item) => {
    if (item.question) {
      return { role: 'user', content: item.question };
    } else if (item.answer) {
      return { role: 'model', content: item.answer };
    }
    return item;
  });

  sessionData = formattedSessionData;
};

const sessionList = document.getElementById('session-ul');

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
            await deleteSessionById(session._id);
            console.log('session._id', session._id);
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

document.addEventListener('DOMContentLoaded', function () {
  localStorage.removeItem('saved-chat');

  loadSessions();
});
localStorage.removeItem('saved-chat');

const displaySessionChat = (sessionID, messages) => {
  currentSessionID = sessionID;
  console.log(sessionID);
  localStorage.setItem('picked_sessionId', sessionID);

  chatContainer.innerHTML = '';
  const header = document.querySelector('.header');
  if (header) {
    header.style.display = 'none';
  }
  if (messages.length === 0) {
    header.style.display = 'block';
  }

  sessionData = [];

  messages.forEach((message) => {
    if (message.question) {
      const questionElement = createMessageElement(
        `
        <div class="message-content">
          <img class="avatar" src="../assets/img/user.jpg" alt="User avatar">
          <p class="text">${message.question}</p>
        </div>
      `,
        'outgoing'
      );
      chatContainer.appendChild(questionElement);
    }

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

const loadCurrentSession = async () => {
  if (sessionId) {
    const messages = await getAllPromts(sessionId);
    console.log('messages', messages);
    displaySessionChat(sessionId, messages);
  }
};

loadCurrentSession();
