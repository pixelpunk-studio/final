import { useEffect, useState } from "react";
import { ref, onValue, set, remove, push } from "firebase/database";
import { database } from "../../../config/firebase";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { GripVertical, Plus, Trash2, Eye } from "lucide-react";
import { sendTelegramAlert, formatContentChangeAlert } from "../../../services/telegram";

interface Service {
  id: string;
  name: string;
  description: string;
  whatsappLink: string;
  order: number;
}

export default function ServicesEditor() {
  const [services, setServices] = useState<Service[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const servicesRef = ref(database, "services");
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const servicesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        servicesArray.sort((a, b) => a.order - b.order);
        setServices(servicesArray);
      } else {
        setServices([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    const servicesRef = ref(database, "services");
    const newService = {
      name: "New Service",
      description: "Service description",
      whatsappLink: "https://wa.me/",
      order: services.length,
    };
    await push(servicesRef, newService);
    await sendTelegramAlert(formatContentChangeAlert("Services", "Added new service"));
  };

  const handleUpdate = async (id: string, field: string, value: string) => {
    const serviceRef = ref(database, `services/${id}/${field}`);
    await set(serviceRef, value);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      const serviceRef = ref(database, `services/${id}`);
      await remove(serviceRef);
      await sendTelegramAlert(formatContentChangeAlert("Services", "Deleted service"));
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(services);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setServices(updates);

    for (const item of updates) {
      const serviceRef = ref(database, `services/${item.id}/order`);
      await set(serviceRef, item.order);
    }

    await sendTelegramAlert(formatContentChangeAlert("Services", "Reordered services"));
  };

  return (
    <div className="bg-white rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Services</h2>
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
              Add Service
            </button>
          )}
        </div>
      </div>

      {showPreview ? (
        <div className="grid md:grid-cols-3 gap-8">
          {services.slice(0, 3).map((service) => (
            <div key={service.id} className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{service.name}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
              <a
                href={service.whatsappLink}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium"
              >
                Learn More
              </a>
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="services">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {services.map((service, index) => (
                  <Draggable key={service.id} draggableId={service.id} index={index}>
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
                              value={service.name}
                              onChange={(e) => handleUpdate(service.id, "name", e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                              placeholder="Service name"
                            />
                            <textarea
                              value={service.description}
                              onChange={(e) =>
                                handleUpdate(service.id, "description", e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                              rows={3}
                              placeholder="Service description"
                            />
                            <input
                              type="url"
                              value={service.whatsappLink}
                              onChange={(e) =>
                                handleUpdate(service.id, "whatsappLink", e.target.value)
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                              placeholder="WhatsApp link"
                            />
                          </div>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="mt-2 p-2 text-gray-600 hover:text-red-600 transition-colors"
                            aria-label="Delete service"
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
