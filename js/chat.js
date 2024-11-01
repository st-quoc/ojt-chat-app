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

const API_KEY = 'AIzaSyA7hjj7yYZuSNuT_95krbg5lT7qs_j85pM';
const BASE_URL = 'https://arcane-sea-85415-cb9bc29a925f.herokuapp.com';
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

async function getAllSessions() {
  const userId = sessionStorage.getItem('userID');

  if (!userId) {
    console.error('User ID không tồn tại trong session storage.');
    return null;
  }

  const url = `${BASE_URL}/api/sessions/${userId}`;

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
    const response = await fetch(`${BASE_URL}/api/delasessions/`, {
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
        const response = await fetch(`${BASE_URL}/api/sessions`, {
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

  const url = `${BASE_URL}/api/sessions`;

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

  const url = `${BASE_URL}/api/promts/${sessionId}`;

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
  const userId = sessionStorage.getItem('userID');
  const sessionId = localStorage.getItem('picked_sessionId');
  if (!sessionId || !userId) {
    console.error('Session ID hoặc User ID không tồn tại trong local storage.');
    return null;
  }

  const url = `${BASE_URL}/api/promts`;

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
      body: JSON.stringify(promtData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const newPromt = await response.json();
    return newPromt;
  } catch (error) {
    console.error('Lỗi khi tạo promt:', error);
    return null;
  }
}

toggleThemeButton.addEventListener('click', () => {
  const isLightMode = document.body.classList.toggle('light_mode');
  toggleThemeButton.innerText = isLightMode ? 'dark_mode' : 'light_mode';
  localStorage.setItem('themeColor', isLightMode ? 'light_mode' : 'dark_mode');
});

const loadDataFromLocalstorage = () => {
  const isLightMode = localStorage.getItem('themeColor') === 'light_mode';
  document.body.classList.toggle('light_mode', isLightMode);
  toggleThemeButton.innerText = isLightMode ? 'dark_mode' : 'light_mode';
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createMessageElement = (content, ...classes) => {
  const div = document.createElement('div');
  div.classList.add('message', ...classes);
  div.innerHTML = content;
  return div;
};

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    textElement.innerText +=
      (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector('.icon').classList.add('hide');

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
      });
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
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
      await createPromt(lastUserQuestion.content, lastModelAnswer.content);
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
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const inlineCodeRegex = /`([^`]+)`/g;
  let lastIndex = 0;

  response.replace(codeBlockRegex, (match, language, code, offset) => {
    if (offset > lastIndex) {
      const textNode = document.createTextNode(
        response.slice(lastIndex, offset)
      );
      textElement.appendChild(textNode);
    }

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

  if (lastIndex < response.length) {
    const textNode = document.createTextNode(response.slice(lastIndex));
    textElement.appendChild(textNode);
  }

  let finalHTML = textElement.innerHTML;
  finalHTML = finalHTML.replace(inlineCodeRegex, (match, code) => {
    return `<code>${code.trim()}</code>`;
  });

  textElement.innerHTML = finalHTML;

  Prism.highlightAllUnder(textElement);

  isResponseGenerating = false;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

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

  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  generateAPIResponse(incomingMessageDiv);
};

const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector('.text').innerText;

  navigator.clipboard.writeText(messageText);
  copyButton.innerText = 'done';
  setTimeout(() => (copyButton.innerText = 'content_copy'), 1000);
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

      if (messages && messages.length > 0) {
        const sessionName = messages[0].question
          ? messages[0].question
          : `Chat session ${session._id}`;

        const li = document.createElement('li');
        li.classList.add('session-item');

        const text = document.createElement('p');
        text.innerText = sessionName;
        text.title = sessionName;
        li.appendChild(text);

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

        li.appendChild(deleteButton);

        li.addEventListener('click', async () => {
          localStorage.setItem('picked_sessionId', session._id);
          displaySessionChat(session._id, messages);

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
      );

      chatContainer.appendChild(answerElement);

      const textElement = answerElement.querySelector('.text');
      renderResponse(message.answer, textElement);
    }

    sessionData.push(message);
  });
};

let currentSessionID = null;

suggestions.forEach((suggestion) => {
  suggestion.addEventListener('click', () => {
    userMessage = suggestion.querySelector('.text').innerText;
    handleOutgoingChat();
  });
});

messageInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      document.execCommand('insertHTML', false, '<br><br>');
      event.preventDefault();
    } else {
      event.preventDefault();
      const message = messageInput.innerHTML;
      handleOutgoingChat();
      messageInput.innerHTML = '';
    }
  }
});

typingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleOutgoingChat();
});

loadDataFromLocalstorage();

document
  .getElementById('menu-toggle-button')
  .addEventListener('click', function () {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    sidebar.classList.toggle('expanded');
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
