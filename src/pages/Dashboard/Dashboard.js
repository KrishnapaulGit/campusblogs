import React from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Profile from "../Profile/Profile";
import UserBlogs from "./UserBlogs";


const Dashboard = () => {
  return (
    <>
    <Profile />
    <UserBlogs/>
  </>
  );
};

export default Dashboard;
