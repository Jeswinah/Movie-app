import React from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaRegCopyright } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const Fullyear = new Date().getFullYear();
  return (
    <div >
      <footer className="bg-gray-800 w-full text-gray-200 h-fit ">
        <div className="flex flex-col sm:flex-row justify-center sm:justify-around ">
          <div className="content1 flex flex-col items-center sm:my-8">
            <h3 className="text-lg sm:text-xl font-bold my-2">Legal & Policies</h3>
            <ul className="text-sm space-y-2">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        
          <div className="content3 flex flex-col justify-center items-center my-3">
            <h3 className="text-lg sm:text-xl font-semibold">Connect with me</h3>
            <div className="social_links flex gap-6 my-2">
              <a href="https://github.com/Jeswinah" className="hover:scale-110 transition-transform duration-300">
                <FaGithub className="h-6 w-6" />
              </a>
              <a href="https://www.linkedin.com/in/jeswinah/" className="hover:scale-110 transition-transform duration-300">
                <FaLinkedin className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/" className="hover:scale-110 transition-transform duration-300">
                <FaInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="cpyrt flex justify-center py-4">
          <p className="text-sm">
            Copyright <FaRegCopyright className="inline mx-1" /> {Fullyear} | Jeswin A.H
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
