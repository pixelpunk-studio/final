import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";
import { Check } from "lucide-react";

interface PricingPlan {
  id: string;
  title: string;
  description: string;
  price: string;
  discount?: string;
  order: number;
}

export default function Pricing() {
  const [monthlyPlans, setMonthlyPlans] = useState<PricingPlan[]>([]);
  const [individualPlans, setIndividualPlans] = useState<PricingPlan[]>([]);
  const [isVisible, setIsVisible] = useState(false);

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
        setMonthlyPlans(plansArray.slice(0, 3));
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
        setIndividualPlans(plansArray.slice(0, 3));
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

    const element = document.getElementById("pricing");
    if (element) observer.observe(element);

    return () => {
      unsubscribeMonthly();
      unsubscribeIndividual();
      if (element) observer.unobserve(element);
    };
  }, []);

  const PricingCard = ({ plan, index }: { plan: PricingPlan; index: number }) => (
    <div
      className={`bg-white p-8 rounded-2xl border border-gray-200 hover:border-black transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${(index + 1) * 100}ms` }}
    >
      <h3 className="text-2xl font-bold mb-4 tracking-tight">{plan.title}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{plan.price}</span>
        {plan.discount && (
          <span className="ml-2 text-sm text-gray-600 line-through">{plan.discount}</span>
        )}
      </div>
      <p className="text-gray-600 leading-relaxed mb-6">{plan.description}</p>
      <button
        onClick={() =>
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
        }
        className="w-full px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-150 flex items-center justify-center gap-2"
        aria-label={`Get started with ${plan.title}`}
      >
        <Check className="w-4 h-4" />
        Get Started
      </button>
    </div>
  );

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className={`text-5xl md:text-6xl font-bold text-center mb-16 tracking-tight transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Pricing
        </h2>

        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8 tracking-tight text-center">Monthly Plans</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {monthlyPlans.map((plan, index) => (
              <PricingCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold mb-8 tracking-tight text-center">Individual Plans</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {individualPlans.map((plan, index) => (
              <PricingCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
