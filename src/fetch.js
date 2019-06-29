import cookie from 'cookie';
/**
 * Todo List
 *  cookie module dependency problem -> default cookie api
 * 
 * cookie use -> option
 */
/* API requirment config*/
const isProduction = process.env.NODE_ENV === 'production';
const PROTOCOL = isProduction ? 'https' : 'http';
const HOST = isProduction ? '<mysite>' : 'localhost:8000';
const BASE_URL = PROTOCOL + '://' + HOST;

function fetch_extend(method, url, option, nocookie=true) {
  let cookies = cookie.parse(document.cookie);

  return fetch(BASE_URL + url, Object.assign({
    method: method,
    credentials: !nocookie && 'include',
    headers: {
      "X-CSRFToken": cookies["csrftoken"]
    }
  }, option));
}

function fetch_timeout(method, url, option, nocookie=true,timeout=10000) {
  let cookies = cookie.parse(document.cookie);
  return Promise.race([
    fetch(BASE_URL + url, Object.assign({
      method: method,
      credentials: !nocookie && 'include',
      headers: {
        "X-CSRFToken": cookies["csrftoken"]
      }}, option)),
    new Promise((_,reject) => setTimeout(() => reject(new Error('timeout')),timeout))
  ]);
}

function fetch_post(url,body,timeout=15000) {
  let cookies = cookie.parse(document.cookie);
  let formData = makeBody(body)

  return Promise.race([
    fetch(BASE_URL + url, Object.assign({
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        "X-CSRFToken": cookies["csrftoken"]
      }})),
    new Promise((_,reject) => setTimeout(() => reject(new Error('timeout')),timeout))
  ]);
}

function parseJson(response) {
  if (!response.ok) {
    throw new Error ("api network error:", response.status, response.statusText, response);
  }
  return response.json();
}

/**
 * json type data convert fetch body data type
 * 
 * @param {json} body 
 */
function makeBody(body) {

    let formData = new FormData();

    for(let dict in body){
      formData.append(dict,body[dict])
    }
    return formData
}

export default {
  POST: (url, option) => {return fetch_timeout('POST', url, option)},
  ex_post: (url, body) => {return fetch_post(url,body)},
  GET: (url, option, nocokie) => {return fetch_extend('GET', url, option, nocokie)},
  fetch: fetch_extend
}
