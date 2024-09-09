import "./TypingLoader.css"

interface Props {
    className?: string;
}


const TypingLoader = ({ className }: Props) => {
  return (
    <div className={`typing ${ className }`}>
        <span className='circle scaling'></span>
        <span className='circle scaling'></span>
        <span className='circle scaling'></span>
      
    </div>
  )
}

export default TypingLoader
