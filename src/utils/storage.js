export const setItem = (k,v)=> localStorage.setItem(k, JSON.stringify(v));
export const getItem = (k)=> JSON.parse(localStorage.getItem(k));
