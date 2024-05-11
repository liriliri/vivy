import LunaModal from 'luna-modal/react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { IImage } from 'renderer/main/store/types'
import { notify, t } from '../../../lib/util'
import TextGroup from './TextGroup'
import { useEffect, useState } from 'react'
import { LoadingCircle } from '../../../components/loading'
import * as webui from '../../../lib/webui'
import Style from './InterrogateModal.module.scss'
import { Row, Select } from '../../../components/setting'
import store from '../../store'
import { checkInterrogateModel } from '../../lib/model'

interface IProps {
  visible: boolean
  image: IImage
  onClose: () => void
}

export default observer(function InterrogateModal(props: IProps) {
  const [prompt, setPrompt] = useState(t('interrogateHint'))
  const [isInterrogating, setIsInterrogating] = useState(false)
  const [model, setModel] = useState('clip')

  useEffect(() => {
    if (props.visible) {
      if (!isInterrogating) {
        setPrompt(t('interrogateHint'))
      }
    }
  }, [props.visible])

  const interrogate = async () => {
    if (!(await checkInterrogateModel(model))) {
      notify(t('modelMissingErr'))
      return
    }
    if (isInterrogating || !store.isWebUIReady) {
      return
    }
    setIsInterrogating(true)
    setPrompt(t('interrogating'))
    const prompt = await webui.interrogate(props.image.data, model)
    setPrompt(prompt)
    setIsInterrogating(false)
  }

  return createPortal(
    <LunaModal
      title={t('interrogate')}
      visible={props.visible}
      width={640}
      onClose={() => {
        if (!isInterrogating) {
          props.onClose()
        }
      }}
    >
      <TextGroup title={t('prompt')} content={prompt} />
      <Row className="modal-setting-row">
        <Select
          title={t('model')}
          value={model}
          options={{
            CLIP: 'clip',
            DeepBooru: 'deepdanbooru',
          }}
          onChange={(model) => setModel(model)}
        />
      </Row>
      <div className="modal-button button primary" onClick={interrogate}>
        {isInterrogating ? (
          <LoadingCircle className={Style.loading} />
        ) : (
          t('interrogate')
        )}
      </div>
    </LunaModal>,
    document.body
  )
})
