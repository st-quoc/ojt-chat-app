const BASE_URL = 'https://arcane-sea-85415-cb9bc29a925f.herokuapp.com';

if (sessionStorage.getItem('userID')) {
  window.location.href = '/pages/chatPage.html';
}
async function login(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    const response = await fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await response.json();
    console.log('sss', data.data.userId);
    sessionStorage.setItem('userID', data.data.userId);
    window.location.href = '/pages/chatPage.html';
  } catch (error) {
    displayErrorMessage('Network error or server is down');
  }
}

function displayErrorMessage(message) {
  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = 'Login failed: ' + message;
  errorMessage.style.display = 'block';
}

const spans = document.querySelectorAll('.word span');
spans.forEach((span, idx) => {
  span.addEventListener('click', (e) => {
    e.target.classList.add('active');
  });
  span.addEventListener('animationend', (e) => {
    e.target.classList.remove('active');
  });

  setTimeout(() => {
    span.classList.add('active');
  }, 900 * (idx + 1));
});

const register = async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    cuteToast({
      type: 'error',
      title: 'Error',
      message: 'Passwords do not match',
    });
    return;
  }

  const response = await fetch(`${BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });

  const data = await response.json();
  console.log(data);
  if (data.message === 'User registered successfully') {
    cuteToast({
      type: 'success',
      title: 'Success',
      message: 'User registered successfully',
    });

    setTimeout(() => {
      window.location.href = '/index.html';
    }),
      4000;
  } else {
    alert(data.message);
  }
};
