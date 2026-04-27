import React from 'react'
import { FaArrowsSpin } from "react-icons/fa6";

const Loading = () => {
  return (
    <div className='h-screen w-full flex-col flex justify-center items-center bg-[radial-gradient(circle_at_30%_20%,rgba(229,9,20,0.22),transparent_35%),linear-gradient(180deg,#090909_0%,#0a0f16_100%)]'>
        <span className='animate-spin'><FaArrowsSpin className='w-12 h-12 text-[#8c4123]'/></span>
        <span className='display-title text-white text-3xl tracking-wider mt-3'>Loading</span>
        <span className='text-white/70 font-semibold text-sm'>Fetching latest Movies or Series...</span>
    </div>
  )
}

export default Loading