document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.querySelector('.login-view');
  if (!loginView) return;

  const providers = loginView.querySelector('.login-providers');
  const providerButtons = [...(providers || loginView).querySelectorAll('button, a')];
  const emailProvider = providerButtons.find((button) => /email/i.test(button.textContent));
  const googleProvider = providerButtons.find((button) => /google/i.test(button.textContent));
  const emailInput = loginView.querySelector('input[type="email"], input[name="email"], input[autocomplete="email"], input[placeholder="you@example.com"]') ||
    document.querySelector('input[type="email"], input[name="email"], input[autocomplete="email"], input[placeholder="you@example.com"]');
  const authForm = emailInput?.closest('form') || loginView.querySelector('form');
  const signInButton = document.getElementById('btn-login');
  const createAccountButton = document.getElementById('btn-signup');
  const profilePanel = loginView.closest('.profile-panel');

  if (!emailProvider || !authForm || !profilePanel) return;

  if (googleProvider) emailProvider.className = googleProvider.className;
  emailProvider.classList.add('login-provider');
  if (emailProvider.tagName === 'BUTTON') emailProvider.type = 'button';

  const emailFormPanel = authForm.closest('.email-auth, .email-login, .email-form') || authForm;
  const originalParent = emailFormPanel.parentElement;
  const originalNextSibling = emailFormPanel.nextSibling;
  const externalActions = [signInButton, createAccountButton]
    .filter((button) => button && !emailFormPanel.contains(button))
    .map((button) => ({ button, parent: button.parentElement, nextSibling: button.nextSibling }));

  const emailPage = document.createElement('section');
  emailPage.className = 'profile-card email-auth-page';
  emailPage.hidden = true;
  emailPage.setAttribute('aria-label', 'Email sign in');

  const heading = document.createElement('h2');
  heading.textContent = 'Sign in with email';
  const description = document.createElement('p');
  description.textContent = 'Enter your email and password to sign in or create an account.';
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'login-back';
  backButton.textContent = 'Back to sign-in options';

  const actionGroup = document.createElement('div');
  actionGroup.className = 'profile-actions';
  externalActions.forEach(({ button }) => actionGroup.append(button));
  emailPage.append(heading, description, emailFormPanel, actionGroup, backButton);
  profilePanel.append(emailPage);

  const showProviders = () => {
    emailPage.hidden = true;
    emailPage.style.display = 'none';
    if (originalParent) {
      originalParent.insertBefore(emailFormPanel, originalNextSibling?.parentNode === originalParent ? originalNextSibling : null);
    }
    externalActions.forEach(({ button, parent, nextSibling }) => {
      if (parent) parent.insertBefore(button, nextSibling?.parentNode === parent ? nextSibling : null);
      button.hidden = true;
    });
    loginView.hidden = false;
    loginView.style.display = '';
    if (providers) providers.hidden = false;
    profilePanel.classList.remove('email-auth-open');
    profilePanel.classList.add('show-login');
  };

  emailProvider.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (providers) providers.hidden = true;
    loginView.hidden = true;
    loginView.style.display = 'none';
    profilePanel.classList.add('open', 'show-login', 'email-auth-open');
    emailPage.hidden = false;
    emailPage.style.display = 'block';
    emailPage.append(emailFormPanel);
    emailFormPanel.hidden = false;
    emailFormPanel.style.display = '';
    externalActions.forEach(({ button }) => {
      button.hidden = false;
      button.style.display = '';
    });
    emailInput?.focus();
  }, true);

  backButton.addEventListener('click', showProviders);
  externalActions.forEach(({ button }) => { button.hidden = true; });
});

document.addEventListener('DOMContentLoaded', () => {
  const editButton = document.getElementById('profile-settings-button');
  const profileScreen = document.querySelector('.profile-screen');
  if (!editButton || !profileScreen) return;

  const settingsPage = document.createElement('section');
  settingsPage.id = 'profile-settings-page';
  settingsPage.className = 'profile-settings-page';
  settingsPage.setAttribute('aria-label', 'Profile settings');
  settingsPage.innerHTML = `
    <div class="profile-settings-shell">
      <header class="profile-settings-header">
        <button class="profile-settings-back" type="button" aria-label="Back to profile">← <span>Profile</span></button>
        <div><p>YOUR ACCOUNT</p><h1>Profile settings</h1></div>
      </header>
      <section class="profile-settings-card profile-settings-appearance-card">
        <h2>Profile appearance</h2>
      </section>
      <section class="profile-settings-card">
        <h2>Public profile</h2>
        <label for="profile-settings-name">Display name</label>
        <input id="profile-settings-name" type="text" maxlength="48" autocomplete="name">
        <label for="profile-settings-handle">Handle</label>
        <input id="profile-settings-handle" type="text" maxlength="32" autocomplete="off" placeholder="@yourname">
      </section>
      <section class="profile-settings-card profile-settings-banner-card">
        <h2>Profile banner</h2>
        <p>Choose an image to personalize the top of your profile.</p>
      </section>
      <div class="profile-settings-actions">
        <button class="profile-settings-cancel" type="button">Cancel</button>
        <button class="profile-settings-save" type="button">Save changes</button>
      </div>
    </div>`;
  document.body.append(settingsPage);

  const appearanceCard = settingsPage.querySelector('.profile-settings-appearance-card');
  const profilePictureTools = profileScreen.querySelector('.profile-picture-tools');
  const timerProfileAppearance = document.querySelector('.profile-card .profile-settings-appearance');
  if (timerProfileAppearance) {
    appearanceCard.append(timerProfileAppearance);
    profileScreen.classList.add('profile-tools-managed-in-settings');
  } else if (profilePictureTools) {
    appearanceCard.append(profilePictureTools);
  }

  const bannerEditor = profileScreen.querySelector('.profile-banner-editor');
  const bannerCard = settingsPage.querySelector('.profile-settings-banner-card');
  if (bannerEditor) bannerCard.append(bannerEditor);
  else {
    const banner = profileScreen.querySelector('.profile-banner');
    const upload = document.createElement('label');
    upload.className = 'profile-settings-upload';
    upload.textContent = 'Choose banner image';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file || !banner) return;
      const reader = new FileReader();
      reader.onload = () => {
        banner.style.backgroundImage = `url("${reader.result}")`;
        try { localStorage.setItem('profile-banner-image', reader.result); } catch (_) {}
      };
      reader.readAsDataURL(file);
    });
    upload.append(fileInput);
    bannerCard.append(upload);
  }

  const nameInput = settingsPage.querySelector('#profile-settings-name');
  const handleInput = settingsPage.querySelector('#profile-settings-handle');
  const profileName = profileScreen.querySelector('.profile-page-identity h1');
  const profileHandle = profileScreen.querySelector('.profile-page-handle');
  const openPage = () => {
    nameInput.value = profileName?.textContent.trim() || localStorage.getItem('profile-display-name') || '';
    handleInput.value = (profileHandle?.textContent.trim() || localStorage.getItem('profile-handle') || '').replace(/^@/, '');
    settingsPage.classList.add('open');
    settingsPage.setAttribute('aria-hidden', 'false');
    nameInput.focus();
  };
  const closePage = () => {
    settingsPage.classList.remove('open');
    settingsPage.setAttribute('aria-hidden', 'true');
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('#profile-settings-button')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openPage();
    }
  }, true);

  settingsPage.querySelector('.profile-settings-back').addEventListener('click', closePage);
  settingsPage.querySelector('.profile-settings-cancel').addEventListener('click', closePage);
  settingsPage.querySelector('.profile-settings-save').addEventListener('click', () => {
    const name = nameInput.value.trim();
    const handle = handleInput.value.trim().replace(/^@+/, '');
    if (profileName && name) profileName.textContent = name;
    if (profileHandle && handle) profileHandle.textContent = `@${handle}`;
    try {
      localStorage.setItem('profile-display-name', name);
      localStorage.setItem('profile-handle', handle);
    } catch (_) {}
    closePage();
  });
  settingsPage.addEventListener('click', (event) => {
    if (event.target === settingsPage) closePage();
  });
});
