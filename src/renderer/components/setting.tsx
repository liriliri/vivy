import { PropsWithChildren } from 'react'
import className from 'licia/className'
import Style from './setting.module.scss'
import types from 'licia/types'
import map from 'licia/map'
import toNum from 'licia/toNum'

export function Row(props: PropsWithChildren) {
  return <div className={Style.row}>{props.children}</div>
}

interface ISelectProps {
  title: string
  options: types.PlainObj<string>
  value: string
  onChange: (val: string) => void
}

export function Select(props: ISelectProps) {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (props.onChange) {
      props.onChange(e.target.value)
    }
  }

  const options = map(props.options, (val, key) => {
    return <option value={val}>{key}</option>
  })

  return (
    <div className={className(Style.item, Style.itemSelect)}>
      <div className={Style.title}>{props.title}</div>
      <div className={Style.control}>
        <div className={Style.select}>
          <select onChange={onChange} value={props.value}>
            {options}
          </select>
        </div>
      </div>
    </div>
  )
}

interface INumberProps {
  title: string
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  range?: boolean
}

export function Number(props: INumberProps) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      props.onChange(toNum(e.target.value))
    }
  }

  const max = props.max || Infinity
  const min = props.min || 0
  let input = (
    <input
      type={props.range ? 'range' : 'number'}
      value={props.value}
      onChange={onChange}
      min={min}
      max={max}
    />
  )

  if (props.range) {
    input = (
      <div className={Style.control}>
        {min}
        <div className={Style.rangeContainer}>
          <div className={Style.rangeTrack}>
            <div className={Style.rangeTrackBar}>
              <div
                className={Style.rangeTrackProgress}
                style={{ width: `${progress(props.value, min, max)}%` }}
              ></div>
            </div>
          </div>
          {input}
        </div>
        {`${props.value}/${max}`}
      </div>
    )
  } else {
    input = <div className={Style.control}>{input}</div>
  }

  return (
    <div className={className(Style.item, Style.itemNumber)}>
      <div className={Style.title}>{props.title}</div>
      {input}
    </div>
  )
}

const progress = (val: number, min: number, max: number) => {
  return (((val - min) / (max - min)) * 100).toFixed(2)
}
