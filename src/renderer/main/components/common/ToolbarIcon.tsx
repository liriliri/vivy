import { LunaToolbarHtml } from 'luna-toolbar/react'
import LunaToolbar from 'luna-toolbar'
import { PropsWithChildren } from 'react'

interface IProps {
  icon: string
  title?: string
  toolbar?: LunaToolbar
  disabled?: boolean
  onClick: () => void
}

export default function (props: PropsWithChildren<IProps>) {
  return (
    <LunaToolbarHtml toolbar={props.toolbar} disabled={props.disabled}>
      <div className="icon">
        <span
          className={`icon-${props.icon}`}
          onClick={props.onClick}
          title={props.title || ''}
        ></span>
      </div>
    </LunaToolbarHtml>
  )
}
