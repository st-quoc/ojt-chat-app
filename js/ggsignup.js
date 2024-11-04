const CLIENT_ID =
  '896387674450-36c0ktb6qabai36ol9271dlh2u1at97k.apps.googleusercontent.com';

function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse,
  });

  google.accounts.id.renderButton(
    document.getElementById('googleRegisterBtn'),
    { theme: 'outline', size: 'large' }
  );
}

async function handleCredentialResponse(response) {
  const token = response.credential;
  console.log('Google ID Token:', token);

  const userInfo = jwt_decode(token);
  const username = userInfo.sub;
  const email = userInfo.sub;
  const password = userInfo.sub;

  try {
    let response = await fetch(`${BASE_URL}/api/users/register`, {
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

    let data = await response.json();
    console.log(data);

    if (data.message === 'User registered successfully') {
      cuteToast({
        type: 'success',
        title: 'Success',
        message: 'User registered successfully',
      });

      setTimeout(() => {
        window.location.href = '/index.html';
      }, 4000);
    } else {
      response = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      data = await response.json();
      console.log('User ID:', data.data.userId);
      sessionStorage.setItem('userID', data.data.userId);
      window.location.href = '/pages/chatPage.html';
    }
  } catch (error) {
    displayErrorMessage('Network error or server is down');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initializeGoogleSignIn();
});
