import { useCallback, useEffect, useState } from "react";
import { Kommune } from "../db/geonorge";
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
    setKommuner(await getKommuner());
  }, []);

  function favoriteKommune(favoritt: boolean, kommune?: Partial<Kommune>) {
    if (!kommune) {
      return;
    }
    // Add to favorites
    const updated = { ...kommune, favoritt };
    if (isKommune(updated)) {
      updateKommuneFavoritt(updated);
      updateKommuneList();
    }
  }

  useEffect(() => {
    updateKommuneList();
  }, []);

  return { kommuner, favoriteKommune };
}
