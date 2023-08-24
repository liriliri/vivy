import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebglAddon } from 'xterm-addon-webgl'
import { CanvasAddon } from 'xterm-addon-canvas'
import { Unicode11Addon } from 'xterm-addon-unicode11'
import each from 'licia/each'
import replaceAll from 'licia/replaceAll'
import Style from './Terminal.module.scss'
import { colorBgContainer, colorBgContainerDark } from '../../../common/theme'
import 'xterm/css/xterm.css'

export default observer(function () {
  const termRef = useRef<HTMLDivElement>(null)

  let theme = {
    background: colorBgContainer,
    foreground: 'rgba(0, 0, 0, 0.88)',
  }

  if (document.body.classList.contains('-theme-with-dark-background')) {
    theme = {
      background: colorBgContainerDark,
      foreground: 'rgba(255, 255, 255, 0.85)',
    }
  }

  useEffect(() => {
    const term = new Terminal({
      allowProposedApi: true,
      fontSize: 14,
      fontFamily: 'mono, courier-new, courier, monospace',
      theme: theme,
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(new Unicode11Addon())
    term.unicode.activeVersion = '11'
    try {
      term.loadAddon(new WebglAddon())
    } catch (e) {
      term.loadAddon(new CanvasAddon())
    }
    term.open(termRef.current!)
    const write = (log: string) => {
      term.write(replaceAll(log, '\n', '\r\n'))
    }
    const fit = () => fitAddon.fit()
    fit()

    window.addEventListener('resize', fit)
    main.getLogs().then((logs: string[]) => {
      each(logs, (log) => write(log))
    })
    main.on('addLog', (event, log) => write(log))

    return () => {
      term.dispose()
      window.removeEventListener('resize', fit)
    }
  }, [])

  return (
    <div className={Style.terminalContainer}>
      <div className={Style.terminal} ref={termRef} />
    </div>
  )
})
