import LunaPainter from 'luna-painter/react'

export default function Painter() {
  return (
    <LunaPainter
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
      width={512}
      height={512}
    />
  )
}
