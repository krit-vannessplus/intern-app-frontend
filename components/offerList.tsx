"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { API_URL } from "@/utils/config";
import CreateResult from "@/components/createResult";

// ────────────────────────────────────────────────────────────
//  1.  TYPE DEFS
// ────────────────────────────────────────────────────────────
interface FilterData {
  email: string;
  gpaF: number;
  completeness: number;
  F: number;
  gpaA: number;
  done: boolean;
}

// ────────────────────────────────────────────────────────────
//  2.  COMPONENT
// ────────────────────────────────────────────────────────────
const RequestList = () => {
  /* ------------------------------------------------------------------ */
  /*  FETCHED DATA                                                      */
  /* ------------------------------------------------------------------ */
  const [filters, setFilters] = useState<FilterData[]>([]);
  const [filtered, setFiltered] = useState<FilterData[]>([]); // what we show

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /*  FILTER INPUT STATE                                                */
  /* ------------------------------------------------------------------ */
  // min – default to empty string => “ignore”
  const [minGpaF, setMinGpaF] = useState<string>("");
  const [minCompleteness, setMinCompleteness] = useState<string>("");
  const [minF, setMinF] = useState<string>("");

  // max – default to empty string => “ignore”
  const [maxGpaF, setMaxGpaF] = useState<string>("");
  const [maxCompleteness, setMaxCompleteness] = useState<string>("");
  const [maxF, setMaxF] = useState<string>("");

  /* ------------------------------------------------------------------ */
  /*  DATA FETCH                                                        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    axios
      .get(`${API_URL}/api/filters/getAllNotDone`)
      .then((res) => {
        const list: FilterData[] = Array.isArray(res.data) ? res.data : [];
        setFilters(list);
        setFiltered(list); // show everything on first load
        console.log(res.data);
      })
      .catch((err) => console.error("Error fetching filters:", err));
  }, [selectedEmail]);

  /* ------------------------------------------------------------------ */
  /*  FILTER BUTTON HANDLER                                             */
  /* ------------------------------------------------------------------ */
  const applyFilters = () => {
    const toNum = (v: string) => (v === "" ? null : Number(v));

    const minG = toNum(minGpaF),
      maxG = toNum(maxGpaF);
    const minC = toNum(minCompleteness),
      maxC = toNum(maxCompleteness);
    const minFval = toNum(minF),
      maxFval = toNum(maxF);

    const result = filters.filter((f) => {
      const passG =
        (minG === null || f.gpaF >= minG) && (maxG === null || f.gpaF <= maxG);
      const passC =
        (minC === null || f.completeness >= minC) &&
        (maxC === null || f.completeness <= maxC);
      const passF =
        (minFval === null || f.F >= minFval) &&
        (maxFval === null || f.F <= maxFval);

      return passG && passC && passF;
    });

    setFiltered(result);
  };

  /* ------------------------------------------------------------------ */
  /*  EARLY EXIT WHEN AN EMAIL IS PICKED                                */
  /* ------------------------------------------------------------------ */
  if (selectedEmail) {
    return (
      <CreateResult
        email={selectedEmail}
        backAction={() => {
          setSelectedEmail(null);
        }}
      />
    );
  }

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="max-w-xl mx-auto space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-bold">Offer List</h1>
      <div>
        {/* ── Filter Controls ───────────────────────────────── */}
        <div className="mb-4 space-y-4">
          {/* GPAF */}
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium">Min GPAF:</label>
              <input
                type="number"
                value={minGpaF}
                onChange={(e) => setMinGpaF(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Max GPAF:</label>
              <input
                type="number"
                value={maxGpaF}
                onChange={(e) => setMaxGpaF(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-1"
                placeholder="No max"
              />
            </div>
          </div>

          {/* Completeness */}
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium">
                Min Completeness:
              </label>
              <input
                type="number"
                value={minCompleteness}
                onChange={(e) => setMinCompleteness(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Max Completeness:
              </label>
              <input
                type="number"
                value={maxCompleteness}
                onChange={(e) => setMaxCompleteness(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-1"
                placeholder="No max"
              />
            </div>
          </div>

          {/* F */}
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium">Min F:</label>
              <input
                type="number"
                value={minF}
                onChange={(e) => setMinF(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Max F:</label>
              <input
                type="number"
                value={maxF}
                onChange={(e) => setMaxF(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-1"
                placeholder="No max"
              />
            </div>
          </div>

          {/* APPLY BUTTON */}
          <button
            onClick={applyFilters}
            className="mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>

        {/* ── Email List ────────────────────────────────────── */}
        <ScrollArea className="min-h-60 w-full border rounded-md bg-gray-50">
          <div className="p-4">
            {filtered.map((f) => (
              <React.Fragment key={f.email}>
                <div
                  className="cursor-pointer text-md hover:bg-gray-100 p-2 rounded"
                  onClick={() => setSelectedEmail(f.email)}
                >
                  <div>{f.email}</div>
                  <div className="text-xs text-gray-600">
                    GPAF: {f.gpaF} | GPAA: {f.gpaA} | Completeness:{" "}
                    {f.completeness} | F: {f.F}
                  </div>
                </div>
                <Separator className="my-2" />
              </React.Fragment>
            ))}

            {filtered.length === 0 && (
              <div className="text-center text-sm text-gray-500">
                No results found.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default RequestList;
