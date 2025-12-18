import React from 'react'
import { FaArrowsSpin } from "react-icons/fa6";

const Loading = () => {
  return (
    <div className='bg-black h-screen w-full flex-col flex justify-center items-center'>
        <span className='animate-spin '><FaArrowsSpin  className='w-10 h-10 text-white'/></span>
        <span className='text-white font-bold text-md p-2 pl-4'>Loading...</span>
    </div>
  )
}

export default Loading