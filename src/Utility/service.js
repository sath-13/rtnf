import Cookies from "js-cookie";

const isLoggedIn = () => {
  return localStorage.getItem("userID") || false;
};


const getUserID = () => {
  return getUser()?.id || null;
};

const getUserEmail = () => {
  return getUser()?.email || null;
};

const getUserRole = () => {
  return getUser()?.role || null;
};

const getUserToken = () => {
  return localStorage.getItem('token');
};

const getUserTeamID = () => {
  return getUser()?.teamId || null;
};


const getUser = () => {
  return JSON.parse(localStorage.getItem("user")) || {};
};



const clearAllCookies = ()=>{
  const allCookies = Cookies.get();
  for (const cookieName in allCookies) {
    Cookies.remove(cookieName);
  }
};

const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  clearAllCookies();
};

/*
const getUserTeamID = () => {
  return localStorage.getItem('userTeamId');
};
*/

const getUserTeamAccessStatus = () => {
  const checkAccess = localStorage.getItem('userTeamAccess');
  return checkAccess === 'true' ? true : false;
};

const getCompId = () => {
  return localStorage.getItem('compId');
};

const getUserSelectedTheme = () => {
  return localStorage.getItem('theme') || 'light';
};

const logoutUserAndRedirect = () => {
  localStorage.clear();
  setTimeout(() => {
    window.location.href = '/login';
  }, 700);
};

export {
  getUserID,
  getUserEmail,
  getUserToken,
  getUserRole,
  isLoggedIn,
  logout,
  getUserTeamID,
  getUserTeamAccessStatus,
  getCompId,
  getUserSelectedTheme,
  logoutUserAndRedirect,
};
