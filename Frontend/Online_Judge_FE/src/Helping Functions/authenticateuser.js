import getusertoken from "./getusertoken";
import { useNavigate } from "react-router-dom";
import toast from './toast';

const authenticateuser=()=>{

    const navigate=useNavigate();
    const token=getusertoken();

    if(!token){
        toast.warning("Please Sign In");
        navigate('/user/signin');
        return false;
    }

    // authenticate from backend
    

}

export default authenticateuser