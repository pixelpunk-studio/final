import { useEffect, useState } from "react";
import { ref, onValue, set, remove, push } from "firebase/database";
import { database } from "../../../config/firebase";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { GripVertical, Plus, Trash2, Eye } from "lucide-react";
import { sendTelegramAlert, formatContentChangeAlert } from "../../../services/telegram";

interface PricingPlan {
  id: string;
  title: string;
  description: string;
  price: string;
  discount?: string;
  order: number;
}

export default function PricingEditor() {
  const [monthlyPlans, setMonthlyPlans] = useState<PricingPlan[]>([]);
  const [individualPlans, setIndividualPlans] = useState<PricingPlan[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeType, setActiveType] = useState<"monthly" | "individual">("monthly");

  useEffect(() => {
    const monthlyRef = ref(database, "pricing/monthly");
    const individualRef = ref(database, "pricing/individual");

    const unsubscribeMonthly = onValue(monthlyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const plansArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        plansArray.sort((a, b) => a.order - b.order);
        setMonthlyPlans(plansArray);
      } else {
        setMonthlyPlans([]);
      }
    });

    const unsubscribeIndividual = onValue(individualRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const plansArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        plansArray.sort((a, b) => a.order - b.order);
        setIndividualPlans(plansArray);
      } else {
        setIndividualPlans([]);
      }
    });

    return () => {
      unsubscribeMonthly();
      unsubscribeIndividual();
    };
  }, []);

  const handleAdd = async (type: "monthly" | "individual") => {
    const plansRef = ref(database, `pricing/${type}`);
    const currentPlans = type === "monthly" ? monthlyPlans : individualPlans;
    const newPlan = {
      title: "New Plan",
      description: "Plan description",
      price: "$99",
      discount: "",
      order: currentPlans.length,
    };
    await push(plansRef, newPlan);
    await sendTelegramAlert(formatContentChangeAlert("Pricing", `Added new ${type} plan`));
  };

  const handleUpdate = async (type: "monthly" | "individual", id: string, field: string, value: string) => {
    const planRef = ref(database, `pricing/${type}/${id}/${field}`);
    await set(planRef, value);
  };

  const handleDelete = async (type: "monthly" | "individual", id: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      const planRef = ref(database, `pricing/${type}/${id}`);
      await remove(planRef);
      await sendTelegramAlert(formatContentChangeAlert("Pricing", `Deleted ${type} plan`));
    }
  };

  const handleDragEnd = async (result: DropResult, type: "monthly" | "individual") => {
    if (!result.destination) return;

    const items = Array.from(type === "monthly" ? monthlyPlans : individualPlans);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    if (type === "monthly") {
      setMonthlyPlans(updates);
    } else {
      setIndividualPlans(updates);
    }

    for (const item of updates) {
      const planRef = ref(database, `pricing/${type}/${item.id}/order`);
      await set(planRef, item.order);
    }

    await sendTelegramAlert(formatContentChangeAlert("Pricing", `Reordered ${type} plans`));
  };

  const renderEditor = (plans: PricingPlan[], type: "monthly" | "individual") => (
    <DragDropContext onDragEnd={(result) => handleDragEnd(result, type)}>
      <Droppable droppableId={type}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {plans.map((plan, index) => (
              <Draggable key={plan.id} draggableId={plan.id} index={index}>
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
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={plan.title}
                          onChange={(e) => handleUpdate(type, plan.id, "title", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                          placeholder="Plan title"
                        />
                        <input
                          type="text"
                          value={plan.price}
                          onChange={(e) => handleUpdate(type, plan.id, "price", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                          placeholder="Price"
                        />
                        <textarea
                          value={plan.description}
                          onChange={(e) => handleUpdate(type, plan.id, "description", e.target.value)}
                          className="col-span-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                          rows={2}
                          placeholder="Description"
                        />
                        <input
                          type="text"
                          value={plan.discount || ""}
                          onChange={(e) => handleUpdate(type, plan.id, "discount", e.target.value)}
                          className="col-span-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                          placeholder="Discount price (optional)"
                        />
                      </div>
                      <button
                        onClick={() => handleDelete(type, plan.id)}
                        className="mt-2 p-2 text-gray-600 hover:text-red-600 transition-colors"
                        aria-label="Delete plan"
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
        <h2 className="text-2xl font-bold tracking-tight">Pricing</h2>
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
          onClick={() => setActiveType("monthly")}
          className={`px-4 py-2 rounded-full font-medium transition-all duration-150 ${
            activeType === "monthly"
              ? "bg-black text-white"
              : "border border-black hover:bg-black hover:text-white"
          }`}
        >
          Monthly Plans
        </button>
        <button
          onClick={() => setActiveType("individual")}
          className={`px-4 py-2 rounded-full font-medium transition-all duration-150 ${
            activeType === "individual"
              ? "bg-black text-white"
              : "border border-black hover:bg-black hover:text-white"
          }`}
        >
          Individual Plans
        </button>
      </div>

      {showPreview ? (
        <div className="grid md:grid-cols-3 gap-8">
          {(activeType === "monthly" ? monthlyPlans : individualPlans).slice(0, 3).map((plan) => (
            <div key={plan.id} className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{plan.title}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.discount && (
                  <span className="ml-2 text-sm text-gray-600 line-through">{plan.discount}</span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">{plan.description}</p>
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
              Add {activeType === "monthly" ? "Monthly" : "Individual"} Plan
            </button>
          </div>
          {renderEditor(activeType === "monthly" ? monthlyPlans : individualPlans, activeType)}
        </>
      )}
    </div>
  );
}
