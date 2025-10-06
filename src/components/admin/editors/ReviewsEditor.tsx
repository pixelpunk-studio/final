import { useEffect, useState } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { database } from "../../../config/firebase";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { GripVertical, Trash2, Eye, Star } from "lucide-react";
import { sendTelegramAlert, formatContentChangeAlert } from "../../../services/telegram";

interface Review {
  id: string;
  username: string;
  rating: number;
  description: string;
  order: number;
  timestamp: number;
}

export default function ReviewsEditor() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const reviewsRef = ref(database, "reviews");
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reviewsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        reviewsArray.sort((a, b) => a.order - a.order);
        setReviews(reviewsArray);
      } else {
        setReviews([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async (id: string, field: string, value: string | number) => {
    const reviewRef = ref(database, `reviews/${id}/${field}`);
    await set(reviewRef, value);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      const reviewRef = ref(database, `reviews/${id}`);
      await remove(reviewRef);
      await sendTelegramAlert(formatContentChangeAlert("Reviews", "Deleted review"));
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(reviews);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setReviews(updates);

    for (const item of updates) {
      const reviewRef = ref(database, `reviews/${item.id}/order`);
      await set(reviewRef, item.order);
    }

    await sendTelegramAlert(formatContentChangeAlert("Reviews", "Reordered reviews"));
  };

  return (
    <div className="bg-white rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 border border-black rounded-full font-medium hover:bg-black hover:text-white transition-all duration-150"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showPreview ? (
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="p-8 bg-gray-50 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating ? "fill-black text-black" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">{review.description}</p>
              <p className="font-medium">{review.username}</p>
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="reviews">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {reviews.map((review, index) => (
                  <Draggable key={review.id} draggableId={review.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="p-6 border border-gray-200 rounded-xl"
                      >
                        <div className="flex items-start gap-4">
                          <div {...provided.dragHandleProps} className="mt-2 cursor-grab">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <input
                              type="text"
                              value={review.username}
                              onChange={(e) => handleUpdate(review.id, "username", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                              placeholder="Username"
                            />
                            <div>
                              <label className="block text-sm font-medium mb-2">Rating</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleUpdate(review.id, "rating", value)}
                                    className="p-1 hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`w-6 h-6 ${
                                        value <= review.rating
                                          ? "fill-black text-black"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              value={review.description}
                              onChange={(e) => handleUpdate(review.id, "description", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                              rows={3}
                              placeholder="Review description"
                            />
                            <p className="text-sm text-gray-600">
                              Submitted: {new Date(review.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="mt-2 p-2 text-gray-600 hover:text-red-600 transition-colors"
                            aria-label="Delete review"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
