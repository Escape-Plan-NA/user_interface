import './Tutorial.css';
import { useNavigate } from 'react-router-dom';


function Tutorial(){
    const navigate = useNavigate();
    return(
        <div className="tutorial-container">
            <button className='main-menu' onClick={()=> navigate('/')}>Main Menu</button>
        </div>
    );

}
export default Tutorial