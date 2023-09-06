import axios from 'axios'

export async function bing(text, from: string, to: string) {
  const { data: token } = await axios.get(tokenUrl, {
    headers: {
      'User-Agent': ua,
    },
  })

  const { data } = await axios.post(url, [{ Text: text }], {
    headers: {
      accept: '*/*',
      'accept-language':
        'zh-TW,zh;q=0.9,ja;q=0.8,zh-CN;q=0.7,en-US;q=0.6,en;q=0.5',
      authorization: 'Bearer ' + token,
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      'sec-ch-ua':
        '"Microsoft Edge";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      Referer: 'https://appsumo.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'User-Agent': ua,
    },
    params: {
      from: language[from],
      to: language[to],
      'api-version': '3.0',
      includeSentenceLength: 'true',
    },
  })

  return data[0].translations[0].text
}

const language = {
  zhCN: 'zh-Hans',
  enUS: 'en',
}

const ua =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.42'

const tokenUrl = 'https://edge.microsoft.com/translate/auth'
const url = 'https://api-edge.cognitive.microsofttranslator.com/translate'
