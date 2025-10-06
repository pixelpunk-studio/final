import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";
import { ArrowRight } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  whatsappLink: string;
  order: number;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isVisible, setIsVisible] = useState(false);

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
        setServices(servicesArray.slice(0, 3));
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

    const element = document.getElementById("services");
    if (element) observer.observe(element);

    return () => {
      unsubscribe();
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className={`text-5xl md:text-6xl font-bold text-center mb-16 tracking-tight transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Our Services
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`bg-white p-8 rounded-2xl hover:scale-105 transition-all duration-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{service.name}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
              <a
                href={service.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-150"
                aria-label={`Learn more about ${service.name}`}
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
