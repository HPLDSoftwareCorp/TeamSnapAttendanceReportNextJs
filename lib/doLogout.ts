const doLogout = async () => {
  delete sessionStorage["teamsnap.authToken"];
  window.location.reload();
};

export default doLogout;
