import React from "react";
import { RouterProvider } from "react-router/dom";
import { createBrowserRouter } from "react-router-dom";
import Signin from "./Signin";
import Navbar from "./Navbar";
import Login from "./Login";
const router = createBrowserRouter([
  { path: "/", element: <Navbar /> },
  { path: "/signin", element: <Signin /> },
  { path: "/login", element: <Login /> },
  { path: "/chat", element: <Chat /> },
]);

export default router;

