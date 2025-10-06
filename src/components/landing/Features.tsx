import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";

interface Feature {
  id: string;
  name: string;
  description: string;
  order: number;
}

export default function Features() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isVisible, setIsVisible] = useState(false);

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
        setFeatures(featuresArray.slice(0, 3));
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

    const element = document.getElementById("features");
    if (element) observer.observe(element);

    return () => {
      unsubscribe();
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className={`text-5xl md:text-6xl font-bold text-center mb-16 tracking-tight transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Why Choose Us
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`p-8 border border-gray-200 rounded-2xl hover:border-black transition-all duration-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.name}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
