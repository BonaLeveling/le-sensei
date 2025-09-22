import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Signin from "./Signin";
import Search1 from "./Search1";
import Login from "./Login";
import Chat from "./Chat";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={
          <>
          <div className="bg-[url('/bg1.jpg')] bg-center bg-cover bg-no-repeat h-screen w-screen absolute">
            <div className="bg-[rgba(0,0,0,0.1)] h-screen w-screen">
              <Navbar />
              <Search1 />
            </div>
          </div>
          </>
        } />
        <Route path="/signin" element={<Signin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat/>} />
      </Routes>

    </>
  );
}

export default App;

