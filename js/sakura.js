document.addEventListener('DOMContentLoaded', function () {
  const sakuraContainer = document.querySelector('.falling-sakura');

  function createSakura() {
    const sakura = document.createElement('div');
    sakura.classList.add('sakura');

    sakura.style.left = Math.random() * 100 + 'vw';
    sakura.style.animationDuration = 3 + Math.random() * 5 + 's';
    sakura.style.opacity = Math.random() * 0.7 + 0.3;

    sakuraContainer.appendChild(sakura);

    sakura.addEventListener('animationend', () => {
      sakura.remove();
    });
  }

  const sakuraInterval = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      createSakura();
    }
  }, 100);

  setTimeout(() => {
    clearInterval(sakuraInterval);
  }, 3000);
});
