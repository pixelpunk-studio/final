import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "../../../config/firebase";
import { Trash2, Mail, Phone, User, MessageSquare } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  timestamp: number;
}

export default function ContactsViewer() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const contactsRef = ref(database, "contacts");
    const unsubscribe = onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contactsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        contactsArray.sort((a, b) => b.timestamp - a.timestamp);
        setContacts(contactsArray);
      } else {
        setContacts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact submission?")) {
      const contactRef = ref(database, `contacts/${id}`);
      await remove(contactRef);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6 tracking-tight">Contact Submissions</h2>
      <div className="space-y-4">
        {contacts.length === 0 ? (
          <p className="text-gray-600">No contact submissions yet.</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="p-6 border border-gray-200 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{contact.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-gray-600 hover:text-black"
                    >
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-gray-600 hover:text-black"
                    >
                      {contact.phone}
                    </a>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(contact.timestamp).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  aria-label="Delete contact"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                <p className="text-gray-600 leading-relaxed">{contact.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
