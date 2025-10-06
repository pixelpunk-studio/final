import { useEffect, useState } from "react";
import { ref, onValue, set, remove, push } from "firebase/database";
import { database } from "../../../config/firebase";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { GripVertical, Plus, Trash2, Eye } from "lucide-react";
import { sendTelegramAlert, formatContentChangeAlert } from "../../../services/telegram";

interface Feature {
  id: string;
  name: string;
  description: string;
  order: number;
}

export default function FeaturesEditor() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const featuresRef = ref(database, "features");
    const unsubscribe = onValue(featuresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const featuresArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        featuresArray.sort((a, b) => a.order - b.order);
        setFeatures(featuresArray);
      } else {
        setFeatures([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    const featuresRef = ref(database, "features");
    const newFeature = {
      name: "New Feature",
      description: "Feature description",
      order: features.length,
    };
    await push(featuresRef, newFeature);
    await sendTelegramAlert(formatContentChangeAlert("Features", "Added new feature"));
  };

  const handleUpdate = async (id: string, field: string, value: string) => {
    const featureRef = ref(database, `features/${id}/${field}`);
    await set(featureRef, value);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this feature?")) {
      const featureRef = ref(database, `features/${id}`);
      await remove(featureRef);
      await sendTelegramAlert(formatContentChangeAlert("Features", "Deleted feature"));
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(features);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setFeatures(updates);

    for (const item of updates) {
      const featureRef = ref(database, `features/${item.id}/order`);
      await set(featureRef, item.order);
    }

    await sendTelegramAlert(formatContentChangeAlert("Features", "Reordered features"));
  };

  return (
    <div className="bg-white rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Features</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-black rounded-full font-medium hover:bg-black hover:text-white transition-all duration-150"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? "Edit" : "Preview"}
          </button>
          {!showPreview && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Add Feature
            </button>
          )}
        </div>
      </div>

      {showPreview ? (
        <div className="grid md:grid-cols-3 gap-8">
          {features.slice(0, 3).map((feature) => (
            <div key={feature.id} className="p-8 border border-gray-200 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.name}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="features">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {features.map((feature, index) => (
                  <Draggable key={feature.id} draggableId={feature.id} index={index}>
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
                              value={feature.name}
                              onChange={(e) => handleUpdate(feature.id, "name", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                              placeholder="Feature name"
                            />
                            <textarea
                              value={feature.description}
                              onChange={(e) =>
                                handleUpdate(feature.id, "description", e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                              rows={3}
                              placeholder="Feature description"
                            />
                          </div>
                          <button
                            onClick={() => handleDelete(feature.id)}
                            className="mt-2 p-2 text-gray-600 hover:text-red-600 transition-colors"
                            aria-label="Delete feature"
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
