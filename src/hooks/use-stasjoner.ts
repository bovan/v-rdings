import { useCallback, useEffect, useState } from "react";
import { selectFavorittKommuner, updateSourceFavoritt } from "../db/db";
import { Stasjon } from "../db/frost";
import { getStasjoner } from "../db";

export function isStasjon(stasjon: unknown): stasjon is Stasjon {
  if (stasjon) {
    return (
      typeof (stasjon as Stasjon).id === "string" &&
      typeof (stasjon as Stasjon).name === "string"
    );
  }
  return false;
}

export default function useStasjoner() {
  const [stasjoner, setStasjoner] = useState<Stasjon[] | null>(null);
  const [favorittStasjoner, setFavorittStasjoner] = useState<Stasjon[]>([]);
  const updateStasjoner = useCallback(async () => {
    const kommuner = selectFavorittKommuner();
    const data = await Promise.all(
      kommuner.map((k) => getStasjoner(k.kommunenavn)),
    );
    const allStasjoner = data.flat();
    setStasjoner(allStasjoner);

    const favoritter = allStasjoner?.filter((s) => s.favoritt) ?? [];
    setFavorittStasjoner(favoritter);
  }, []);

  function setFavoriteStasjon(favoritt: boolean, stasjon?: Partial<Stasjon>) {
    if (!stasjon) {
      return;
    }
    // Add to favorites
    const updated = { ...stasjon, favoritt };
    if (isStasjon(updated)) {
      updateSourceFavoritt(updated);
      updateStasjoner();
    }
  }

  useEffect(() => {
    if (stasjoner === null) {
      updateStasjoner();
    }
  }, []);

  return { stasjoner, favorittStasjoner, setFavoriteStasjon };
}
