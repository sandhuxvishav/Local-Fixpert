import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import heroimg from "../assets/home-page/LoginWorker.png"; // ✅ Make sure this path is correct
import { useData } from "../Context/DataContext";
import { toast } from "react-toastify";


const ExpertLogin = () => {
  const navigate = useNavigate();
const { setUser } = useData();

  const [form, setForm] = useState({
    email: "",
    mobile: "", // using mobile as password (simple version)
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/expert/login",
        form
      );

      if (res.status === 200) {
        // ✅ Save expert data
        const expertData = res.data.expert;
        const expert = {
          ...expertData,
          name: expertData.fullName, // map fullName → name
        };
        setUser(expert);

        // localStorage.setItem("expert", JSON.stringify(res.data));

        // alert("Login successful!");
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Expert Login
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <input
  //  className="border border-gray-300 rounded-xl py-2 px-3 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
          type="text"
          name="mobile"
          placeholder="Enter Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );


  // return (
  //   <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 px-6 py-10">
  //     {/* ---------------- Left Section ---------------- */}
  //     <div className="hidden md:flex flex-col items-center justify-center w-1/2 text-center animate-fadeIn space-y-6">
  //       <img
  //         src={heroimg}
  //         alt="Login Illustration"
  //         className="w-96 drop-shadow-xl animate-float"
  //       />
  //       <h2 className="text-3xl font-bold text-gray-800">Welcome Back 👋</h2>
  //       <p className="text-gray-600 w-2/3">
  //         Log in to continue connecting with trusted local experts near you.
  //       </p>
  //     </div>

  //     {/* ---------------- Right Section (Login Form) ---------------- */}
  //     <div className="w-full md:w-1/2 max-w-md bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 sm:p-10 border border-blue-100 animate-slideUp">
  //       <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-700 mb-6">
  //         Login to Your Account
  //       </h1>

  //       <form className="space-y-5" onSubmit={handleLogin}>
  //         {/* Email Input */}
  //         <div>
  //           <label className="block text-gray-700 text-sm font-semibold mb-1">
  //             Email
  //           </label>
  //           <input
  //             className="border border-gray-300 rounded-xl py-2 px-3 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
  //             type="text"
  //             name="mobile"
  //             placeholder="your@email.com"
  //             value={form.email}
  //             onChange={handleChange}

  //             required
  //           />
  //         </div>

  //         {/* Password Input */}
  //         <div>
  //           <label className="block text-gray-700 text-sm font-semibold mb-1">
  //             Password
  //           </label>
  //           <input
  //             className="border border-gray-300 rounded-xl py-2 px-3 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
  //             type="password"
  //             placeholder=""
  //             value={form.password}
  //             onChange={(e) => setPassword(e.target.value)}
  //             required
  //           />
  //         </div>

  //         {/* Remember Me */}
  //         <div className="flex items-center justify-between">
  //           <label className="flex items-center text-sm text-gray-600">
  //             <input type="checkbox" className="mr-2 accent-blue-600" />
  //             Remember me
  //           </label>
  //         </div>

  //         {/* Login Button */}
  //         <button
  //           className="bg-blue-600 hover:bg-blue-700 w-full text-white font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-md hover:scale-[1.02]"
  //           type="submit"
  //         >
  //           Login
  //         </button>

  //         {/* Redirect to Register */}
  //         <div className="text-center text-gray-600 text-sm mt-4">
  //           Don’t have an account?{" "}
  //           <Link
  //             className="underline text-blue-600 font-medium hover:text-blue-800"
  //             to="/expert"
  //           >
  //             Register
  //           </Link>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // );
};

export default ExpertLogin;