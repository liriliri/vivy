import axios from 'axios'

export async function google(text, from: string, to: string) {
  const { data } = await axios.get(url, {
    params: {
      client: 'gtx',
      sl: language[from],
      tl: language[to],
      hl: language[to],
      ie: 'UTF-8',
      oe: 'UTF-8',
      otf: '1',
      ssel: '0',
      tsel: '0',
      kc: '7',
      q: text,
    },
  })

  let result = ''
  for (const r of data[0]) {
    if (r[0]) {
      result += r[0]
    }
  }

  return result
}

const language = {
  zhCN: 'zh-CN',
  enUS: 'en',
}

const url =
  'https://translate.google.com/translate_a/single?dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t'
