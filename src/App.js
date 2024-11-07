import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import BlogDetailsPage from "./pages/Blog/BlogDetailsPage";
import Layout from "./components/Layout/Layout";
import SignUp from "./pages/Auth/SignUp/SignUp";
import SignIn from "./pages/Auth/SignIn/SignIn";
import Profile from "./pages/Profile/Profile";
import Dashboard from "./pages/Dashboard/Dashboard";
import BlogPosts from "./pages/BlogPosts/BlogPosts";
import CreateBlog from "./pages/Dashboard/CreateBlog";
import EditBlog from "./pages/Dashboard/EditBlog";
import AboutPage from "./pages/About/AboutPage";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="blog/:id" element={<BlogDetailsPage />} />
          <Route path="/blogs" element={<BlogPosts />} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/dashboard/:create-blog" element={<CreateBlog/>} />
          <Route path="/edit-blog/:id" element={<EditBlog />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
