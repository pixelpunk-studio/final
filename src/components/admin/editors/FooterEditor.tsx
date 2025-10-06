import { useEffect, useState } from "react";
import { ref, onValue, set, remove, push } from "firebase/database";
import { database } from "../../../config/firebase";
import { Plus, Trash2, Eye } from "lucide-react";
import { sendTelegramAlert, formatContentChangeAlert } from "../../../services/telegram";

interface FooterData {
  text: string;
  links: { [key: string]: { label: string; url: string } };
  social: { [key: string]: { platform: string; url: string } };
}

export default function FooterEditor() {
  const [footerData, setFooterData] = useState<FooterData>({
    text: "© 2024 PixelPunk Studio. Design that hits different.",
    links: {},
    social: {},
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const footerRef = ref(database, "footer");
    const unsubscribe = onValue(footerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFooterData(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateText = async (value: string) => {
    const textRef = ref(database, "footer/text");
    await set(textRef, value);
    await sendTelegramAlert(formatContentChangeAlert("Footer", "Updated text"));
  };

  const handleAddLink = async () => {
    const linksRef = ref(database, "footer/links");
    await push(linksRef, { label: "New Link", url: "#" });
    await sendTelegramAlert(formatContentChangeAlert("Footer", "Added link"));
  };

  const handleUpdateLink = async (id: string, field: string, value: string) => {
    const linkRef = ref(database, `footer/links/${id}/${field}`);
    await set(linkRef, value);
  };

  const handleDeleteLink = async (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      const linkRef = ref(database, `footer/links/${id}`);
      await remove(linkRef);
      await sendTelegramAlert(formatContentChangeAlert("Footer", "Deleted link"));
    }
  };

  const handleAddSocial = async () => {
    const socialRef = ref(database, "footer/social");
    await push(socialRef, { platform: "facebook", url: "#" });
    await sendTelegramAlert(formatContentChangeAlert("Footer", "Added social link"));
  };

  const handleUpdateSocial = async (id: string, field: string, value: string) => {
    const socialRef = ref(database, `footer/social/${id}/${field}`);
    await set(socialRef, value);
  };

  const handleDeleteSocial = async (id: string) => {
    if (confirm("Are you sure you want to delete this social link?")) {
      const socialRef = ref(database, `footer/social/${id}`);
      await remove(socialRef);
      await sendTelegramAlert(formatContentChangeAlert("Footer", "Deleted social link"));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Footer</h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 border border-black rounded-full font-medium hover:bg-black hover:text-white transition-all duration-150"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showPreview ? (
        <div className="bg-black text-white p-8 rounded-2xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">PixelPunk Studio</h3>
              <p className="text-gray-400 leading-relaxed">{footerData.text}</p>
            </div>
            {footerData.links && Object.keys(footerData.links).length > 0 && (
              <div>
                <h4 className="font-bold mb-4 tracking-tight">Quick Links</h4>
                <ul className="space-y-2">
                  {Object.entries(footerData.links).map(([key, link]) => (
                    <li key={key}>
                      <span className="text-gray-400">{link.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {footerData.social && Object.keys(footerData.social).length > 0 && (
              <div>
                <h4 className="font-bold mb-4 tracking-tight">Follow Us</h4>
                <div className="flex gap-4">
                  {Object.entries(footerData.social).map(([key, social]) => (
                    <div
                      key={key}
                      className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center"
                    >
                      {social.platform.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium mb-2">Footer Text</label>
            <textarea
              value={footerData.text}
              onChange={(e) => handleUpdateText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
              rows={2}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold tracking-tight">Quick Links</h3>
              <button
                onClick={handleAddLink}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-150"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>
            <div className="space-y-4">
              {footerData.links &&
                Object.entries(footerData.links).map(([id, link]) => (
                  <div key={id} className="flex items-center gap-4">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleUpdateLink(id, "label", e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      placeholder="Link label"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleUpdateLink(id, "url", e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      placeholder="URL"
                    />
                    <button
                      onClick={() => handleDeleteLink(id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      aria-label="Delete link"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold tracking-tight">Social Media</h3>
              <button
                onClick={handleAddSocial}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-150"
              >
                <Plus className="w-4 h-4" />
                Add Social
              </button>
            </div>
            <div className="space-y-4">
              {footerData.social &&
                Object.entries(footerData.social).map(([id, social]) => (
                  <div key={id} className="flex items-center gap-4">
                    <select
                      value={social.platform}
                      onChange={(e) => handleUpdateSocial(id, "platform", e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    >
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="youtube">YouTube</option>
                    </select>
                    <input
                      type="url"
                      value={social.url}
                      onChange={(e) => handleUpdateSocial(id, "url", e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      placeholder="URL"
                    />
                    <button
                      onClick={() => handleDeleteSocial(id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      aria-label="Delete social"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
