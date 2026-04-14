import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ExpertReviews() {
  const { expertId } = useParams();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/bookservice/reviews/${expertId}`)
      .then((res) => setReviews(res.data.reviews))
      .catch(console.log);
  }, [expertId]);

  return (
    <div className="max-w-3xl mx-auto mt-24 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Customer Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-400">No reviews yet</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white p-4 rounded-xl shadow border">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">{r.userId?.name || "User"}</h4>

                <span className="text-yellow-500">
                  {booking.isRated && (
                    <span className="text-yellow-500 text-sm">Rated</span>
                  )}
                </span>
              </div>

              {r.review && (
                <p className="text-sm text-gray-600 mt-2">{r.review}</p>
              )}

              <p className="text-xs text-gray-400 mt-2">
                {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
