import './Sidebar.scss'

export default function () {
  return (
    <div id="sidebar">
      <div className="prompt">
        <textarea placeholder="Prompt" />
      </div>
      <div className="negative-prompt">
        <textarea placeholder="Negative Prompt" />
      </div>
      <button className="generate-image button">Generate Image</button>
    </div>
  )
}
