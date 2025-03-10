import Style from './TextGroup.module.scss'
import CopyButton from 'share/renderer/components/CopyButton'
import copy from 'licia/copy'

interface IProps {
  title: string
  content: string
}

export default function TextGroup(props: IProps) {
  return (
    <div className={Style.group}>
      <div className={Style.title}>{props.title}</div>
      <CopyButton className={Style.copy} onClick={() => copy(props.content)} />
      <div className={Style.content}>{props.content}</div>
    </div>
  )
}
