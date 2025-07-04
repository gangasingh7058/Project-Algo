const getusertoken = () => {
    let token = localStorage.getItem('token');
    if (!token) return null;

    token = token; // Assuming format: 'Bearer xyz...'
    return token;
};

export default getusertoken;
