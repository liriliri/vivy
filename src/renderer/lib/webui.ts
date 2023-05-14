import StableDiffusionApi from 'stable-diffusion-api'
import { invokeNodeSync } from './util'

const webuiApi: StableDiffusionApi = invokeNodeSync('getWebuiApi')
console.log(webuiApi)

export default webuiApi
