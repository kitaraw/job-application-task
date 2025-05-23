import { jwtDecode } from 'jwt-decode';
import axios from './axios';

// ----------------------------------------------------------------------

// Проверка валидности access токена
const isValidToken = (accessToken) => {
  if (!accessToken) return false;

  try {
    const decoded = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Invalid access token:', error);
    return false;
  }
};

// Таймер для удаления токена по истечению срока действия
let tokenExpirationTimer = null;

// Установка таймера для удаления токена
const handleTokenExpired = (exp) => {
  console.log('Setting token expiration:', exp);

  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  if (timeLeft > 0) {
    tokenExpirationTimer = setTimeout(() => {
      console.log('Token has expired. Removing token...');
      setSession(null); // Удаляем токен
    }, timeLeft);
  }
};

// Очистка таймера
const clearTokenExpirationTimer = () => {
  if (tokenExpirationTimer) {
    clearTimeout(tokenExpirationTimer);
    tokenExpirationTimer = null;
  }
};

// Установка или удаление токена
const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    try {
      const { exp } = jwtDecode(accessToken);
      handleTokenExpired(exp); // Устанавливаем таймер для удаления токена
    } catch (error) {
      console.error('Invalid access token during setSession:', error);
    }
  } else {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common.Authorization;
    clearTokenExpirationTimer(); // Очистка таймера при удалении токена
  }
};

export { isValidToken, setSession, clearTokenExpirationTimer };
