import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import BookService from "./pages/BookService";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import ExpertPage from "./pages/ExpertPage";
import Profile from "./pages/Profile";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyBookings from "./pages/Mybookings";
axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

function App() {
  return (
    <>
      <BrowserRouter>
            <ToastContainer position="top-center" />

        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/bookservice" element={<BookService />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/expert" element={<ExpertPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mybookings" element={<MyBookings />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
