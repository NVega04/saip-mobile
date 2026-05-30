import { useState } from "react";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.0.2.2:8000";

export function useReportDownload() {
  const [loading, setLoading] = useState(false);

  const download = async (entity: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("session_token");
      const url = `${API_URL}/reports/${entity}`;

      const outputFile = new File(Paths.cache, `reporte_${entity}_${Date.now()}.xlsx`);

      await File.downloadFileAsync(url, outputFile, {
        headers: { "session-token": token ?? "" },
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(outputFile.uri, {
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { download, loading };
}
