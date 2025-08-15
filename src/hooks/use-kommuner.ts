import { useCallback, useEffect, useState } from "react";
import { type Kommune } from "../db/geonorge";
import { getKommuner } from "../db";
import { updateKommuneFavoritt } from "../db/db";

function isKommune(kommune: unknown): kommune is Kommune {
  if (kommune) {
    return (
      typeof (kommune as Kommune).kommunenummer === "string" &&
      typeof (kommune as Kommune).kommunenavn === "string"
    );
  }
  return false;
}

export default function useKommuner() {
  const [kommuner, setKommuner] = useState<Kommune[] | null>(null);
  const updateKommuneList = useCallback(async () => {
    const k = await getKommuner();
    k.sort((a, b) => {
      return a.kommunenavn.localeCompare(b.kommunenavn, "nb-NO");
    });
    setKommuner(k);
  }, []);

  async function favoriteKommune(
    favoritt: boolean,
    kommune?: Partial<Kommune>,
  ) {
    if (!kommune) {
      return;
    }
    // Add to favorites
    const updated = { ...kommune, favoritt };
    if (isKommune(updated)) {
      updateKommuneFavoritt(updated);
      await updateKommuneList();
    }
  }

  useEffect(() => {
    updateKommuneList();
  }, []);

  return { kommuner, favoriteKommune };
}
