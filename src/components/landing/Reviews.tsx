import { useEffect, useState, FormEvent } from "react";
import { ref, onValue, push } from "firebase/database";
import { database } from "../../config/firebase";
import { Star } from "lucide-react";
import { sendTelegramAlert, formatReviewSubmissionAlert } from "../../services/telegram";

interface Review {
  id: string;
  username: string;
  rating: number;
  description: string;
  order: number;
  timestamp: number;
}

export default function Reviews() {
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSubmit, setLastSubmit] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const reviewsRef = ref(database, "reviews");
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reviewsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        const shuffled = reviewsArray.sort(() => 0.5 - Math.random());
        setDisplayedReviews(shuffled.slice(0, 3));
      }
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("reviews");
    if (element) observer.observe(element);

    return () => {
      unsubscribe();
      if (element) observer.unobserve(element);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const now = Date.now();
    if (now - lastSubmit < 60000) {
      setError("Please wait a minute before submitting another review.");
      return;
    }

    setLoading(true);

    try {
      const reviewsRef = ref(database, "reviews");
      await push(reviewsRef, {
        username: username.trim(),
        rating,
        description: description.trim(),
        order: now,
        timestamp: now,
      });

      await sendTelegramAlert(formatReviewSubmissionAlert({ username, rating }));

      setSuccess(true);
      setUsername("");
      setRating(5);
      setDescription("");
      setLastSubmit(now);

      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reviews" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className={`text-5xl md:text-6xl font-bold text-center mb-16 tracking-tight transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Client Reviews
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {displayedReviews.map((review, index) => (
            <div
              key={review.id}
              className={`p-8 bg-gray-50 rounded-2xl transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating ? "fill-black text-black" : "text-gray-300"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">{review.description}</p>
              <p className="font-medium">{review.username}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-150"
              aria-label="Write a review"
            >
              Write a Review
            </button>
          ) : (
            <div className="max-w-2xl mx-auto bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6 tracking-tight">Share Your Experience</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-white border border-gray-300 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-4 bg-white border border-gray-300 rounded-xl text-sm">
                    Thank you for your review!
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                    required
                    maxLength={50}
                    aria-label="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="p-2 hover:scale-110 transition-transform"
                        aria-label={`Rate ${value} stars`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            value <= rating ? "fill-black text-black" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Your Review
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
                    rows={4}
                    required
                    maxLength={500}
                    aria-label="Your review"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-black rounded-full font-medium hover:bg-black hover:text-white transition-all duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
