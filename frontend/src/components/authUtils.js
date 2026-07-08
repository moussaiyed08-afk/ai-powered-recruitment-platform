// authUtils.js
export const getConnectedUser = () => {
    const id = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (!id) return null;
    return { id, role };
};