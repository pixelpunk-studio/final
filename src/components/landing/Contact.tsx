import { useState, FormEvent } from "react";
import { ref, push } from "firebase/database";
import { database } from "../../config/firebase";
import { Mail, Phone, User, MessageSquare } from "lucide-react";
import { sendTelegramAlert, formatContactSubmissionAlert } from "../../services/telegram";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [lastSubmit, setLastSubmit] = useState(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const now = Date.now();
    if (now - lastSubmit < 60000) {
      setError("Please wait a minute before submitting another message.");
      return;
    }

    setLoading(true);

    try {
      const contactRef = ref(database, "contacts");
      await push(contactRef, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        description: description.trim(),
        timestamp: now,
      });

      await sendTelegramAlert(formatContactSubmissionAlert({ name, email, phone }));

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setDescription("");
      setLastSubmit(now);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 tracking-tight">
          Get In Touch
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded-xl text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded-xl text-sm">
              Thank you! We'll get back to you soon.
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                required
                maxLength={100}
                aria-label="Your name"
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                required
                aria-label="Your email"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                required
                aria-label="Your phone number"
                autoComplete="tel"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Message
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
                rows={5}
                required
                maxLength={1000}
                aria-label="Your message"
                autoComplete="off"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
