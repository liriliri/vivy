import LunaModal from 'luna-modal/react'
import LunaCropper from 'luna-cropper/react'
import Cropper from 'luna-cropper'
import { createPortal } from 'react-dom'
import { IImage } from '../../store/types'
import { t } from 'common/util'
import { useRef } from 'react'
import dataUrl from 'licia/dataUrl'

interface IProps {
  visible: boolean
  image: IImage
  onClose: () => void
  onCrop: (canvas: HTMLCanvasElement) => void
}

export default function CropModal(props: IProps) {
  const { image } = props
  const cropperRef = useRef<Cropper>(null)

  const crop = () => {
    const canvas = cropperRef.current!.getCanvas()
    props.onCrop(canvas)
    props.onClose()
  }

  return createPortal(
    <LunaModal
      title={t('crop')}
      visible={props.visible}
      width={640}
      onClose={props.onClose}
    >
      <LunaCropper
        image={dataUrl.stringify(image.data, image.info.mime)}
        style={{ height: 400 }}
        onCreate={(cropper) => (cropperRef.current = cropper)}
      />
      <div className="modal-button button primary" onClick={crop}>
        {t('crop')}
      </div>
    </LunaModal>,
    document.body
  )
}
