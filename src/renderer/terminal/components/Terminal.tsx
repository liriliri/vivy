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
import 'xterm/css/xterm.css'
import { invokeMain, ipcOnEvent } from '../../lib/util'
import isDarkMode from 'licia/isDarkMode'

export default observer(function () {
  const termRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = new Terminal({
      allowProposedApi: true,
      fontSize: 14,
      fontFamily: 'mono, courier-new, courier, monospace',
      theme: {
        background: isDarkMode() ? '#141414' : '#ffffff',
      },
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
    invokeMain('getLogs').then((logs: string[]) => {
      each(logs, (log) => write(log))
    })
    ipcOnEvent('addLog', (event, log) => write(log))

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
