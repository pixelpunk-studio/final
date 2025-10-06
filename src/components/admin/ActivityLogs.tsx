import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";
import { Clock } from "lucide-react";

interface Log {
  id: string;
  action: string;
  section: string;
  timestamp: number;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const logsRef = ref(database, "activityLogs");
    const unsubscribe = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        logsArray.sort((a, b) => b.timestamp - a.timestamp);
        setLogs(logsArray);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6 tracking-tight">Activity Logs</h2>
      <div className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-gray-600">No activity logs yet.</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl"
            >
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">
                  {log.section} - {log.action}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
