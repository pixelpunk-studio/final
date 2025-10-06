import { useEffect, useState } from "react";
import { ref, onValue, set, remove, push } from "firebase/database";
import { database } from "../../../config/firebase";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { GripVertical, Plus, Trash2, Eye } from "lucide-react";
import { sendTelegramAlert, formatContentChangeAlert } from "../../../services/telegram";

interface PortfolioItem {
  id: string;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  type: "graphic" | "video";
  order: number;
}

function extractDriveFileId(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const fileIndex = parts.indexOf("d");
    if (parts.includes("file") && fileIndex !== -1 && parts[fileIndex + 1]) {
      return parts[fileIndex + 1];
    }
    const idParam = u.searchParams.get("id");
    if (idParam) return idParam;
    return null;
  } catch {
    return null;
  }
}

function driveThumbnailUrl(id: string, size: number = 800): string {
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
}

function normalizeDriveImageUrl(url?: string): string | undefined {
  if (!url) return url;
  if (!/(^https?:\/\/)?(drive\.google\.com|docs\.google\.com)/i.test(url)) return url;
  const id = extractDriveFileId(url);
  return id ? driveThumbnailUrl(id) : url;
}

export default function PortfolioEditor() {
  const [graphics, setGraphics] = useState<PortfolioItem[]>([]);
  const [videos, setVideos] = useState<PortfolioItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeType, setActiveType] = useState<"graphic" | "video">("graphic");

  useEffect(() => {
    const portfolioRef = ref(database, "portfolio");
    const unsubscribe = onValue(portfolioRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const portfolioArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        const graphicsData = portfolioArray
          .filter((item) => item.type === "graphic")
          .sort((a, b) => a.order - b.order);

        const videosData = portfolioArray
          .filter((item) => item.type === "video")
          .sort((a, b) => a.order - b.order);

        setGraphics(graphicsData);
        setVideos(videosData);
      } else {
        setGraphics([]);
        setVideos([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async (type: "graphic" | "video") => {
    const portfolioRef = ref(database, "portfolio");
    const currentItems = type === "graphic" ? graphics : videos;
    const newItem = {
      title: `New ${type === "graphic" ? "Graphic" : "Video"}`,
      [type === "graphic" ? "imageUrl" : "videoUrl"]: "",
      type,
      order: currentItems.length,
    };
    await push(portfolioRef, newItem);
    await sendTelegramAlert(formatContentChangeAlert("Portfolio", `Added new ${type}`));
  };

  const handleUpdate = async (id: string, field: string, value: string) => {
    const itemRef = ref(database, `portfolio/${id}/${field}`);
    await set(itemRef, value);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const itemRef = ref(database, `portfolio/${id}`);
      await remove(itemRef);
      await sendTelegramAlert(formatContentChangeAlert("Portfolio", "Deleted item"));
    }
  };

  const handleDragEnd = async (result: DropResult, type: "graphic" | "video") => {
    if (!result.destination) return;

    const items = Array.from(type === "graphic" ? graphics : videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    if (type === "graphic") {
      setGraphics(updates);
    } else {
      setVideos(updates);
    }

    for (const item of updates) {
      const itemRef = ref(database, `portfolio/${item.id}/order`);
      await set(itemRef, item.order);
    }

    await sendTelegramAlert(formatContentChangeAlert("Portfolio", `Reordered ${type}s`));
  };

  const renderEditor = (items: PortfolioItem[], type: "graphic" | "video") => (
    <DragDropContext onDragEnd={(result) => handleDragEnd(result, type)}>
      <Droppable droppableId={type}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
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
                          value={item.title}
                          onChange={(e) => handleUpdate(item.id, "title", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                          placeholder="Title"
                        />
                        <input
                          type="url"
                          value={type === "graphic" ? item.imageUrl : item.videoUrl}
                          onChange={(e) =>
                            handleUpdate(
                              item.id,
                              type === "graphic" ? "imageUrl" : "videoUrl",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                          placeholder={`${type === "graphic" ? "Image" : "Video"} URL`}
                        />
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="mt-2 p-2 text-gray-600 hover:text-red-600 transition-colors"
                        aria-label="Delete item"
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
  );

  return (
    <div className="bg-white rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Portfolio</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-black rounded-full font-medium hover:bg-black hover:text-white transition-all duration-150"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveType("graphic")}
          className={`px-4 py-2 rounded-full font-medium transition-all duration-150 ${
            activeType === "graphic"
              ? "bg-black text-white"
              : "border border-black hover:bg-black hover:text-white"
          }`}
        >
          Graphics
        </button>
        <button
          onClick={() => setActiveType("video")}
          className={`px-4 py-2 rounded-full font-medium transition-all duration-150 ${
            activeType === "video"
              ? "bg-black text-white"
              : "border border-black hover:bg-black hover:text-white"
          }`}
        >
          Videos
        </button>
      </div>

      {showPreview ? (
        <div className="grid md:grid-cols-3 gap-8">
          {(activeType === "graphic" ? graphics : videos).slice(0, 3).map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden border border-gray-200">
              {activeType === "graphic" ? (
                <img src={normalizeDriveImageUrl(item.imageUrl)} alt={item.title} className="w-full aspect-square object-cover" />
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <p className="font-medium">{item.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <button
              onClick={() => handleAdd(activeType)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Add {activeType === "graphic" ? "Graphic" : "Video"}
            </button>
          </div>
          {activeType === "graphic" ? renderEditor(graphics, "graphic") : renderEditor(videos, "video")}
        </>
      )}
    </div>
  );
}
