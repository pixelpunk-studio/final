import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

interface FooterData {
  text: string;
  links: { [key: string]: { label: string; url: string } };
  social: { [key: string]: { platform: string; url: string } };
}

const socialIcons: { [key: string]: any } = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData>({
    text: "© 2024 PixelPunk Studio. Design that hits different.",
    links: {},
    social: {},
  });

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

  return (
    <footer className="py-12 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
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
                    <a
                      href={link.url}
                      className="text-gray-400 hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {footerData.social && Object.keys(footerData.social).length > 0 && (
            <div>
              <h4 className="font-bold mb-4 tracking-tight">Follow Us</h4>
              <div className="flex gap-4">
                {Object.entries(footerData.social).map(([key, social]) => {
                  const Icon = socialIcons[social.platform.toLowerCase()] || null;
                  return Icon ? (
                    <a
                      key={key}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                      aria-label={`Follow us on ${social.platform}`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>{footerData.text}</p>
        </div>
      </div>
    </footer>
  );
}
