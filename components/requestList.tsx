"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { API_URL } from "@/utils/config";
import CreateOffer from "./createOffer";

const RequestList = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/requests/getNotOffered`)
      .then((response) => {
        // Ensure that response.data.emails is an array.
        const fetchedEmails = Array.isArray(response.data.emails)
          ? response.data.emails
          : []; // Fallback if not an array.
        setEmails(fetchedEmails);
        console.log("Fetched emails:", fetchedEmails);
      })
      .catch((error) => {
        console.error("Error fetching emails:", error);
      });
  }, [selectedEmail]);

  if (selectedEmail) {
    return (
      <CreateOffer email={selectedEmail} back={() => setSelectedEmail(null)} />
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-bold">Request List</h1>
      <ScrollArea className="min-h-60 w-full border rounded-md bg-gray-50">
        <div className="p-4">
          {emails.map((email) => (
            <React.Fragment key={email}>
              <div className="text-md" onClick={() => setSelectedEmail(email)}>
                {email}
              </div>
              <Separator className="my-2" />
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RequestList;
