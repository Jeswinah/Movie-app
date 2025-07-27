import React from "react";
import { FaStar } from "react-icons/fa";
const Card = ({ title, img, vote }) => {
  const result = Math.floor(vote * 10) / 10;

  return (
    <div>
      <div className="container  rounded-lg shadow-md shadow-gray-300 hover:cursor-pointer  h-full w-full ">
        <div className="img ">
          <img src={img} className="rounded-md w-full h-full" />
        </div>
        <div className="content  py-3 flex justify-between mx-2 ">
          <h3 className="font-bold text-center">{title}</h3>
          <p className="flex items-center mx-2">
            <FaStar className="text-yellow-600 mr-1" />
            {result}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;