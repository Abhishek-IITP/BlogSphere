import { useState } from "react";

const InputField = ({ type = "text", placeholder, onChange, value, icon }) => {
    const[ showPassword, setShowPassword] = useState(false) 
  return (
      <div className="relative w-full">
        <i className={"fi " +
          icon +
          " absolute top-3.5 left-3 opacity-40 "}></i>
      <input
        type={type !== "password" ? type :(showPassword? "text": "password")}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 px-3 pl-10 text-black bg-white rounded-full text-base focus:outline-none"
        />
        {
          type==="password"?<i
          onClick={()=>setShowPassword((prev)=> !prev)}
           className={`fi ${ showPassword? "fi-sr-eye":"fi-sr-eye-crossed"  } cursor-pointer absolute top-3.5 right-6 opacity-40`}></i> : " "
        }
        </div>
    );
  };
  
  export default InputField;
  