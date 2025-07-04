import getusertoken from "./getusertoken";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const authenticateuser=()=>{

    const navigate=useNavigate();
    const token=getusertoken();

    if(!token){
        alert("Please Sign In");
        navigate('/user/signin');
        return false;
    }

    // authenticate from backend
    

}

export default authenticateuser