import { useEffect, useState } from "react";
import axios from "axios"; // ✅ use axios directly

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!storedUser?._id) {
          console.error("User not found");
          setLoading(false);
          return;
        }

        // ✅ axios instead of api
        const res = await axios.get(
          `http://localhost:3000/bookservice/mybookings/${storedUser._id}`
        );

        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error("❌ Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">Loading your bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-center mb-6">
        My Bookings
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white shadow-md rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all"
          >
            <h3 className="text-xl font-semibold text-blue-600 mb-2">
              {booking.serviceType || "Service"}
            </h3>

            <p>
              <strong>Date:</strong> {booking.date}
            </p>

            <p>
              <strong>Time:</strong> {booking.time}
            </p>

            <p>
              <strong>Location:</strong> {booking.location}
            </p>

            <p>
              <strong>Mobile:</strong> {booking.mobile}
            </p>

            <p>
              <strong>Payment:</strong> {booking.payment}
            </p>

            <p className="mt-2">
              <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                pending
              </span>
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Booked on{" "}
              {new Date(booking.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}