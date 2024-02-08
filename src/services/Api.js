import axios from 'axios';

const Api = axios.create({
  baseURL: 'https://ninja-dojo.onrender.com/'
});

export default Api;